package examples

import (
	"context"
	"net/http"
	"testing"

	"github.com/dygoframework/dygo"
	"github.com/dygoframework/dygo/dygotest"
	"github.com/dygoframework/dygo/middleware"
)

func csrf() dygo.Option {
	return dygo.WithMiddleware(middleware.CSRF(middleware.CSRFOptions{Secure: true}))
}

func TestCSRF(t *testing.T) {
	ok := dygo.HandleNoInput(func(context.Context) (string, error) { return "ok", nil })
	srv := dygotest.New(appWith(func(r dygo.Router) {
		r.Get("/form", ok)
		r.Post("/orders", ok)
	})).With(csrf()).CompileHTTP(t)

	// A safe request sets the token cookie.
	var token string
	for _, c := range srv.GET("/form").Do(t).Status(t, 200).Cookies() {
		if c.Name == "csrf_token" {
			token = c.Value
		}
	}
	if token == "" {
		t.Fatal("no csrf_token cookie")
	}
	withCookie := func(r *http.Request) { r.AddCookie(&http.Cookie{Name: "csrf_token", Value: token}) }

	srv.POST("/orders").With(withCookie).Do(t).Status(t, 403)
	srv.POST("/orders").With(withCookie).Header("X-CSRF-Token", "wrong").Do(t).Status(t, 403)
	srv.POST("/orders").With(withCookie).Header("X-CSRF-Token", token).Do(t).Status(t, 201)
}
