package examples

import (
	"testing"

	"github.com/dygoframework/dygo"
	"github.com/dygoframework/dygo/dygotest"
)

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

func TestModuleReference(t *testing.T) {
	app := dygotest.New(ReportsModule).Compile(t)
	reports := dygo.MustGet[*Reports](app)

	clock, err := reports.Clock()
	if err != nil || clock != dygo.MustGet[*Clock](app) {
		t.Fatalf("Clock() = %v, %v; want the module's singleton", clock, err)
	}
	a, err := reports.New()
	if err != nil {
		t.Fatal(err)
	}
	b, _ := reports.New()
	if a == b || a.clock != clock {
		t.Fatal("New() must build a new Report with the module's Clock")
	}
	if reports.ref.Module() != "reports" {
		t.Fatalf("Module() = %q", reports.ref.Module())
	}
}
