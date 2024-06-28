package pages

import (
	"pollo/lib"

	"github.com/labstack/echo/v4"
)

type DashboardProps struct {
	IsLoggedIn bool
	Name       string
}

func Dashboard(c echo.Context) error {
	currentSession, error := lib.GetSessionCookie(c.Request(), "session")
	if error != nil {
		return c.Redirect(302, "/signin")
	}

	props := DashboardProps{
		IsLoggedIn: lib.IsSignedIn(c),
		Name:       currentSession.Name,
	}

	// Specify the partials used by this page
	partials := []string{"header"}

	// Render the template
	return lib.RenderTemplate(c.Response().Writer, "base", partials, props)
}
