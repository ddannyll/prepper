package handlers

import (
	"fmt"
	"strings"

	"github.com/ddannyll/prepper/pkg/config"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/session"
	"github.com/golang-jwt/jwt"
)

type AuthMiddleware struct {
	Store     *session.Store
	jwtSecret string
}

func NewAuthMiddleware(store *session.Store,
	config config.EnvVars,

) *AuthMiddleware {
	return &AuthMiddleware{Store: store, jwtSecret: config.JWT_SECRET}
}

func (a *AuthMiddleware) AuthenticateRoute(c *fiber.Ctx) error {

	authHeader := c.Get("Authorization")

	if authHeader == "" {
		return fiber.NewError(fiber.StatusUnauthorized, "Authorization header missing")
	}
	headerParts := strings.Split(authHeader, " ")
	if len(headerParts) != 2 || headerParts[0] != "Bearer" {
		return fiber.NewError(fiber.StatusUnauthorized, "Authorization header format must be Bearer {token}")
	}

	token, err := jwt.Parse(headerParts[1], func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(a.jwtSecret), nil
	})

	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, "Invalid token")
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		// Set user ID in Fiber context
		c.Locals("userID", claims["user_id"])
	} else {
		return fiber.NewError(fiber.StatusUnauthorized, "Invalid token claims")
	}

	return c.Next()
}
