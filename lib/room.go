package lib

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v4/pgxpool"
)

type Room struct {
	ID        string
	CreatedAt time.Time
	UserID    string
	RoomName  string
	TopicName string
	Visible   bool
	Scale     string
}

// GenerateNewID generates a new room ID with the format "room_randomstring".
func GenerateNewID() string {
	randomBytes := make([]byte, 16)
	if _, err := rand.Read(randomBytes); err != nil {
		panic(err)
	}
	return fmt.Sprintf("room_%s", hex.EncodeToString(randomBytes))
}

// CreateRoom creates a new room in the database.
func CreateRoom(dbPool *pgxpool.Pool, userID, roomName string) (*Room, error) {
	if dbPool == nil {
		return nil, errors.New("database connection pool is not initialized")
	}

	// Generate a new ID for the room
	newRoomID := GenerateNewID()

	// Insert the new room into the database
	_, err := dbPool.Exec(context.Background(), "INSERT INTO rooms (id, userid, roomname, topicname, visible, scale) VALUES ($1, $2, $3, $4, $5, $6)", newRoomID, userID, roomName, "My First Topic", false, "0.5,1,2,3,5")
	if err != nil {
		return nil, err
	}

	return &Room{
		ID:        newRoomID,
		UserID:    userID,
		RoomName:  roomName,
		TopicName: "My First Topic",
		Visible:   false,         // Default visibility
		Scale:     "0.5,1,2,3,5", // Default scale
	}, nil
}

// DeleteRoom deletes a room from the database by its ID.
func DeleteRoom(dbPool *pgxpool.Pool, roomID string) error {
	if dbPool == nil {
		return errors.New("database connection pool is not initialized")
	}

	_, err := dbPool.Exec(context.Background(), "DELETE FROM rooms WHERE id = $1", roomID)
	if err != nil {
		return err
	}

	return nil
}

// GetRoomsByUserID retrieves all rooms for a given userID.
func GetRoomsByUserID(dbPool *pgxpool.Pool, userID string) ([]Room, error) {
	if dbPool == nil {
		return nil, errors.New("database connection pool is not initialized")
	}

	var rooms []Room
	rows, err := dbPool.Query(context.Background(), "SELECT id, created_at, userid, roomname, topicname, visible, scale FROM rooms WHERE userid = $1", userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var room Room
		err := rows.Scan(&room.ID, &room.CreatedAt, &room.UserID, &room.RoomName, &room.TopicName, &room.Visible, &room.Scale)
		if err != nil {
			return nil, err
		}
		rooms = append(rooms, room)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return rooms, nil
}
