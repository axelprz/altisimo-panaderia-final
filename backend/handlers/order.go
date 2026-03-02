package handlers

import (
	"net/http"

	"github.com/axelprz/altisimo-panaderia-final/database"
	"github.com/axelprz/altisimo-panaderia-final/models"
	"github.com/gin-gonic/gin"
)

func CheckoutCart(c *gin.Context) {
	// 1. Obtener usuario
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "No autorizado"})
		return
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

	// 2. Traer el carrito completo
	var cartItems []models.CartItem
	if err := database.DB.Preload("Product").Where("user_id = ?", uid).Find(&cartItems).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al leer carrito"})
		return
	}

	if len(cartItems) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "El carrito está vacío"})
		return
	}

	// 3. Calcular Total
	var total float64
	for _, item := range cartItems {
		total += item.Product.Price * float64(item.Quantity)
	}

	// 4. Crear el Pedido (Order) en estado pendiente
	order := models.Order{
		UserID: uid,
		Total:  total,
		Status: "pending",
	}
	database.DB.Create(&order)

	// 5. Mover items del carrito al pedido (OrderItems)
	for _, item := range cartItems {
		orderItem := models.OrderItem{
			OrderID:   order.ID,
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
			Variedad:  item.Variedad,
			Price:     item.Product.Price,
		}
		database.DB.Create(&orderItem)
	}

	// 6. Vaciar el carrito del usuario
	database.DB.Where("user_id = ?", uid).Delete(&models.CartItem{})

	c.JSON(http.StatusOK, gin.H{"message": "Pedido enviado a la panadería con éxito"})
}

func GetUserOrders(c *gin.Context) {
	// 1. Obtener el ID del usuario desde el middleware de autenticación
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "No autorizado"})
		return
	}

	// Conversión segura de tipo
	var uid uint
	switch v := userID.(type) {
	case float64:
		uid = uint(v)
	case uint:
		uid = v
	case int:
		uid = uint(v)
	}

	var orders []models.Order
	// 2. Traer pedidos del usuario con sus productos cargados (Preload)
	if err := database.DB.Preload("Items.Product").Where("user_id = ?", uid).Order("created_at desc").Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener historial"})
		return
	}

	c.JSON(http.StatusOK, orders)
}
