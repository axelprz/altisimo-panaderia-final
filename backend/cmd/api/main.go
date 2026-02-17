package main

import (
	"log"
	"time"

	"github.com/axelprz/altisimo-panaderia-final/database"
	"github.com/axelprz/altisimo-panaderia-final/handlers"
	"github.com/axelprz/altisimo-panaderia-final/middleware"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// 1. Conectar a Base de Datos
	log.Println("🔌 Iniciando conexión a la base de datos...")
	database.Connect()

	// Validación de seguridad: Si la DB es nula, no podemos seguir
	if database.DB == nil {
		log.Fatal("❌ Error Crítico: La base de datos es nil. El servidor se detendrá.")
	}

	r := gin.Default()

	// 2. Configuración de CORS
	r.Use(cors.New(cors.Config{
		// IMPORTANTE: Agregamos "http://localhost" porque tu frontend Docker corre en puerto 80
		AllowOrigins:     []string{"http://localhost:4200", "http://localhost"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// 3. Rutas
	api := r.Group("/api")
	{
		// Ruta PÚBLICA (Cualquiera puede intentar loguearse)
		api.POST("/login", middleware.RateLimitMiddleware(), handlers.Login)

		// Rutas PRIVADAS (Requieren Token)
		protected := api.Group("/admin")
		protected.Use(middleware.RequireAuth) // <--- Aquí aplicamos el candado
		{
			protected.POST("/users", handlers.CreateUser)
		}
	}

	log.Println("🚀 Servidor corriendo en puerto 8080")
	r.Run(":8080")
}
