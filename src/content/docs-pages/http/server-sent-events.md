---
title: Server-Sent Events
description: Stream events to the browser with dygo.SSE and an iterator.
---

Return `dygo.SSE(seq)` from a handler to stream `text/event-stream`. Each value is JSON encoded, and strings are sent as they are. Yield a `dygo.SSEEvent` to set the event's `ID`, `Event` name or `Retry` time.

```go
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
```

The stream ends when the sequence ends, the client disconnects or the server shuts down. A sequence that can block for a long time should also watch `ctx` or `dygo.Stopping(ctx)`. `middleware.Compress` leaves SSE streams alone.
