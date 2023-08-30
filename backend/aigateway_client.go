package main

import (
	"fmt"

	"github.com/SafetyCulture/s12-apis-go/aigateway/v1"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
)

func getClient() aigateway.AIGatewayServiceClient {
	// Create an AIGateway client
	url := fmt.Sprintf("srv-platform-aigateway-%s.scinfradev.com:443", namespace)
	// url := "localhost:30080"
	conn, err := grpc.Dial(
		url,
		grpc.WithTransportCredentials(credentials.NewClientTLSFromCert(nil, "")),
		// grpc.WithTransportCredentials(insecure.NewCredentials()),
	)
	if err != nil {
		panic(err)
	}
	return aigateway.NewAIGatewayServiceClient(conn)
}
