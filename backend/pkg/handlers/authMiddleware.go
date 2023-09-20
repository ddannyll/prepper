package handlers

import (
	"fmt"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/session"
	"github.com/golang-jwt/jwt"

	"github.com/ddannyll/prepper/pkg/config"
)

type AuthMiddleware struct {
	Store     *session.Store
	jwtSecret string
}

func NewAuthMiddleware(store *session.Store, config config.EnvVars) *AuthMiddleware {
	return &AuthMiddleware{Store: store, jwtSecret: config.JWT_SECRET}
}

func (a *AuthMiddleware) AuthenticateRoute(c *fiber.Ctx) error {
	// get the url
	url := c.Path()

	authHeader := c.Get("Authorization")

	if authHeader == "" {
		return fiber.NewError(fiber.StatusUnauthorized, "Authorization header missing")
	}
	headerParts := strings.Split(authHeader, " ")
	if len(headerParts) != 2 || headerParts[0] != "Bearer" {
		return fiber.NewError(
			fiber.StatusUnauthorized,
			"Authorization header format must be Bearer {token}",
		)
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

	// TODO can be improved, hacking for now
	userID := c.Locals("userID").(string)

	// check if the url starts with /ai
	if strings.HasPrefix(url, "/ai") {
		// ratelimit to 20 requests per minute based on userID
		if a.isRateLimited(userID) {
			return fiber.NewError(fiber.StatusTooManyRequests, "Rate limit exceeded")
		}
	}

	return c.Next()
}

const (
	RateLimitPeriod   = 60 // seconds
	RateLimitRequests = 20 // max requests
)

type RateLimitData struct {
	FirstRequestTime int64 // timestamp of the first request in the current window
	RequestCount     int   // number of requests in the current window
}

var rateLimitMap = make(map[string]*RateLimitData) // maps userID to their rate limit data

func (a *AuthMiddleware) isRateLimited(userID string) bool {
	currentTime := time.Now().Unix()

	if data, exists := rateLimitMap[userID]; exists {
		if currentTime-data.FirstRequestTime > RateLimitPeriod {
			// Reset the rate limiting data if the period has passed
			data.FirstRequestTime = currentTime
			data.RequestCount = 1
		} else if data.RequestCount >= RateLimitRequests {
			// Rate limit the user if they exceeded the max requests in the current period
			return true
		} else {
			data.RequestCount++
		}
	} else {
		// New user entry
		rateLimitMap[userID] = &RateLimitData{
			FirstRequestTime: currentTime,
			RequestCount:     1,
		}
	}

	return false
}

const (
	IPRateLimitPeriod   = 2 * 60 // seconds, which equals 2 minutes
	IPRateLimitRequests = 10     // max requests per ^
)

type IPRateLimitData struct {
	FirstRequestTime int64 // timestamp of the first request in the current window
	RequestCount     int   // number of requests in the current window
}

var ipRateLimitMap = make(map[string]*IPRateLimitData) // maps IP address to their rate limit data

func (a *AuthMiddleware) isIPRateLimited(ip string) bool {
	currentTime := time.Now().Unix()

	if data, exists := ipRateLimitMap[ip]; exists {
		if currentTime-data.FirstRequestTime > IPRateLimitPeriod {
			// Reset the rate limiting data if the period has passed
			data.FirstRequestTime = currentTime
			data.RequestCount = 1
		} else if data.RequestCount >= IPRateLimitRequests {
			// Rate limit the IP if it exceeded the max requests in the current period
			return true
		} else {
			data.RequestCount++
		}
	} else {
		// New IP entry
		ipRateLimitMap[ip] = &IPRateLimitData{
			FirstRequestTime: currentTime,
			RequestCount:     1,
		}
	}

	return false
}

func (a *AuthMiddleware) IPRateLimitRoute(c *fiber.Ctx) error {
	// get the real ip address, after cloudflare and other proxies
	ip := c.IP()

	// Check for IP-based rate limiting
	if a.isIPRateLimited(ip) {
		return fiber.NewError(fiber.StatusTooManyRequests, "IP rate limit exceeded")
	}

	return c.Next()
}
