package api

import (
	"fmt"
	"net/http"
	"pollo/lib"

	"github.com/labstack/echo/v4"
)

// DeleteRoomHandler handles the deletion of a room by ID.
func DeleteRoomHandler(c echo.Context) error {
	roomID := c.Param("id")

	currentSession, cookieError := lib.GetSessionCookie(c.Request(), "session")
	if cookieError != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
	}

	if roomID == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "room ID is required"})
	}

	deletionError := lib.DeleteRoom(lib.GetDBPool(), roomID)
	if deletionError != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to delete room"})
	}

	// Retrieve the updated list of rooms for the user
	rooms, fetchError := lib.GetRoomsByUserID(lib.GetDBPool(), currentSession.UserID)
	if fetchError != nil {
		println("Error retrieving rooms: ", fetchError.Error())
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to retrieve rooms"})
	}

	// Start building the HTML content for the updated list of rooms
	htmlContent := "<div id='room-list'>"
	for _, room := range rooms {
		htmlContent += fmt.Sprintf("<div class='room-name'>%s <button hx-delete='/api/room/%s' hx-target='#room-list' hx-swap='outerHTML'>❌</button></div>", room.RoomName, room.ID)
	}
	htmlContent += "</div>"

	// Return the dynamically generated HTML content
	return c.HTML(http.StatusOK, htmlContent)
}
