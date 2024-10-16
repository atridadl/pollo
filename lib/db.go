package lib

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"

	"github.com/jackc/pgx/v4/pgxpool"
)

var dbPool *pgxpool.Pool

// Migration represents a database migration.
type Migration struct {
	Version string
	SQL     string
}

// GenerateNewID generates a DB with the format "prefix_randomstring".
func GenerateNewID(prefix string) string {
	randomBytes := make([]byte, 16)
	if _, err := rand.Read(randomBytes); err != nil {
		panic(err)
	}
	return fmt.Sprintf("%s_%s", prefix, hex.EncodeToString(randomBytes))
}

// Initializes the global database connection pool.
func InitializeDBPool(databaseURL string) error {
	var err error
	dbPool, err = pgxpool.Connect(context.Background(), databaseURL)
	if err != nil {
		return err
	}
	return nil
}

func InitializeSchema(dbPool *pgxpool.Pool) error {
	migrations := []Migration{
		{
			Version: "1_create_users_table",
			SQL: `
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT NOT NULL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL
                );`,
		},
		{
			Version: "2_create_rooms_table",
			SQL: `
                CREATE TABLE IF NOT EXISTS rooms (
                    id TEXT NOT NULL PRIMARY KEY,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    userId TEXT NOT NULL,
                    roomName TEXT,
                    topicName TEXT,
                    visible BOOLEAN NOT NULL DEFAULT false,
                    scale TEXT NOT NULL DEFAULT '0.5,1,2,3,5'
                );`,
		},
		{
			Version: "3_add_foreign_key_to_rooms",
			SQL: `
                ALTER TABLE rooms
                ADD CONSTRAINT fk_user_id
                FOREIGN KEY (userId) REFERENCES users(id);`,
		},
		{
			Version: "4_create_index_on_users_email",
			SQL: `
				CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
			`,
		},
		{
			Version: "5_create_index_on_rooms_userid",
			SQL: `
				CREATE INDEX IF NOT EXISTS idx_rooms_userid ON rooms(userId);
			`,
		},
		{
			Version: "6_create_sessions_table",
			SQL: `
		        CREATE TABLE IF NOT EXISTS sessions (
		            id TEXT PRIMARY KEY,
		            user_id TEXT NOT NULL,
		            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		            expires_at TIMESTAMP NOT NULL,
		            FOREIGN KEY (user_id) REFERENCES users(id)
		        );
		        CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
		    `,
		},
	}

	// Ensure the migrations table exists
	_, err := dbPool.Exec(context.Background(), `
        CREATE TABLE IF NOT EXISTS migrations (
            version VARCHAR(255) PRIMARY KEY
        );
    `)
	if err != nil {
		return err
	}

	// Apply each migration
	for _, migration := range migrations {
		// Check if this migration has already been applied
		var exists bool
		err := dbPool.QueryRow(context.Background(), "SELECT EXISTS(SELECT 1 FROM migrations WHERE version = $1)", migration.Version).Scan(&exists)
		if err != nil {
			return err
		}

		if !exists {
			// Apply the migration
			_, err = dbPool.Exec(context.Background(), migration.SQL)
			if err != nil {
				return err
			}

			// Mark this migration as applied
			_, err = dbPool.Exec(context.Background(), "INSERT INTO migrations (version) VALUES ($1)", migration.Version)
			if err != nil {
				return err
			}
		}
	}

	return nil
}

// Returns the initialized database connection pool.
func GetDBPool() *pgxpool.Pool {
	return dbPool
}
