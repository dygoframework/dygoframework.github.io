package ai

import (
	"context"
	"testing"

	"github.com/dygoframework/dygo/ai"
	"github.com/dygoframework/dygo/ai/fake"
)

func TestSummary(t *testing.T) {
	s := NewService(fake.New(fake.Reply("Short.")))
	got, err := s.Summary(context.Background(), "A long text.")
	if err != nil || got != "Short." {
		t.Fatalf("Summary = %q, %v", got, err)
	}
}

func TestTicket(t *testing.T) {
	s := NewService(fake.New(fake.Reply(`{"title":"Login fails","priority":"high"}`)))
	got, err := s.Ticket(context.Background(), "I can't log in.")
	if err != nil || got.Title != "Login fails" || got.Priority != "high" {
		t.Fatalf("Ticket = %+v, %v", got, err)
	}
}

var _ ai.Model = fake.New()
