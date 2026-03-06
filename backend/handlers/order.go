package handlers

import (
	"net/http"

	"github.com/axelprz/altisimo-panaderia-final/database"
	"github.com/axelprz/altisimo-panaderia-final/models"
	"github.com/gin-gonic/gin"
)

type CheckoutInput struct {
	AddressID uint `json:"address_id" binding:"required"`
}

func CheckoutCart(c *gin.Context) {
	// 1. Obtener usuario
	uid, exists := getUserID(c) // Usamos la misma función auxiliar
	if !exists {
		return
	}

	// NUEVO: 2. Recibir la dirección elegida
	var input CheckoutInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Debes seleccionar una dirección de envío"})
		return
	}

	// NUEVO: 3. Buscar los datos reales de esa dirección
	var address models.Address
	if err := database.DB.Where("id = ? AND user_id = ?", input.AddressID, uid).First(&address).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "La dirección seleccionada no es válida"})
		return
	}

	// 4. Traer el carrito completo
	var cartItems []models.CartItem
	if err := database.DB.Preload("Product").Where("user_id = ?", uid).Find(&cartItems).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al leer carrito"})
		return
	}

	if len(cartItems) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "El carrito está vacío"})
		return
	}

	// 5. Calcular Total
	var total float64
	for _, item := range cartItems {
		total += item.Product.Price * float64(item.Quantity)
	}

	// 6. Crear el Pedido copiando los datos de la dirección (Snapshot)
	fullAddress := address.Street + ", " + address.City
	if address.Reference != "" {
		fullAddress += " (Ref: " + address.Reference + ")"
	}

	order := models.Order{
		UserID:          uid,
		Total:           total,
		Status:          "pending",
		DeliveryAddress: fullAddress,   // <-- Guardamos la ruta final
		DeliveryPhone:   address.Phone, // <-- Guardamos el teléfono
	}
	database.DB.Create(&order)

	// 7. Mover items del carrito al pedido (OrderItems)
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

	// 8. Vaciar el carrito
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

func GetAcceptedOrders(c *gin.Context) {
	var orders []models.Order

	// Buscamos órdenes con estado "accepted", precargamos el User y los Items (con sus Productos)
	if err := database.DB.Preload("User").Preload("Items.Product").Where("status = ?", "accepted").Order("delivery_date asc").Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener pedidos para entregar"})
		return
	}

	c.JSON(http.StatusOK, orders)
}
