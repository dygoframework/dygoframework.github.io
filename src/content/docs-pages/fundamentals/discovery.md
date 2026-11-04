---
title: Discovery
description: Find every provider that implements an interface with dygo.Discover, for registries and plugins.
---

`dygo.Discover[T](ref)` returns every built singleton in the application that implements or is of type `T`. Packages such as events and schedule use it to find their listeners and jobs. Call it from `OnModuleInit` or later, when every singleton is built.

```go
// Exporter is the interface the registry looks for.
type Exporter interface {
	Format() string
}

type CSVExporter struct{}

func NewCSVExporter() *CSVExporter  { return &CSVExporter{} }
func (*CSVExporter) Format() string { return "csv" }

type JSONExporter struct{}

func NewJSONExporter() *JSONExporter { return &JSONExporter{} }
func (*JSONExporter) Format() string { return "json" }

type Exporters struct {
	ref     *dygo.ModuleRef
	formats []string
}

func NewExporters(ref *dygo.ModuleRef) *Exporters { return &Exporters{ref: ref} }

// OnModuleInit runs once every singleton is built, so Discover sees them all.
func (e *Exporters) OnModuleInit(context.Context) error {
	for _, x := range dygo.Discover[Exporter](e.ref) {
		e.formats = append(e.formats, x.Format())
	}
	slices.Sort(e.formats)
	return nil
}

var ExportModule = &dygo.Module{
	Name: "export",
	Providers: []dygo.Provider{
		dygo.Provide(NewCSVExporter),
		dygo.Provide(NewJSONExporter),
		dygo.Provide(NewExporters),
	},
}
```

Outside a provider, `dygo.ProvidersImplementing[T](app)` does the same from the application.
