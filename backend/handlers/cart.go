package handlers

import (
	"net/http"

	"github.com/axelprz/altisimo-panaderia-final/database"
	"github.com/axelprz/altisimo-panaderia-final/models"
	"github.com/gin-gonic/gin"
)

type CartInput struct {
	ProductID uint   `json:"product_id" binding:"required"`
	Quantity  int    `json:"quantity" binding:"required,min=1"`
	Variedad  string `json:"variedad"`
}

func AddToCart(c *gin.Context) {
	// Extraemos el ID del usuario del middleware
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Debes iniciar sesión para comprar"})
		return
	}

	var input CartInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	// CONVERSIÓN SEGURA: Revisamos de qué tipo es el userID antes de transformarlo
	var uid uint
	switch v := userID.(type) {
	case float64:
		uid = uint(v) // Si viene directo del JWT (JSON suele leer los números como float64)
	case uint:
		uid = v // Si tu middleware ya lo convirtió a uint
	case int:
		uid = uint(v) // Si es un int normal
	default:
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error interno con el formato del ID de usuario"})
		return
	}

	// Buscar si el producto ya está en el carrito
	var existingItem models.CartItem
	result := database.DB.Where("user_id = ? AND product_id = ? AND variedad = ?", uid, input.ProductID, input.Variedad).First(&existingItem)

	if result.Error == nil {
		// Ya existe, sumamos la cantidad
		existingItem.Quantity += input.Quantity
		database.DB.Save(&existingItem)
		c.JSON(http.StatusOK, existingItem)
		return
	}

	// No existe, lo creamos
	newItem := models.CartItem{
		UserID:    uid,
		ProductID: input.ProductID,
		Quantity:  input.Quantity,
		Variedad:  input.Variedad,
	}

	if err := database.DB.Create(&newItem).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudo guardar el producto en la base de datos"})
		return
	}

	c.JSON(http.StatusCreated, newItem)
}

func GetCart(c *gin.Context) {
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

	var items []models.CartItem
	// Preload("Product") hace el "JOIN" automático para traernos foto, nombre y precio
	if err := database.DB.Preload("Product").Where("user_id = ?", uid).Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener el carrito"})
		return
	}

	c.JSON(http.StatusOK, items)
}

func RemoveFromCart(c *gin.Context) {
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

	itemID := c.Param("id")

	// Borramos el item asegurándonos de que pertenezca a este usuario
	if err := database.DB.Where("id = ? AND user_id = ?", itemID, uid).Delete(&models.CartItem{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al eliminar el producto"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Producto eliminado del carrito"})
}

type UpdateCartInput struct {
	Quantity int `json:"quantity" binding:"required,min=1"`
}

func UpdateCartItem(c *gin.Context) {
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

	itemID := c.Param("id")
	var input UpdateCartInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cantidad inválida"})
		return
	}

	var item models.CartItem
	// Buscamos el ítem asegurándonos de que sea del usuario correcto
	if err := database.DB.Where("id = ? AND user_id = ?", itemID, uid).First(&item).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ítem no encontrado"})
		return
	}

	// Actualizamos la cantidad y guardamos
	item.Quantity = input.Quantity
	database.DB.Save(&item)

	c.JSON(http.StatusOK, item)
}
