package pages

import (
	"pollo/lib"

	"github.com/labstack/echo/v4"
)

type RoomProps struct {
	Room lib.Room
}

func Room(c echo.Context) error {
	// Get the room ID from the URL
	roomID := c.Param("id")

	// Initialize the page error
	pageError := lib.Error{}

	// Get the room from the database
	room, err := lib.GetRoomById(lib.GetDBPool(), roomID)
	if err != nil {
		pageError = lib.Error{
			Code:    404,
			Message: "Room not found",
		}

		props := RoomProps{}

		// Specify the partials used by this page
		partials := []string{"header"}

		// Render the template
		return lib.RenderTemplate(c, "base", partials, props, pageError)
	}

	props := RoomProps{
		Room: *room,
	}

	// Specify the partials used by this page
	partials := []string{"header"}

	// Render the template
	return lib.RenderTemplate(c, "base", partials, props, pageError)
}
