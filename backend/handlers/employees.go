package handlers

import (
	"net/http"

	"github.com/axelprz/altisimo-panaderia-final/database"
	"github.com/axelprz/altisimo-panaderia-final/models"
	"github.com/gin-gonic/gin"
)

// Obtener todos los empleados
func GetEmployees(c *gin.Context) {
	employees := []models.Employee{}
	database.DB.Find(&employees)
	c.JSON(http.StatusOK, employees)
}

// Crear un empleado
func CreateEmployee(c *gin.Context) {
	var employee models.Employee
	if err := c.ShouldBindJSON(&employee); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	database.DB.Create(&employee)
	c.JSON(http.StatusCreated, employee)
}

// Editar un empleado
func UpdateEmployee(c *gin.Context) {
	id := c.Param("id")
	var employee models.Employee

	if err := database.DB.First(&employee, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Empleado no encontrado"})
		return
	}

	if err := c.ShouldBindJSON(&employee); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	database.DB.Save(&employee)
	c.JSON(http.StatusOK, employee)
}

// Eliminar un empleado
func DeleteEmployee(c *gin.Context) {
	id := c.Param("id")
	// Borrado físico (GORM hace soft delete por defecto si tiene gorm.Model)
	if err := database.DB.Unscoped().Delete(&models.Employee{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al eliminar"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Empleado eliminado correctamente"})
}
