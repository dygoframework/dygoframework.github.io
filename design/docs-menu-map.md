# Dygo docs menu map

This menu follows the order and grouping of the NestJS docs, but it only lists what Dygo really has. Sources are in `dygo-docs-site/docs/` unless noted.

**Status:** **Ready** means a section already exists. **Split** means take it from a larger guide. **New** means a short page must be written from the code.

Design note: expand only the group that holds the current page. The menu has too many items to leave every group open.

## Overview

| Menu item | NestJS item | Dygo source | Status |
|---|---|---|---|
| Introduction | Introduction | `index.md` | Ready |
| First steps | First steps | `getting-started.md` | Ready |
| Controllers | Controllers | `guide-http.md`: A controller, CRUD steps, Typed input, Output, Errors | Split |
| Providers | Providers | `guide-core.md`: A provider and a module | Split |
| Modules | Modules | `guide-core.md`: A provider and a module | Split |
| Middleware | Middleware | `guide-production.md`: HTTP middleware | Split |
| Exception filters | Exception filters | `guide-pipeline.md`: Exception filters | Split |
| Pipes | Pipes | `guide-pipeline.md`: Pipes and validation | Split |
| Guards | Guards | `guide-pipeline.md`: Guards | Split |
| Interceptors | Interceptors | `guide-pipeline.md`: Interceptors | Split |
| Route metadata | Custom decorators | `guide-pipeline.md`: Metadata | Split |

## Fundamentals

| Menu item | NestJS item | Dygo source | Status |
|---|---|---|---|
| Custom providers | Custom providers | `guide-core.md`: Values, named tokens, many dependencies | Split |
| Dynamic modules | Dynamic modules | `guide-core.md`: Dynamic module | Split |
| Injection scopes | Injection scopes | `guide-http.md`: Request scope, Durable providers | Split |
| Circular dependency | Circular dependency | `guide-core.md`: Breaking a cycle, using `dygo.Lazy` | Split |
| Module reference | Module reference | Code: `moduleref.go` | New |
| Execution context | Execution context | `guide-pipeline.md`: Execution context | Split |
| Lifecycle events | Lifecycle events | `guide-core.md`: Lifecycle | Split |
| Discovery | Discovery service | Code: `dygo.Discover` in `app.go` | New |
| Standalone apps | Standalone applications | `guide-core.md`: `dygo.CreateApplicationContext` | Split |
| Testing | Testing | `guide-core.md`: Testing, `recipes/testing.md`, `guide-testing.md` | Ready |

## Application

| Menu item | NestJS item | Dygo source | Status |
|---|---|---|---|
| Configuration | Configuration | `guide-production.md`: Config | Split |
| Validation | Validation | `guide-pipeline.md`: Pipes and validation | Split |
| Logging | Logging | `guide-production.md`: Logging | Split |
| Events | Events | `guide-transports.md`: Events | Split |
| Task scheduling | Task scheduling | `guide-transports.md`: Schedule | Split |
| Queues | Queues | `guide-transports.md`: Queue | Split |
| CQRS | CQRS recipe | `guide-transports.md`: CQRS | Split |
| Console commands | Standalone or CLI recipes | `guide-cli.md`: Console commands | Split |
| File storage | File upload (storage part) | `guide-storage.md` | Ready |

## AI

Beta. The group title shows a Beta badge, and every page starts with a note that names the latest `ai/v*` tag.

| Menu item | NestJS item | Dygo source | Status |
|---|---|---|---|
| Overview and setup | None | `guide-ai.md`: intro, Set up | Split |
| Ask and wait | None | `guide-ai.md`: Ask and wait | Split |
| Stream to the browser | None | `guide-ai.md`: Stream to the browser | Split |
| Typed output | None | `guide-ai.md`: Typed output | Split |
| Errors | None | `guide-ai.md`: Errors | Split |
| Retries, timeouts and logs | None | `guide-ai.md`: Retries, timeouts and logs | Split |
| Testing | None | `guide-ai.md`: Testing | Split |

## Data

| Menu item | NestJS item | Dygo source | Status |
|---|---|---|---|
| SQL databases | Database overview | `recipes/sql.md`: The connection module, From memory to a database | Split |
| Repositories | TypeORM and other ORM pages | `recipes/sql.md`: A repository, Using it from a controller | Split |
| Transactions | Transactions in ORM pages | `recipes/sql.md`: Transactions | Split |
| Migrations | Migrations in ORM pages | `recipes/sql.md`: Migrations, `guide-cli.md`: Database | Split |
| Multiple databases | Multiple databases in ORM pages | `recipes/sql.md`: Several databases, Per-tenant databases | Split |
| Caching | Caching | `guide-transports.md`: Cache | Split |

## Security

| Menu item | NestJS item | Dygo source | Status |
|---|---|---|---|
| Authentication | Authentication | `recipes/auth.md`, `recipes/security.md` | Ready |
| Authorization | Authorization | `recipes/security.md`: Open routes and require roles, Roles and authorities | Split |
| OIDC login | None | `recipes/security.md`: Login at an identity provider | Split |
| Password hashing | Encryption and hashing | `recipes/auth.md` and code. Cover PBKDF2 only. | New |
| Security headers | Security headers | Code: `middleware/security.go` | New |
| CORS | CORS | `recipes/security.md`: Browsers, `middleware/security.go` | Split |
| CSRF protection | CSRF protection | Code: `middleware/security.go` | New |
| Rate limiting | Rate limiting | `guide-production.md`: Rate limiting | Split |
| OWASP Top 10 | None | `owasp.md` | Ready |

## HTTP

| Menu item | NestJS item | Dygo source | Status |
|---|---|---|---|
| Versioning | Versioning | `guide-http.md`, code: `versioning.go` | New |
| Cookies | Cookies | `guide-http.md`: Typed input, Output | Split |
| File upload and streaming | File upload and streaming | `guide-http.md`: Typed input, Output | Split |
| Compression | Compression | `guide-production.md`: HTTP middleware | Split |
| Server-Sent Events | Server-Sent Events | `guide-http.md`: Output, code: `dygo.SSE` | New |
| Health checks | Health checks recipe | `guide-production.md`: Health checks | Split |

## APIs

| Menu item | NestJS item | Dygo source | Status |
|---|---|---|---|
| OpenAPI | OpenAPI | `guide-production.md`: OpenAPI | Split |
| JSON Schema | None | Code: `openapi.JSONSchema` in `openapi/schema.go` | New |
| GraphQL | GraphQL | `guide-transports.md`: GraphQL | Split |
| WebSockets | WebSockets | `guide-transports.md`: WebSocket gateways | Split |

## Microservices

| Menu item | NestJS item | Dygo source | Status |
|---|---|---|---|
| Overview | Overview | `guide-transports.md`: Microservices | Split |
| Redis | Redis | `guide-transports.md`: Redis and Kafka | Split |
| NATS | NATS | Code: `micro/nats` | New |
| Kafka | Kafka | `guide-transports.md`: Redis and Kafka | Split |
| gRPC | gRPC | `guide-transports.md`: gRPC | Split |

## Production

| Menu item | NestJS item | Dygo source | Status |
|---|---|---|---|
| Tracing and metrics | Deployment and recipes | `guide-production.md`: Tracing and metrics | Split |
| Docker | Deployment | `guide-production.md`: Docker | Split |

## CLI

| Menu item | NestJS item | Dygo source | Status |
|---|---|---|---|
| Overview | CLI overview | `guide-cli.md`: New project, AI models | Split |
| Generators | Usages | `guide-cli.md`: Generate code through Route tests, including `dygo run` | Split |
| Database commands | None | `guide-cli.md`: Database | Split |
| Inspect your app | None | `guide-cli.md`: Look at a running app's shape | Split |
| Development server | None | `guide-cli.md`: Development server, Route directives | Split |

## Project

| Menu item | NestJS item | Dygo source | Status |
|---|---|---|---|
| Benchmarks | None | `benchmarks/README.md` | Ready |
| What's new | None | `CHANGELOG.md`: Unreleased, marked as not released, and the latest release | Split |
| Changelog | None | `CHANGELOG.md` | Ready |
| Security policy | None | `SECURITY.md` | Ready |

## NestJS items left out

No matching Dygo feature was found, so these stay out of the menu until one exists.

| NestJS item | Note |
|---|---|
| Serialization | No dedicated feature. JSON struct tags cover the basics. |
| HTTP client | No dedicated feature |
| Internationalization | No feature found |
| Mail | No feature found |
| Session | Dygo auth uses tokens. No HTTP session feature found. |
| Model-View-Controller | No HTML view feature found |
| HTTP adapters | Dygo runs on `net/http` |
| Webhooks | No feature found |
| Lazy-loading modules | `dygo.Lazy` is for cycles, not lazy modules |
| Platform agnosticism | Dygo runs on `net/http` |
| TypeORM, Drizzle, Prisma, MikroORM, Sequelize | JavaScript tools. Dygo uses its `sql` module. |
| MongoDB | No Dygo module found |
| Encryption | Only cover password hashing until a general feature exists |

Keep the existing content for the `nestjs-to-dygo.md` decision in `PLAN.md`: don't publish that page unless Dylan changes it.
