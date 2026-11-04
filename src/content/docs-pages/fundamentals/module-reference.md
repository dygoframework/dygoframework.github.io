---
title: Module reference
description: Inject a *dygo.ModuleRef to look up providers or build new instances from inside a module.
---

A provider can ask for `*dygo.ModuleRef` as a constructor parameter. The reference sees the container from that provider's module: its own providers, the exports of the modules it imports, and global modules.

```go
type Clock struct{}

func NewClock() *Clock { return &Clock{} }

type Report struct{ clock *Clock }

func NewReport(c *Clock) *Report { return &Report{clock: c} }

type Reports struct{ ref *dygo.ModuleRef }

func NewReports(ref *dygo.ModuleRef) *Reports { return &Reports{ref: ref} }

// Clock looks up a provider by its token.
func (r *Reports) Clock() (*Clock, error) {
	return dygo.Get[*Clock](r.ref)
}

// New builds a new Report on each call. Its parameters come from this module.
func (r *Reports) New() (*Report, error) {
	return dygo.Construct[*Report](r.ref, NewReport)
}

var ReportsModule = &dygo.Module{
	Name:      "reports",
	Providers: []dygo.Provider{dygo.Provide(NewClock), dygo.Provide(NewReports)},
}
```

- `dygo.Get[T](ref)` and `ref.Get(token)` return an instance that is visible in the module. A transient provider is built again on each call.
- `dygo.Construct[T](ref, ctor)` and `ref.Create(ctor)` call a constructor with its parameters resolved from the module, without registering the result. The new value gets no lifecycle hooks.
- `ref.Module()` is the module's name. `ref.App()` is the application, but it's nil while constructors run, so call it from `OnModuleInit` or later.
