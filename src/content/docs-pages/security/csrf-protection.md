---
title: CSRF protection
description: middleware.CSRF protects cookie authenticated apps with the double submit pattern.
---

`middleware.CSRF` protects apps that authenticate with cookies. It uses the double submit pattern:

1. A safe request (`GET`, `HEAD`, `OPTIONS` or `TRACE`) without a token gets a random `csrf_token` cookie that your frontend can read.
2. An unsafe request (`POST`, `PUT`, `PATCH` or `DELETE`) must send the same value in the `X-CSRF-Token` header. Otherwise it gets a 403 with the code `CSRF`.

```go
func csrf() dygo.Option {
	return dygo.WithMiddleware(middleware.CSRF(middleware.CSRFOptions{Secure: true}))
}
```

Set `Secure: true` in production. `CookieName` and `HeaderName` change the names. APIs that authenticate with bearer tokens don't need CSRF protection.
