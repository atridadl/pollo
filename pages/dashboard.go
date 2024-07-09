package pages

import (
	"pollo/lib"

	"github.com/labstack/echo/v4"
)

type DashboardProps struct {
	Name string
}

func Dashboard(c echo.Context) error {
	// Initialize the page error
	pageError := lib.Error{}

	currentSession, error := lib.GetSessionCookie(c.Request(), "session")
	if error != nil {
		lib.LogError.Printf("Error getting session: %v", error)
	}

	props := DashboardProps{
		Name: currentSession.Name,
	}

	// Specify the partials used by this page
	partials := []string{"header"}

	// Render the template
	return lib.RenderTemplate(c, "base", partials, props, pageError)
}
