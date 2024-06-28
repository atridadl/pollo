package lib

import (
	"context"

	"github.com/jackc/pgx/v4/pgxpool"
)

var dbPool *pgxpool.Pool

// Initializes the global database connection pool.
func InitializeDBPool(connString string) error {
	var err error
	dbPool, err = pgxpool.Connect(context.Background(), connString)
	if err != nil {
		return err
	}
	return nil
}

func InitializeSchema(dbPool *pgxpool.Pool) error {
	const schemaSQL = `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
    );`
	// TODO: Add more tables to the schema

	_, err := dbPool.Exec(context.Background(), schemaSQL)
	if err != nil {
		return err
	}
	return nil
}

// Returns the initialized database connection pool.
func GetDBPool() *pgxpool.Pool {
	return dbPool
}
