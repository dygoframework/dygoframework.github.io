package examples

import (
	"context"
	"iter"
	"strconv"
	"strings"
	"testing"
	"time"

	"github.com/dygoframework/dygo"
	"github.com/dygoframework/dygo/dygotest"
)

type Price struct {
	Symbol string  `json:"symbol"`
	Value  float64 `json:"value"`
}

type PricesController struct{}

func (c *PricesController) Routes(r dygo.Router) {
	r.Get("/prices", dygo.HandleNoInput(c.Stream))
}

func (c *PricesController) Stream(ctx context.Context) (dygo.Responder, error) {
	prices := []Price{{"DYG", 1.5}, {"DYG", 1.6}}
	return dygo.SSE(iter.Seq[any](func(yield func(any) bool) {
		for i, p := range prices {
			ev := dygo.SSEEvent{ID: strconv.Itoa(i + 1), Event: "price", Data: p, Retry: 3 * time.Second}
			if !yield(ev) {
				return // the client went away
			}
		}
		yield("done") // a plain value is sent as a data-only event
	})), nil
}

var PricesModule = &dygo.Module{
	Name:        "prices",
	Controllers: []dygo.Provider{dygo.Value(&PricesController{})},
}

func TestServerSentEvents(t *testing.T) {
	res := dygotest.New(PricesModule).CompileHTTP(t).GET("/prices").Do(t).Status(t, 200)
	if ct := res.Header.Get("Content-Type"); ct != "text/event-stream" {
		t.Fatalf("Content-Type = %q", ct)
	}
	want := "id: 1\nevent: price\nretry: 3000\ndata: {\"symbol\":\"DYG\",\"value\":1.5}\n\n"
	if !strings.HasPrefix(res.Text(), want) {
		t.Fatalf("stream starts with %q, want %q", res.Text(), want)
	}
	if !strings.HasSuffix(res.Text(), "data: done\n\n") {
		t.Fatalf("stream ends with %q", res.Text())
	}
}
