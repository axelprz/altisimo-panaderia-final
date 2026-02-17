package handlers

import (
	"net/http"
	"os"
	"time"

	"github.com/axelprz/altisimo-panaderia-final/database"
	"github.com/axelprz/altisimo-panaderia-final/models"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type RegisterInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

func CreateUser(c *gin.Context) {
	var input RegisterInput

	// 1. Validar JSON
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 2. Encriptar contraseña
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudo procesar la contraseña"})
		return
	}

	// 3. Crear usuario
	user := models.User{
		Email:    input.Email,
		Password: string(hashedPassword),
	}

	// 4. Guardar en BD
	if result := database.DB.Create(&user); result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "El usuario ya existe o hubo un error en BD"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Usuario creado exitosamente", "email": user.Email})
}

func Login(c *gin.Context) {
	var input models.LoginInput
	var user models.User

	// 1. Validar JSON
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	// 2. Buscar usuario en DB
	if err := database.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		// SEGURIDAD: Retardo artificial para evitar enumeración de usuarios
		time.Sleep(2 * time.Second)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Credenciales inválidas"})
		return
	}

	// 3. Verificar password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		// SEGURIDAD: Retardo artificial si falla el password
		time.Sleep(2 * time.Second)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Credenciales inválidas"})
		return
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fatal: JWT_SECRET no configurado"})
		return
	}

	// 4. Generar Token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":   user.ID,
		"email": user.Email,
		"exp":   time.Now().Add(time.Hour * 24).Unix(),
	})

	tokenString, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error generando token"})
		return
	}

	c.JSON(http.StatusOK, models.LoginResponse{
		Token: tokenString,
		User:  user.Email,
	})
}
