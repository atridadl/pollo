package pages

import (
	"pollo/lib"

	"github.com/labstack/echo/v4"
)

type HomeProps struct {
	IsLoggedIn bool
}

func Home(c echo.Context) error {
	props := HomeProps{
		IsLoggedIn: lib.IsSignedIn(c),
	}

	println("Home page props: ", props.IsLoggedIn)

	// Specify the partials used by this page
	partials := []string{"header"}

	// Render the template
	return lib.RenderTemplate(c.Response().Writer, "base", partials, props)
}
