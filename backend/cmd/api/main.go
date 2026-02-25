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
	
	log.Println("🔌 Iniciando conexión a la base de datos...")
	database.Connect()

	
	if database.DB == nil {
		log.Fatal("❌ Error Crítico: La base de datos es nil.")
	}

	r := gin.Default()


	r.Use(cors.New(cors.Config{
		
		AllowOrigins:     []string{"http://localhost:4200", "http://localhost"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	api := r.Group("/api")
	{
		api.POST("/login", middleware.RateLimitMiddleware(), handlers.Login)
		
		// RUTA PARA PRODUCTOS
		api.GET("/product", handlers.GetProducts) 

		protected := api.Group("/admin")
		protected.Use(middleware.RequireAuth)
		{
			protected.POST("/users", handlers.CreateUser)
		}
	}

	log.Println("🚀 Servidor corriendo en puerto 8080")
	r.Run(":8080")
}
