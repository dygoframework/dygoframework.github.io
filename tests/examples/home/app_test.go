package main

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/dygoframework/dygo"
	"github.com/dygoframework/dygo/middleware"
)

// The app in main.go boots, and its middleware sets the security headers.
func TestAppBoots(t *testing.T) {
	app, err := dygo.Create(context.Background(), AppModule, dygo.WithMiddleware(
		middleware.SecureHeaders(middleware.SecureHeadersOptions{}),
		middleware.CORS(middleware.CORSOptions{AllowOrigins: []string{"https://app.example.com"}}),
	))
	if err != nil {
		t.Fatal(err)
	}
	rec := httptest.NewRecorder()
	app.Handler().ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/products/1", nil))
	if rec.Code != 200 || rec.Header().Get("X-Content-Type-Options") != "nosniff" {
		t.Fatalf("status %d, headers %v", rec.Code, rec.Header())
	}
}
