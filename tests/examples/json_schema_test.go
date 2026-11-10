package examples

import (
	"encoding/json"
	"reflect"
	"testing"

	"github.com/dygoframework/dygo/openapi"
)

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

func signupSchema() ([]byte, error) {
	schema := openapi.JSONSchema(reflect.TypeFor[Signup]())
	return json.MarshalIndent(schema, "", "  ")
}

// The JSON block on the JSON Schema page, word for word.
const signupJSON = `{
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
}`

func TestJSONSchema(t *testing.T) {
	got, err := signupSchema()
	if err != nil {
		t.Fatal(err)
	}
	if string(got) != signupJSON {
		t.Fatalf("schema:\n%s", got)
	}
}

type Category struct {
	Name     string     `json:"name"`
	Children []Category `json:"children,omitempty"`
}

func TestJSONSchemaRecursive(t *testing.T) {
	s := openapi.JSONSchema(reflect.TypeFor[Category]())
	if s.Properties["children"].Items.Ref != "#/$defs/Category" || s.Defs["Category"] == nil {
		t.Fatalf("a recursive root stays in $defs: %+v", s)
	}
	if s := openapi.JSONSchema(reflect.TypeFor[[]Address]()); s.Type != "array" || s.Items.Ref != "#/$defs/Address" {
		t.Fatalf("slice: %+v", s)
	}
}
