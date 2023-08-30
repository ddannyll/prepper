package main

import (
	"context"
	"fmt"

	soterjwt "github.com/SafetyCulture/soter-jwt-go/v3"
	"google.golang.org/grpc/metadata"
)

func getSoterAdminToken() (string, error) {
	authKey := soterjwt.NewDevelopmentAuthKey(identity)
	authClient := soterjwt.NewAuthClient(soterjwt.ClientConfig{
		Name:    identity,
		AuthKey: authKey,
	})

	creds := soterjwt.NewAdminCredentials()

	token, err := authClient.GenerateToken(creds, "srv-platform-aigateway")
	if err != nil {
		return "", err
	}

	return token, nil
}

func getOutgoingContext(token string) context.Context {
	md := metadata.Pairs("authorization", fmt.Sprintf("bearer %s", token))
	ctx := metadata.NewOutgoingContext(context.Background(), md)

	return ctx
}
