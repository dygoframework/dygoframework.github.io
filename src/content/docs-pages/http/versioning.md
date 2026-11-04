---
title: Versioning
description: Serve several versions of a route, chosen by path, header, media type or your own rule.
---

Turn on versioning with `dygo.WithVersioning`, then give routes a version with `Router.Version` or the `dygo.Version` route option.

```go
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
```

Choose where the version comes from. The last argument is the default version for requests that don't send one.

| Option | Request |
|---|---|
| `dygo.URIVersioning("1")` | `GET /v2/users` |
| `dygo.HeaderVersioning("X-API-Version", "1")` | `X-API-Version: 2` |
| `dygo.MediaTypeVersioning("v", "1")` | `Accept: application/json;v=2` |
| `dygo.CustomVersioning(fn, "1")` | The versions `fn(r)` returns, in order of preference |

A route with `dygo.VersionNeutral` matches every version, and requests without one.
