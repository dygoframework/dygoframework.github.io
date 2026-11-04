package main

import (
	"testing"

	"github.com/dygoframework/dygo/dygotest"
)

func TestProducts(t *testing.T) {
	srv := dygotest.New(ProductsModule).CompileHTTP(t)
	srv.GET("/products/1").Do(t).Status(t, 200)
	srv.GET("/products/abc").Do(t).Status(t, 400)
	srv.GET("/products/2").Do(t).Status(t, 404)
}
