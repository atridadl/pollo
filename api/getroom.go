package api

import (
	"fmt"
	"net/http"
	"pollo/lib"

	"github.com/labstack/echo/v4"
)

// GetRoomHandler handles the request to get a room by ID.
func GetRoomHandler(c echo.Context) error {
	roomID := c.Param("id")
	room, err := lib.GetRoomById(lib.GetDBPool(), roomID)
	if err != nil {
		// Log the error
		println("Error retrieving room: ", err.Error())
		// If the room is not found, return a 404 error
		return c.Render(http.StatusNotFound, "404.html", nil)
	}

	// Start building the HTML content for the updated list of rooms
	htmlContent := fmt.Sprintf("<div>%s", room.ID)

	// Return the dynamically generated HTML content
	return c.HTML(http.StatusOK, htmlContent)
}
