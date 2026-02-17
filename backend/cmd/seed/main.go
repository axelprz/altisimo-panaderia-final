package main

import (
	"log"
	"os"

	"github.com/axelprz/altisimo-panaderia-final/database"
	"github.com/axelprz/altisimo-panaderia-final/models"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	// 1. Cargar variables necesarias si no están (simulamos entorno local si falla)
	if os.Getenv("DB_HOST") == "" {
		os.Setenv("DB_HOST", "db")
		os.Setenv("DB_USER", "postgres")     // Ajusta según tu .env
		os.Setenv("DB_PASSWORD", "postgres") // Ajusta según tu .env
		os.Setenv("DB_NAME", "postgres")     // Ajusta según tu .env
		os.Setenv("DB_PORT", "5432")
	}

	// 2. Conectar a la DB
	database.Connect()

	// 3. Datos del Super Admin
	email := "admin@altisimo.com"
	password := "123456" // Contraseña plana

	// 4. Encriptar contraseña (IMPORTANTE: No guardar texto plano)
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatal("Error encriptando password:", err)
	}

	// 5. Crear objeto Usuario
	user := models.User{
		Email:    email,
		Password: string(hashedPassword),
	}

	// 6. Guardar en Base de Datos
	// Usamos FirstOrCreate para no duplicarlo si lo corres dos veces
	if err := database.DB.FirstOrCreate(&user, models.User{Email: email}).Error; err != nil {
		log.Fatal("❌ Error creando usuario:", err)
	}

	log.Println("✅ ¡Usuario Admin creado exitosamente!")
	log.Println("📧 Email:", email)
	log.Println("🔑 Password:", password)
}
