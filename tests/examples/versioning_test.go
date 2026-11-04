package examples

import (
	"context"
	"testing"

	"github.com/dygoframework/dygo"
	"github.com/dygoframework/dygo/dygotest"
)

type UsersController struct{}

func (c *UsersController) Routes(r dygo.Router) {
	v1 := r.Version("1")
	v1.Get("/users", dygo.HandleNoInput(c.ListV1))

	v2 := r.Version("2")
	v2.Get("/users", dygo.HandleNoInput(c.ListV2))

	// Every version, and requests without one.
	r.Get("/health", dygo.HandleNoInput(c.Health), dygo.Version(dygo.VersionNeutral))
}

func (c *UsersController) ListV1(context.Context) (string, error) { return "v1 users", nil }
func (c *UsersController) ListV2(context.Context) (string, error) { return "v2 users", nil }
func (c *UsersController) Health(context.Context) (string, error) { return "ok", nil }

var VersionedModule = &dygo.Module{
	Name:        "app",
	Controllers: []dygo.Provider{dygo.Value(&UsersController{})},
}

func TestURIVersioningExample(t *testing.T) {
	srv := dygotest.New(VersionedModule).With(dygo.WithVersioning(dygo.URIVersioning("1"))).CompileHTTP(t)
	if got := srv.GET("/v1/users").Do(t).Status(t, 200).Text(); got != "v1 users" {
		t.Fatalf("/v1/users = %q", got)
	}
	if got := srv.GET("/v2/users").Do(t).Status(t, 200).Text(); got != "v2 users" {
		t.Fatalf("/v2/users = %q", got)
	}
	srv.GET("/v3/users").Do(t).Status(t, 404)
	srv.GET("/health").Do(t).Status(t, 200)
}

func TestHeaderVersioningExample(t *testing.T) {
	srv := dygotest.New(VersionedModule).
		With(dygo.WithVersioning(dygo.HeaderVersioning("X-API-Version", "1"))).
		CompileHTTP(t)
	if got := srv.GET("/users").Header("X-API-Version", "2").Do(t).Status(t, 200).Text(); got != "v2 users" {
		t.Fatalf("header 2 = %q", got)
	}
	if got := srv.GET("/users").Do(t).Status(t, 200).Text(); got != "v1 users" {
		t.Fatalf("no header = %q", got)
	}
}

func TestMediaTypeVersioningExample(t *testing.T) {
	srv := dygotest.New(VersionedModule).
		With(dygo.WithVersioning(dygo.MediaTypeVersioning("v", "1"))).
		CompileHTTP(t)
	if got := srv.GET("/users").Header("Accept", "application/json;v=2").Do(t).Status(t, 200).Text(); got != "v2 users" {
		t.Fatalf("Accept v=2 = %q", got)
	}
}
