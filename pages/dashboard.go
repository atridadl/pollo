package pages

import (
	"pollo/lib"

	"github.com/labstack/echo/v4"
)

type DashboardProps struct {
	IsLoggedIn bool
}

func Dashboard(c echo.Context) error {
	props := DashboardProps{
		IsLoggedIn: lib.IsSignedIn(c),
	}

	// Specify the partials used by this page
	partials := []string{"header"}

	// Render the template
	return lib.RenderTemplate(c.Response().Writer, "base", partials, props)
}
