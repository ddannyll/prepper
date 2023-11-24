#!/bin/bash

# Check if nodemon is installed
if ! command -v nodemon &> /dev/null; then
    echo "nodemon is not installed. Installing..."
    npm i -g nodemon
fi

cd backend


# --- Perform database migration ---
rm db/query-engine-*
rm db/db_gen.go

go run github.com/steebchen/prisma-client-go db push

nodemon -e go --signal SIGTERM --exec 'go' run . &

cd ../frontend
npm run dev &
wait
