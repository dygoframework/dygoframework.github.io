package main

import (
	"context"
	"log"

	"github.com/dygoframework/dygo"
	"github.com/dygoframework/dygo/middleware"
)

func main() {
	ctx := context.Background()
	app, err := dygo.Create(ctx, AppModule, dygo.WithMiddleware(
		middleware.SecureHeaders(middleware.SecureHeadersOptions{}),
		middleware.CORS(middleware.CORSOptions{AllowOrigins: []string{"https://app.example.com"}}),
	))
	if err != nil {
		log.Fatal(err) // every wiring problem at once
	}
	log.Fatal(app.Listen(ctx, ":9900")) // graceful shutdown on Ctrl+C
}

var AppModule = &dygo.Module{Name: "app", Imports: []*dygo.Module{ProductsModule}}
