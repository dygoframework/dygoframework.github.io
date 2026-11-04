---
title: NATS
description: Serve and call Dygo message handlers over NATS with the micro/nats module.
---

The `github.com/dygoframework/dygo/micro/nats` module carries the app's message handlers over NATS. Patterns are NATS subjects, so wildcards such as `orders.*` and `audit.>` work.

```go
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
```

- `Queue` is the queue group. Instances in the same group share the messages. Leave it empty to send every message to every instance.
- `Concurrency` limits how many messages are handled at once. The default is 100.
- `nats.ClientModule` provides a `*micro.Client`. It connects when the client is built and closes at shutdown.

Call a handler from another service:

```go
u, err = micro.Send[*User](ctx, client, "users.get", GetUser{ID: 7})
```
