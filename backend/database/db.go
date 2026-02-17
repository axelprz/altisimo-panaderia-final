package database

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/axelprz/altisimo-panaderia-final/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() {
	var err error

	// Variables de entorno definidas en docker-compose.yml
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=America/Argentina/Buenos_Aires",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)

	// Intentar conectar 10 veces (útil para Docker)
	for i := 0; i < 10; i++ {
		DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
		if err == nil {
			log.Println("✅ Conectado a PostgreSQL exitosamente.")
			break
		}
		log.Printf("⚠️ Intento %d/10 fallido. Reintentando en 2s...", i+1)
		time.Sleep(2 * time.Second)
	}

	if err != nil {
		log.Fatal("❌ Error fatal: No se pudo conectar a la BD:", err)
	}

	// Crea la tabla de usuarios automáticamente si no existe
	DB.AutoMigrate(&models.User{})
}
