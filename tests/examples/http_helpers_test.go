package examples

import "github.com/dygoframework/dygo"

// routes adapts a function to a controller, to keep the tests short.
type routes func(r dygo.Router)

func (f routes) Routes(r dygo.Router) { f(r) }

func appWith(fn func(r dygo.Router)) *dygo.Module {
	return &dygo.Module{Name: "app", Controllers: []dygo.Provider{dygo.Value(routes(fn))}}
}
