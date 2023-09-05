package handlers

import (
	"fmt"
	"log"

	"github.com/ddannyll/prepper/db"
	"github.com/ddannyll/prepper/pkg/config"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/session"
	"github.com/golang-jwt/jwt"

	"golang.org/x/crypto/bcrypt"
)

type UserHandler struct {
	SessionStore *session.Store
	dbClient     *db.PrismaClient
	jwtSecret    string
}

func NewUserHandler(sessionStore *session.Store, config config.EnvVars, dbClient *db.PrismaClient) *UserHandler {
	return &UserHandler{
		SessionStore: sessionStore,
		dbClient:     dbClient,
		jwtSecret:    config.JWT_SECRET,
	}
}

type userCredentialsBody struct {
	Username string `json:"username" validate:"required" example:"daniel"`
	Password string `json:"password" validate:"required,min=6" example:"daniel321"`
} //@name UserCredentials

type userSigninSuccessResponse struct {
	Id          string `json:"id" example:"1337"`
	AccessToken string `json:"access_token"`
} //@name UserSigninResponse

// SignUp godoc
//
//	@Summary		Sign a user up to dancord
//	@description	Insert description here
//	@Tags			user
//	@Accept			json
//	@Param			SignUpBody	body	userCredentialsBody	true	"Password must be atleast 6 characters."
//	@Produce		json
//	@Success		200	{object}	userSigninSuccessResponse
//	@Router			/user/signup [post]
func (u *UserHandler) SignUpUser(c *fiber.Ctx) error {
	var user userCredentialsBody
	if err := parseAndValidateBody(c, &user); err != nil {
		return err
	}

	// // hashedPassword, err := hashPassword(user.Password)
	// if err != nil {
	// 	return fiber.NewError(fiber.StatusBadRequest, "invalid password")
	// }

	// userId, err := u.Storage.CreateNewUser(storage.NewUser{
	// 	Username:       user.Username,
	// 	HashedPassword: hashedPassword,
	// })

	createdUser, createError := u.dbClient.User.CreateOne(
		db.User.Username.Set(user.Username),
	).Exec(c.Context())

	if createError != nil {
		return createError
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": createdUser.ID,
		"auth":    true,
	})

	tokenString, err := token.SignedString([]byte(u.jwtSecret))

	if err != nil {

		log.Println(err)
		return fiber.NewError(fiber.StatusUnauthorized, "invalid username and/or password")
	}

	return c.JSON(userSigninSuccessResponse{
		Id:          fmt.Sprint(createdUser.ID),
		AccessToken: tokenString,
	})

}

// Signin godoc
//
//	@Summary	Sign a user
//	@description
//	@Tags		user
//	@Accept		json
//	@Param		SignInBody	body	userCredentialsBody	true	"Password must be atleast 6 characters."
//	@Produce	json
//	@Success	200	{object}	userSigninSuccessResponse
//	@Failure	401	"Invalid Credentials"
//	@Router		/user/signin [post]
func (u *UserHandler) SignInUser(c *fiber.Ctx) error {

	return nil
}

// SignOut godoc
//
//	@Summary	Sign a user out of dancord
//	@description
//	@Tags		user
//	@Produce	json
//	@Success	200	"on successful signout"
//	@Router		/user/signout [post]
func (u *UserHandler) SignOutUser(c *fiber.Ctx) error {
	sess, err := u.SessionStore.Get(c)
	if err != nil {
		return err
	}
	if err := sess.Destroy(); err != nil {
		return err
	}
	if err := sess.Save(); err != nil {
		return err
	}
	return c.JSON(fiber.Map{
		"success": true,
	})
}

// HealthCheck godoc
//
//	@Summary	Check if a user is signed in
//	@description
//	@Tags		user
//	@Produce	json
//	@Success	200	"if signed in `{"success": true}`"
//	@Failure	401	"if not signed in"
//	@Router		/user/healthcheck [get]
func (u *UserHandler) HealthCheckUser(c *fiber.Ctx) error {

	sess, err := u.SessionStore.Get(c)
	if err != nil || sess.Get("auth") != true {
		return fiber.NewError(fiber.StatusUnauthorized, "unauthorized")
	}

	// TODO - abstract the user_id into a helper function
	// There is repeated code everywhere -> could we possibly inject the user details into the context?
	// After it has been passed to the auth middleware?

	log.Println(sess.Get("user_id"))

	return c.JSON(fiber.Map{"success": true})
}

func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func checkPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}
