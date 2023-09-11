#!/bin/bash

# Check if nodemon is installed
cd backend
# --- Perform database migration ---
go run github.com/steebchen/prisma-client-go db push
$(go env GOPATH)/bin/swag init --parseDependency --dir ./,./pkg

cd ../frontend

npx swagger-typescript-api -p ../backend/docs/swagger.json  -o ./src/service/swagger 
