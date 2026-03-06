package database

import (
	"log"

	"github.com/axelprz/altisimo-panaderia-final/models"
	"golang.org/x/crypto/bcrypt"
)

func SeedUsers() {
	log.Println("👤 Verificando usuarios iniciales...")

	// Definimos los dos usuarios que necesitamos
	users := []struct {
		Email    string
		Password string
		Role     string
	}{
		{"admin@altisimo.com", "123456", "admin"},         // El dueño de la panadería
		{"axelperez164623@gmail.com", "123456", "client"}, // Un cliente para probar el carrito
	}

	for _, u := range users {
		var existingUser models.User

		// 1. Verificamos si el usuario ya existe
		if err := DB.Where("email = ?", u.Email).First(&existingUser).Error; err == nil {
			// ¡AQUÍ ESTÁ LA MAGIA! Si existe, le forzamos el rol correcto.
			DB.Model(&existingUser).Update("role", u.Role)

			log.Printf("ℹ️ El usuario %s ya existe. Se actualizó su rol a: %s", u.Email, u.Role)
			continue
		}

		// 2. Si no existe, lo creamos de cero
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
		if err != nil {
			log.Fatalf("❌ Error encriptando password para %s: %v", u.Email, err)
		}

		newUser := models.User{
			Email:    u.Email,
			Password: string(hashedPassword),
			Role:     u.Role,
		}

		if err := DB.Create(&newUser).Error; err != nil {
			log.Fatalf("❌ Error guardando a %s: %v", u.Email, err)
		}

		log.Printf("✅ ¡Usuario [%s] creado exitosamente con el rol: %s!", u.Email, u.Role)
	}
}
