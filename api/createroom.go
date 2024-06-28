package api

import (
	"fmt"
	"net/http"
	"pollo/lib"

	"github.com/labstack/echo/v4"
)

// CreateRoomHandler handles the creation of a new room and returns an updated list of rooms.
func CreateRoomHandler(c echo.Context) error {
	currentSession, err := lib.GetSessionCookie(c.Request(), "session")
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
	}

	roomName := c.FormValue("roomName")
	if roomName == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "room name is required"})
	}

	_, err = lib.CreateRoom(lib.GetDBPool(), currentSession.UserID, roomName)
	if err != nil {
		println("Error creating room: ", err.Error())
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to create room"})
	}

	// Retrieve the updated list of rooms for the user
	rooms, err := lib.GetRoomsByUserID(lib.GetDBPool(), currentSession.UserID)
	if err != nil {
		println("Error retrieving rooms: ", err.Error())
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to retrieve rooms"})
	}

	// Start building the HTML content for the updated list of rooms
	htmlContent := "<div id='room-list'>"
	for _, room := range rooms {
		htmlContent += fmt.Sprintf("<div class='room-name'>%s</div>", room.RoomName)
	}
	htmlContent += "</div>"

	// Return the dynamically generated HTML content
	return c.HTML(http.StatusOK, htmlContent)
}
