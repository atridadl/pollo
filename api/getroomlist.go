package api

import (
	"fmt"
	"net/http"
	"pollo/lib"

	"github.com/labstack/echo/v4"
)

// GetAllRoomsHandler handles the request to get all rooms for a user.
func GetAllRoomsHandler(c echo.Context) error {
	currentSession, err := lib.GetSessionCookie(c.Request(), "session")
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
	}

	rooms, err := lib.GetRoomsByUserID(lib.GetDBPool(), currentSession.UserID)
	if err != nil {
		// Log the error and return an internal server error response
		println("Error retrieving rooms: ", err.Error())
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to retrieve rooms"})
	}

	// Start building the HTML content
	htmlContent := "<div id='room-list'>"
	for _, room := range rooms {
		// For each room, append an HTML element to htmlContent
		// Customize this HTML structure as needed to match your desired appearance
		htmlContent += fmt.Sprintf("<div class='room-name'>%s</div>", room.RoomName)
	}
	htmlContent += "</div>"

	// Return the dynamically generated HTML content
	return c.HTML(http.StatusOK, htmlContent)
}
