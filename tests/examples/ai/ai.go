// Package ai holds the AI examples on the Home page, taken from the Dygo AI
// guide (docs/guide-ai.md), so they keep compiling.
package ai

import (
	"context"

	"github.com/dygoframework/dygo"
	"github.com/dygoframework/dygo/ai"
)

// Set up

type Service struct{ model ai.Model }

func NewService(m ai.Model) *Service { return &Service{model: m} }

func (s *Service) Summary(ctx context.Context, text string) (string, error) {
	return ai.Ask(ctx, s.model, "Summarize in two sentences: "+text)
}

// Typed output

type Ticket struct {
	Title    string `json:"title" description:"A short title"`
	Priority string `json:"priority" validate:"oneof=low medium high"`
}

func (s *Service) Ticket(ctx context.Context, email string) (Ticket, error) {
	t, err := ai.Generate[Ticket](ctx, s.model, ai.Prompt("Make a ticket from: "+email))
	return t, err
}

// Streaming

type Controller struct{ model ai.Model }

func NewController(m ai.Model) *Controller { return &Controller{model: m} }

type AskIn struct {
	Body struct {
		Question string `json:"question"`
	} `body:"json"`
}

func (c *Controller) Routes(r dygo.Router) {
	r.Post("/ask", dygo.Handle(c.ask))
}

func (c *Controller) ask(ctx context.Context, in AskIn) (dygo.Responder, error) {
	return ai.SSE(c.model.Stream(ctx, ai.Prompt(in.Body.Question))), nil
}
