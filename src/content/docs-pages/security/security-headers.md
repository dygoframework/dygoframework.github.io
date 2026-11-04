---
title: Security headers
description: middleware.SecureHeaders sets security response headers, with defaults for a JSON API.
---

`middleware.SecureHeaders` sets security headers on every response. Add it as app middleware. The zero options are the defaults for a JSON API.

```go
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
```

| Header | Default |
|---|---|
| `Content-Security-Policy` | `default-src 'none'; frame-ancestors 'none'` |
| `Strict-Transport-Security` | `max-age=15552000; includeSubDomains` (180 days), only over HTTPS or with `X-Forwarded-Proto: https` |
| `Referrer-Policy` | `no-referrer` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Cross-Origin-Opener-Policy` | `same-origin` |
| `Cross-Origin-Resource-Policy` | `same-origin` |
| `X-DNS-Prefetch-Control` | `off` |

Set `ContentSecurityPolicy` for routes that serve HTML, or `"-"` to send none. A negative `HSTSMaxAge` turns HSTS off.
