package main

import (
	"context"

	"github.com/dygoframework/dygo"
	"github.com/dygoframework/dygo/errs"
)

type Product struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

//go:generate dygo gen

//dygo:controller /products
type Controller struct{ svc *Service }

func NewController(svc *Service) *Controller {
	return &Controller{svc: svc}
}

type GetIn struct {
	ID int `path:"id"` // "abc" is a 400 before your code runs
}

//dygo:get /{id}
func (c *Controller) Get(ctx context.Context, in GetIn) (Product, error) {
	p, ok := c.svc.Find(in.ID)
	if !ok {
		return Product{}, errs.NotFound("product not found")
	}
	return p, nil // written as JSON
}

var ProductsModule = &dygo.Module{
	Name:        "products",
	Providers:   []dygo.Provider{dygo.Provide(NewService)},
	Controllers: []dygo.Provider{dygo.Provide(NewController)},
}
