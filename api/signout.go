package api

import (
	"log"
	"net/http"
	"pollo/lib"

	"github.com/labstack/echo/v4"
)

func SignOutUserHandler(c echo.Context) error {
	sessionData, err := lib.GetSessionCookie(c.Request(), "session")
	if err == nil && sessionData != nil {
		// Delete the session from the database
		err = lib.DeleteSession(lib.GetDBPool(), sessionData.SessionID)
		if err != nil {
			log.Printf("Error deleting session: %v", err)
		}
	}

	// Clear the session cookie
	lib.ClearSessionCookie(c.Response().Writer, "session")

	// Proceed with logout success logic
	c.Response().Header().Set("HX-Redirect", "/")
	return c.NoContent(http.StatusOK)
}
