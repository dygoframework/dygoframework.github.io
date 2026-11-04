package examples

import (
	"context"
	"slices"
	"testing"

	"github.com/dygoframework/dygo"
	"github.com/dygoframework/dygo/dygotest"
)

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

func TestDiscovery(t *testing.T) {
	app := dygotest.New(ExportModule).Compile(t)
	got := dygo.MustGet[*Exporters](app).formats
	if !slices.Equal(got, []string{"csv", "json"}) {
		t.Fatalf("formats = %v", got)
	}
	// From outside a provider, ask the app.
	if n := len(dygo.ProvidersImplementing[Exporter](app)); n != 2 {
		t.Fatalf("ProvidersImplementing found %d", n)
	}
}
