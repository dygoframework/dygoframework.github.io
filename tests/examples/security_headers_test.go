package examples

import (
	"context"
	"testing"

	"github.com/dygoframework/dygo"
	"github.com/dygoframework/dygo/dygotest"
	"github.com/dygoframework/dygo/middleware"
)

func secureHeaders() dygo.Option {
	return dygo.WithMiddleware(
		middleware.SecureHeaders(middleware.SecureHeadersOptions{}), // API defaults
	)
}

func secureHeadersForHTML() dygo.Option {
	return dygo.WithMiddleware(middleware.SecureHeaders(middleware.SecureHeadersOptions{
		ContentSecurityPolicy: "default-src 'self'",
		ReferrerPolicy:        "strict-origin-when-cross-origin",
	}))
}

func TestSecureHeaders(t *testing.T) {
	ping := appWith(func(r dygo.Router) {
		r.Get("/ping", dygo.HandleNoInput(func(context.Context) (string, error) { return "pong", nil }))
	})

	res := dygotest.New(ping).With(secureHeaders()).CompileHTTP(t).GET("/ping").Do(t).Status(t, 200)
	want := map[string]string{
		"X-Content-Type-Options":       "nosniff",
		"X-Frame-Options":              "DENY",
		"Referrer-Policy":              "no-referrer",
		"Cross-Origin-Opener-Policy":   "same-origin",
		"Cross-Origin-Resource-Policy": "same-origin",
		"X-DNS-Prefetch-Control":       "off",
		"Content-Security-Policy":      "default-src 'none'; frame-ancestors 'none'",
	}
	for k, v := range want {
		if got := res.Header.Get(k); got != v {
			t.Errorf("%s = %q, want %q", k, got, v)
		}
	}
	if res.Header.Get("Strict-Transport-Security") != "" {
		t.Error("HSTS must only be sent over HTTPS")
	}

	srv := dygotest.New(ping).With(secureHeaders()).CompileHTTP(t)
	https := srv.GET("/ping").Header("X-Forwarded-Proto", "https").Do(t)
	if got := https.Header.Get("Strict-Transport-Security"); got != "max-age=15552000; includeSubDomains" {
		t.Errorf("HSTS = %q", got)
	}

	html := dygotest.New(ping).With(secureHeadersForHTML()).CompileHTTP(t).GET("/ping").Do(t)
	if got := html.Header.Get("Content-Security-Policy"); got != "default-src 'self'" {
		t.Errorf("CSP = %q", got)
	}
}
