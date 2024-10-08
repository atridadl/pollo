package pages

import (
	"pollo/lib"

	"github.com/labstack/echo/v4"
)

type SignInProps struct {
}

func SignIn(c echo.Context) error {
	// Initialize the page error
	pageError := lib.Error{}

	props := SignInProps{}

	// Specify the partials used by this page
	partials := []string{"header"}

	// Render the template
	return lib.RenderTemplate(c, "base", partials, props, pageError)
}
