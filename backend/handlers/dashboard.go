package handlers

import (
	"net/http"
	"time"

	"github.com/axelprz/altisimo-panaderia-final/database"
	"github.com/axelprz/altisimo-panaderia-final/models"
	"github.com/gin-gonic/gin"
)

func GetDashboardStats(c *gin.Context) {
	var pendingCount int64
	var acceptedCount int64
	var deliveredCount int64 // NUEVO
	var totalSales float64

	// Contadores básicos
	database.DB.Model(&models.Order{}).Where("status = ?", "pending").Count(&pendingCount)
	database.DB.Model(&models.Order{}).Where("status = ?", "accepted").Count(&acceptedCount)
	database.DB.Model(&models.Order{}).Where("status = ?", "delivered").Count(&deliveredCount)

	// Total de dinero (solo entregados)
	database.DB.Model(&models.Order{}).Where("status = ?", "delivered").Select("COALESCE(SUM(total), 0)").Scan(&totalSales)

	// NUEVO: Historial de ventas de los últimos 7 días (para el gráfico de líneas)
	var dailySales []struct {
		Date  string  `json:"date"`
		Total float64 `json:"total"`
	}

	// Consulta SQL para agrupar ventas por día (solo entregados)
	database.DB.Model(&models.Order{}).
		Select("DATE(updated_at) as date, SUM(total) as total").
		Where("status = ? AND updated_at >= ?", "delivered", time.Now().AddDate(0, 0, -7)).
		Group("DATE(updated_at)").
		Order("date ASC").
		Scan(&dailySales)

	c.JSON(http.StatusOK, gin.H{
		"pending_orders":   pendingCount,
		"accepted_orders":  acceptedCount,
		"delivered_orders": deliveredCount, // Lo enviamos
		"total_sales":      totalSales,
		"daily_sales":      dailySales, // Enviamos el historial
	})
}
