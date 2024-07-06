package pages

import (
	"pollo/lib"

	"github.com/labstack/echo/v4"
)

type RoomProps struct {
	IsLoggedIn bool
	Room       lib.Room
}

func Room(c echo.Context) error {
	_, error := lib.GetSessionCookie(c.Request(), "session")
	if error != nil {
		return c.Redirect(302, "/signin")
	}

	// Get the room ID from the URL
	roomID := c.Param("id")
	println("Room ID: ", roomID)

	// Get the room from the database
	room, err := lib.GetRoomById(lib.GetDBPool(), roomID)
	if err != nil {
		return c.String(404, "Room not found!")
	}

	props := RoomProps{
		IsLoggedIn: lib.IsSignedIn(c),
		Room:       *room,
	}

	// Specify the partials used by this page
	partials := []string{"header"}

	// Render the template
	return lib.RenderTemplate(c.Response().Writer, "base", partials, props)
}
