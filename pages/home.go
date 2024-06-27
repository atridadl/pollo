package pages

import (
	"github.com/labstack/echo/v4"
	"pollo/lib"
)

type HomeProps struct {
}

func Home(c echo.Context) error {
	props := HomeProps{}

	// Specify the partials used by this page
	partials := []string{"header"}

	// Render the template
	return lib.RenderTemplate(c.Response().Writer, "base", partials, props)
}
