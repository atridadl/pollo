package api

import (
	"net/http"
	"pollo/lib"

	"github.com/labstack/echo/v4"
)

func SignOutUserHandler(c echo.Context) error {
	// Clear the session cookie
	lib.ClearSessionCookie(c.Response().Writer, "session_id")

	// Proceed with login success logic
	c.Response().Header().Set("HX-Redirect", "/")
	return c.NoContent(http.StatusOK)
}
