package handlers

import (
	"encoding/base64"
	"fmt"
	"io"
	"net/http"
	"strconv"

	"github.com/axelprz/altisimo-panaderia-final/database"
	"github.com/axelprz/altisimo-panaderia-final/models"
	"github.com/gin-gonic/gin"
)

// GetProducts devuelve la lista de productos (Público)
func GetProducts(c *gin.Context) {
	var products []models.Product

	if err := database.DB.Find(&products).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener productos"})
		return
	}

	c.JSON(http.StatusOK, products)
}

// CreateProduct recibe datos y una imagen, y crea el producto
func CreateProduct(c *gin.Context) {
	name := c.PostForm("name")
	desc := c.PostForm("description")
	unidad := c.PostForm("unidad")

	isActiveStr := c.PostForm("is_active")
	isActive := true // Por defecto lo hacemos visible
	if isActiveStr == "false" {
		isActive = false
	}

	if unidad == "" {
		unidad = "Unidad"
	}

	priceStr := c.PostForm("price")
	price, err := strconv.ParseFloat(priceStr, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Precio inválido"})
		return
	}

	var imageBase64 string
	file, err := c.FormFile("image")
	if err == nil {
		// Abrimos el archivo subido
		f, _ := file.Open()
		defer f.Close()

		// Leemos todos los bytes del archivo
		fileBytes, _ := io.ReadAll(f)

		// Detectamos el tipo de imagen (jpeg, png, webp)
		contentType := http.DetectContentType(fileBytes)

		// Convertimos los bytes a un texto seguro en Base64
		encodedString := base64.StdEncoding.EncodeToString(fileBytes)

		// Armamos el formato estándar que entienden los navegadores HTML
		imageBase64 = fmt.Sprintf("data:%s;base64,%s", contentType, encodedString)
	}

	product := models.Product{
		Name:     name,
		Desc:     desc,
		Price:    price,
		Unidad:   unidad,
		Image:    imageBase64, // Guardamos el texto gigante en la DB
		IsActive: isActive,
	}

	if err := database.DB.Create(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al guardar en base de datos"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Producto creado", "product": product})
}

// UpdateProduct modifica un producto existente (sin tocar la imagen por ahora por simplicidad)
func UpdateProduct(c *gin.Context) {
	id := c.Param("id")
	var product models.Product

	if err := database.DB.First(&product, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Producto no encontrado"})
		return
	}

	// NUEVA ESTRUCTURA: Añadimos IsActive
	var input struct {
		Name     string  `json:"name"`
		Desc     string  `json:"desc"`
		Price    float64 `json:"price"`
		Unidad   string  `json:"unidad"`
		IsActive *bool   `json:"is_active"` // Puntero para no confundir false con "vacío"
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	product.Name = input.Name
	product.Desc = input.Desc
	product.Price = input.Price
	if input.Unidad != "" {
		product.Unidad = input.Unidad
	}

	// Si nos enviaron el estado, lo actualizamos
	if input.IsActive != nil {
		product.IsActive = *input.IsActive
	}

	database.DB.Save(&product)
	c.JSON(http.StatusOK, gin.H{"message": "Producto actualizado"})
}

// DeleteProduct elimina un producto (Soft Delete de Gorm)
func DeleteProduct(c *gin.Context) {
	id := c.Param("id")
	if err := database.DB.Delete(&models.Product{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al eliminar"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Producto eliminado del catálogo"})
}
