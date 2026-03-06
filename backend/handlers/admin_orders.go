package handlers

import (
	"net/http"

	"github.com/axelprz/altisimo-panaderia-final/database"
	"github.com/axelprz/altisimo-panaderia-final/models"
	"github.com/axelprz/altisimo-panaderia-final/services"
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
	id := c.Param("id")

	var input struct {
		Status       string `json:"status"`
		Reason       string `json:"reason"`
		DeliveryDate string `json:"delivery_date"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	var order models.Order
	// IMPORTANTE: Hacemos Preload("User") para poder acceder al email del cliente
	if err := database.DB.Preload("User").First(&order, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pedido no encontrado"})
		return
	}

	// Guardamos el estado actual para saber si realmente cambió
	oldStatus := order.Status

	order.Status = input.Status

	if input.Reason != "" {
		order.RejectionReason = input.Reason
	}

	if input.DeliveryDate != "" {
		order.DeliveryDate = input.DeliveryDate
	}

	if err := database.DB.Save(&order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al guardar el estado"})
		return
	}

	// ========================================================
	// LÓGICA DE ENVÍO DE CORREOS
	// ========================================================
	// Solo enviamos correo si el estado es nuevo (evita spam si se hace doble clic)
	if oldStatus != input.Status && order.User.Email != "" {
		switch input.Status {
		case "accepted":
			services.SendOrderAcceptedEmail(order.User.Email, order.ID, input.DeliveryDate)
		case "rejected":
			services.SendOrderRejectedEmail(order.User.Email, order.ID, input.Reason, false)
		case "cancelled":
			services.SendOrderRejectedEmail(order.User.Email, order.ID, input.Reason, true)
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Estado actualizado correctamente"})
}
