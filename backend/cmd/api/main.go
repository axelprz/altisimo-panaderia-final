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
	database.SeedProducts()
	database.SeedUsers()

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
		// Login Público (Clientes)
		api.POST("/login", middleware.RateLimitMiddleware(), handlers.Login)

		// ---> NUEVO: Login exclusivo para el Admin Panel <---
		// IMPORTANTE: Va aquí, FUERA de la zona que requiere Auth
		api.POST("/admin/login", middleware.RateLimitMiddleware(), handlers.AdminLogin)

		// RUTA PARA PRODUCTOS PÚBLICOS
		api.GET("/product", handlers.GetProducts)

		// Rutas del Admin (Requieren Token)
		protected := api.Group("/admin")
		protected.Use(middleware.RequireAuth)
		{
			protected.POST("/users", handlers.CreateUser)

			// --- RUTAS DEL DASHBOARD ---
			protected.GET("/dashboard/stats", handlers.GetDashboardStats)

			// --- RUTAS DE EMPLEADOS ---
			protected.GET("/employees", handlers.GetEmployees)
			protected.POST("/employees", handlers.CreateEmployee)
			protected.PUT("/employees/:id", handlers.UpdateEmployee)
			protected.DELETE("/employees/:id", handlers.DeleteEmployee)

			// --- RUTAS DE PEDIDOS ---
			protected.GET("/orders/pending", handlers.GetPendingOrders)
			protected.PUT("/orders/:id/status", handlers.UpdateOrderStatus)
		}

		// Rutas del Usuario (Requieren Token)
		userGroup := api.Group("/user")
		userGroup.Use(middleware.RequireAuth)
		{
			userGroup.PUT("/password", handlers.ChangePassword)
			userGroup.GET("/orders", handlers.GetUserOrders)
		}

		// RUTAS DEL CARRITO (Requieren Token)
		cartGroup := api.Group("/cart")
		cartGroup.Use(middleware.RequireAuth)
		{
			cartGroup.GET("", handlers.GetCart)
			cartGroup.POST("", handlers.AddToCart)
			cartGroup.PUT("/:id", handlers.UpdateCartItem)
			cartGroup.DELETE("/:id", handlers.RemoveFromCart)
			cartGroup.POST("/checkout", handlers.CheckoutCart)
		}
	}

	log.Println("🚀 Servidor corriendo en puerto 8080")
	r.Run(":8080")
}
