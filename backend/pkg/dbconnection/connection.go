package dbconnection

import (
	"log"

	"github.com/ddannyll/prepper/db"
)

// Database code
var cachedDBClient *db.PrismaClient

func setupDatabase() (*db.PrismaClient, error) {
	client := db.NewClient()

	if err := client.Prisma.Connect(); err != nil {
		return nil, err
	}

	// defer func() {
	// 	if err := client.Prisma.Disconnect(); err != nil {
	// 		panic(err)
	// 	}
	// }()
	return client, nil
}

func GetDBClient() *db.PrismaClient {
	if cachedDBClient != nil {
		return cachedDBClient
	}

	client, err := setupDatabase()
	log.Println(err)
	log.Println(client)

	if err == nil {
		cachedDBClient = client
		return cachedDBClient
	}

	panic(err)
}
