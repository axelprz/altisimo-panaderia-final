package handlers

import (
	"net/http"
	"github.com/axelprz/altisimo-panaderia-final/database"
	"github.com/axelprz/altisimo-panaderia-final/models"
	"github.com/gin-gonic/gin"
)

// GetProducts devuelve la lista de productos
func GetProducts(c *gin.Context) {
	var products []models.Product
	
	if err := database.DB.Find(&products).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener productos"})
		return
	}

	c.JSON(http.StatusOK, products)
}