package aiGateway

import (
	"github.com/SafetyCulture/s12-apis-go/aigateway/v1"
)

// Database code
var cachedAIClient aigateway.AIGatewayServiceClient

func setupGateway() aigateway.AIGatewayServiceClient {
	aiClient := getClient()
	return aiClient
}

func GetAIClient() aigateway.AIGatewayServiceClient {
	if cachedAIClient != nil {
		return cachedAIClient
	}
	cachedAIClient = setupGateway()
	return cachedAIClient
}
