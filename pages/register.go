package pages

import (
	"pollo/lib"

	"github.com/labstack/echo/v4"
)

type RegisterProps struct {
}

func Register(c echo.Context) error {
	props := RegisterProps{}

	// Specify the partials used by this page
	partials := []string{"header"}

	// Render the template
	return lib.RenderTemplate(c, "base", partials, props)
}
