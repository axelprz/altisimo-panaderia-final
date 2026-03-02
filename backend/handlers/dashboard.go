package handlers

import (
	"net/http"

	"github.com/axelprz/altisimo-panaderia-final/database"
	"github.com/axelprz/altisimo-panaderia-final/models"
	"github.com/gin-gonic/gin"
)

type DashboardStats struct {
	TotalSales     float64 `json:"total_sales"`
	AcceptedOrders int64   `json:"accepted_orders"`
	PendingOrders  int64   `json:"pending_orders"`
}

func GetDashboardStats(c *gin.Context) {
	var pendingCount int64
	var acceptedCount int64
	var totalSales float64

	// 1. Contar pedidos pendientes
	database.DB.Model(&models.Order{}).Where("status = ?", "pending").Count(&pendingCount)

	// 2. Contar pedidos aceptados
	database.DB.Model(&models.Order{}).Where("status = ?", "accepted").Count(&acceptedCount)

	// 3. Sumar el total de dinero (solo de pedidos aceptados)
	// COALESCE evita errores si no hay ninguna venta aún (devuelve 0 en lugar de null)
	database.DB.Model(&models.Order{}).Where("status = ?", "accepted").Select("COALESCE(SUM(total), 0)").Scan(&totalSales)

	// 4. Enviar los datos exactos que Angular está esperando
	c.JSON(http.StatusOK, gin.H{
		"pending_orders":  pendingCount,
		"accepted_orders": acceptedCount,
		"total_sales":     totalSales,
	})
}
