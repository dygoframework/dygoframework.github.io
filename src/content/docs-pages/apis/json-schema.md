---
title: JSON Schema
description: Build a self-contained JSON Schema for one Go type with openapi.JSONSchema, the same way the OpenAPI document describes bodies.
---

:::note[Unreleased]
The Dygo changelog lists `openapi.JSONSchema` under Unreleased.
:::

`openapi.JSONSchema(t)` returns a JSON Schema for one Go type, without an OpenAPI document around it. It's built with the same code as the schemas in `/openapi.json`, so a type looks the same in both. The `ai` package uses it to ask a model for typed output.

Its signature is `func JSONSchema(t reflect.Type) *Schema`. Pass a type from `reflect.TypeFor`, and turn the `*openapi.Schema` it returns into JSON with `encoding/json`.

```go
type Address struct {
	City    string `json:"city" validate:"required"`
	Country string `json:"country" validate:"len=2" example:"NL"`
}

type Signup struct {
	Email   string   `json:"email" validate:"required,email"`
	Name    string   `json:"name" validate:"min=2,max=80" description:"Display name"`
	Plan    string   `json:"plan" validate:"oneof=free pro" default:"free"`
	Address Address  `json:"address"`
	Tags    []string `json:"tags,omitempty" validate:"max=5"`
	Note    *string  `json:"note"`
}
```

```go
func signupSchema() ([]byte, error) {
	schema := openapi.JSONSchema(reflect.TypeFor[Signup]())
	return json.MarshalIndent(schema, "", "  ")
}
```

This prints:

```json
{
  "$defs": {
    "Address": {
      "type": "object",
      "properties": {
        "city": {
          "type": "string"
        },
        "country": {
          "type": "string",
          "examples": [
            "NL"
          ],
          "minLength": 2,
          "maxLength": 2
        }
      },
      "required": [
        "city",
        "country"
      ]
    }
  },
  "type": "object",
  "properties": {
    "address": {
      "$ref": "#/$defs/Address"
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "name": {
      "type": "string",
      "description": "Display name",
      "minLength": 2,
      "maxLength": 80
    },
    "note": {
      "type": "string"
    },
    "plan": {
      "type": "string",
      "enum": [
        "free",
        "pro"
      ],
      "default": "free"
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "maxItems": 5
    }
  },
  "required": [
    "email",
    "name",
    "plan",
    "address"
  ]
}
```

## How the schema is built

- **Self-contained.** `t` itself is written inline at the top. Every other named struct goes in `$defs` and is linked with `$ref: "#/$defs/Name"`, so the schema needs no OpenAPI document. A recursive type, such as a struct with a `[]Category` field, also keeps its own entry in `$defs`.
- **Names.** Property names follow `encoding/json`: the `json` tag, or the field name. `json:"-"` and unexported fields are left out, and embedded structs add their fields to the parent. `json:",string"` makes the property a string.
- **Required.** A field is required unless it's a pointer or has `omitempty` or `omitzero`. A `validate:"required"` rule always makes it required.
- **Tags.** `description`, `example` and `default` add `description`, `examples` and `default`, typed to match the field.
- **Validate rules.** `min`, `max`, `gte`, `lte` and `len` become length limits on strings, item limits on arrays, and `minimum` and `maximum` on numbers. `gt` and `lt` become `exclusiveMinimum` and `exclusiveMaximum`. `oneof` becomes `enum`. `email`, `url`, `uri`, `http_url`, `uuid`, `uuid4` and `datetime` set the `format`. Rules after `dive` apply to elements and are left out.

| Go type | Schema |
|---|---|
| `bool` | `boolean` |
| `int`, `int64`, `uint`, `uint64` | `integer`, format `int64` |
| `int8` to `int32`, `uint8` to `uint32` | `integer`, format `int32` |
| `float32`, `float64` | `number`, format `float` or `double` |
| `string` | `string` |
| `[]byte` | `string`, format `byte` |
| Slices and arrays | `array` with `items` |
| Maps | `object` with `additionalProperties` |
| `time.Time` | `string`, format `date-time` |
| `time.Duration` | `integer`, format `int64`, in nanoseconds |
| A type with its own `MarshalJSON`, and `json.RawMessage` | Any value: `{}` |
| A type with `MarshalText` | `string` |

Pointers describe the type they point to.

## Typed output from a model

`ai.Generate[T]` and `ai.SchemaFor[T]` start from `openapi.JSONSchema`, then leave out the limits, such as `max=80`, that models' JSON modes refuse. `ai.Generate[T]` checks those limits after it decodes the answer. See [Typed output](/docs/ai/typed-output/).
