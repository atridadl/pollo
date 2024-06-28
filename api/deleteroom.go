package api

import (
	"net/http"
	"pollo/lib"

	"github.com/labstack/echo/v4"
)

// DeleteRoomHandler handles the deletion of a room by ID.
func DeleteRoomHandler(c echo.Context) error {
	roomID := c.Param("id")
	if roomID == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "room ID is required"})
	}

	err := lib.DeleteRoom(lib.GetDBPool(), roomID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to delete room"})
	}

	return c.NoContent(http.StatusNoContent)
}
