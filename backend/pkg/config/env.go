package config

import (
	"os"

	"github.com/joho/godotenv"
)

type EnvVars struct {
	LISTEN_ON   string
	PORT        string
	GATEWAY_KEY string
}

func LoadEnv() EnvVars {
	godotenv.Load()
	// dsn, exists := os.LookupEnv("DSN")
	// if !exists {
	//     panic("Failed to load environment variables! Is .env setup correctly?")
	// }
	listenOn, exists := os.LookupEnv("LISTEN_ON")
	if !exists {
		listenOn = "127.0.0.1"
	}
	port, exists := os.LookupEnv("PORT")
	if !exists {
		port = "8080"
	}
	return EnvVars{
		LISTEN_ON:   listenOn,
		PORT:        port,
		GATEWAY_KEY: os.Getenv("OPENAI_API_KEY"),
	}
}
