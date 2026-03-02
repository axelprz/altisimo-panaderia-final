package handlers

import (
	"net/http"

	"github.com/axelprz/altisimo-panaderia-final/database"
	"github.com/axelprz/altisimo-panaderia-final/models"
	"github.com/gin-gonic/gin"
)

type UpdateOrderStatusInput struct {
	Status          string `json:"status" binding:"required"`
	RejectionReason string `json:"rejection_reason"`
	DeliveryDate    string `json:"delivery_date"`
}

func GetPendingOrders(c *gin.Context) {
	var orders []models.Order
	// Buscamos pedidos pendientes y precargamos los ítems, el producto de cada ítem y el usuario
	if err := database.DB.Preload("Items").Preload("Items.Product").Preload("User").Where("status = ?", "pending").Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener pedidos"})
		return
	}
	c.JSON(http.StatusOK, orders)
}

func UpdateOrderStatus(c *gin.Context) {
	orderID := c.Param("id")
	var input UpdateOrderStatusInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	var order models.Order
	if err := database.DB.First(&order, orderID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pedido no encontrado"})
		return
	}

	// Actualizamos estado y motivo
	order.Status = input.Status
	switch input.Status {
	case "rejected":
		order.RejectionReason = input.RejectionReason
	case "accepted":
		order.DeliveryDate = input.DeliveryDate // <--- GUARDAMOS LA FECHA
	}

	database.DB.Save(&order)

	c.JSON(http.StatusOK, gin.H{"message": "Estado del pedido actualizado exitosamente"})
}
