package examples

import (
	"context"
	"testing"
	"time"

	"github.com/dygoframework/dygo"
	"github.com/dygoframework/dygo/micro"
	"github.com/dygoframework/dygo/micro/nats"
	"github.com/nats-io/nats-server/v2/server"
	natstest "github.com/nats-io/nats-server/v2/test"
)

type GetUser struct {
	ID int `json:"id"`
}

type User struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type UsersHandlers struct{}

func (h *UsersHandlers) Patterns(r micro.Router) {
	r.Message("users.get", micro.Handle(h.get))
}

func (h *UsersHandlers) get(_ context.Context, in GetUser) (*User, error) {
	return &User{ID: in.ID, Name: "Ada"}, nil
}

func UsersService(url string) *dygo.Module {
	return &dygo.Module{
		Name:      "users",
		Providers: []dygo.Provider{dygo.Value(&UsersHandlers{})}, // found by their Patterns method
		Imports:   []*dygo.Module{nats.ClientModule(nats.ClientOptions{URL: url})},
	}
}

func serveOverNATS(ctx context.Context, app *dygo.HTTPApp, url string) error {
	app.ConnectMicroservice(nats.NewServer(nats.Options{URL: url, Queue: "users"}))
	return app.Listen(ctx, ":0") // HTTP and NATS in one process
}

func TestNATS(t *testing.T) {
	opts := natstest.DefaultTestOptions
	opts.Port = server.RANDOM_PORT
	ns := natstest.RunServer(&opts)
	defer ns.Shutdown()
	url := ns.ClientURL()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	app, err := dygo.Create(ctx, UsersService(url))
	if err != nil {
		t.Fatal(err)
	}
	served := make(chan error, 1)
	go func() { served <- serveOverNATS(ctx, app, url) }()

	client := dygo.MustGet[*micro.Client](app)
	var u *User
	for range 50 { // the server subscribes in the background
		if u, err = micro.Send[*User](ctx, client, "users.get", GetUser{ID: 7}); err == nil {
			break
		}
		time.Sleep(20 * time.Millisecond)
	}
	if err != nil || u.Name != "Ada" || u.ID != 7 {
		t.Fatalf("Send = %+v, %v", u, err)
	}
	cancel()
	<-served
}
