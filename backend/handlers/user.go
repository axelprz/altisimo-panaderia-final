package handlers

import (
	"net/http"

	"github.com/axelprz/altisimo-panaderia-final/database"
	"github.com/axelprz/altisimo-panaderia-final/models"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// Estructura que esperamos recibir del frontend
type ChangePasswordInput struct {
	CurrentPassword string `json:"currentPassword" binding:"required"`
	NewPassword     string `json:"newPassword" binding:"required,min=6"`
}

func ChangePassword(c *gin.Context) {
	var input ChangePasswordInput
	var user models.User

	// 1. Validar JSON entrante
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos o contraseña muy corta"})
		return
	}

	// 2. Obtener el email del usuario logueado desde el Token (Contexto)
	// (Recuerda que nuestro middleware RequireAuth guarda esto)
	userEmail, exists := c.Get("user_email")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autorizado"})
		return
	}

	// 3. Buscar al usuario en la base de datos
	if err := database.DB.Where("email = ?", userEmail).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuario no encontrado"})
		return
	}

	// 4. Verificar que la contraseña actual es correcta
	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.CurrentPassword))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "La contraseña actual es incorrecta"})
		return
	}

	// 5. Encriptar la NUEVA contraseña
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al procesar la nueva contraseña"})
		return
	}

	// 6. Actualizar y guardar en BD
	user.Password = string(hashedPassword)
	if err := database.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudo actualizar la contraseña"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Contraseña actualizada exitosamente"})
}

func GetUserAddresses(c *gin.Context) {
	uid, exists := getUserID(c) // Función auxiliar (ver abajo)
	if !exists {
		return
	}

	var addresses []models.Address
	database.DB.Where("user_id = ?", uid).Find(&addresses)

	c.JSON(http.StatusOK, addresses)
}

// CreateAddress guarda una nueva dirección en el perfil
func CreateAddress(c *gin.Context) {
	uid, exists := getUserID(c)
	if !exists {
		return
	}

	var input models.Address
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	// Si es la primera dirección que crea, la hacemos por defecto
	var count int64
	database.DB.Model(&models.Address{}).Where("user_id = ?", uid).Count(&count)
	if count == 0 {
		input.IsDefault = true
	}

	input.UserID = uid
	database.DB.Create(&input)

	c.JSON(http.StatusCreated, input)
}

// DeleteAddress elimina una dirección
func DeleteAddress(c *gin.Context) {
	addressID := c.Param("id")
	uid, exists := getUserID(c)
	if !exists {
		return
	}

	// Solo permitimos borrar si la dirección pertenece a este usuario
	database.DB.Where("id = ? AND user_id = ?", addressID, uid).Delete(&models.Address{})
	c.JSON(http.StatusOK, gin.H{"message": "Dirección eliminada"})
}

// --- Función Auxiliar para no repetir código ---
func getUserID(c *gin.Context) (uint, bool) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "No autorizado"})
		return 0, false
	}
	var uid uint
	switch v := userID.(type) {
	case float64:
		uid = uint(v)
	case uint:
		uid = v
	case int:
		uid = uint(v)
	}
	return uid, true
}
