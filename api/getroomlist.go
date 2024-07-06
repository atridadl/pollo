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

	// Start building the HTML content for the updated list of rooms
	htmlContent := "<tbody id='room-list'>"
	for _, room := range rooms {
		htmlContent += fmt.Sprintf("<tr class='hover border-white'><td class='break-all max-w-[200px] md:max-w-[400px]'>%s</td> <td><a class='m-2' href='/room/%s'>➡️</a> <button class='m-2' hx-delete='/api/room/%s' hx-target='#room-list' hx-swap='outerHTML'>❌</button></td></tr>", room.RoomName, room.ID, room.ID)
	}
	htmlContent += "</tbody>"

	// Return the dynamically generated HTML content
	return c.HTML(http.StatusOK, htmlContent)
}
