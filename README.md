# prepper


To get the dev env running, just use

```
./run_both.sh
```



## Deployment
In order to deploy out services, we are using Kubernettes.
### Update DB schema

In order create update your schema with your DB, use:

`go run github.com/steebchen/prisma-client-go db push`

In order to just regen the client:

`go run github.com/steebchen/prisma-client-go generate`

### Swagger doc

```
go get -u github.com/swaggo/swag/cmd/swag
GOPATH_VALUE=$(go env GOPATH)

$GOPATH_VALUE/bin/swag init --dir ./,./pkg


http://localhost:8080/swagger/index.html
```

### Generate the sdk for the FE to use...
To speed up the workflow, we will create the API to use using the swagger json files.

```npx swagger-typescript-api -p ../backend/docs/swagger.json  -o ./src/service/swagger```