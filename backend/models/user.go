package models

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Email    string `json:"email" gorm:"unique"`
	Password string `json:"-"`
	Role     string `json:"role" gorm:"default:'client'"`
	// NUEVO: Relación 1 a muchos (Un usuario tiene muchas direcciones)
	Addresses []Address `json:"addresses" gorm:"foreignKey:UserID"`
}

type Address struct {
	gorm.Model
	UserID    uint   `json:"user_id"`
	Title     string `json:"title"`     // Ej: "Casa", "Trabajo"
	Street    string `json:"street"`    // Ej: "San Martín 123"
	City      string `json:"city"`      // Ej: "Mendoza"
	Phone     string `json:"phone"`     // Teléfono de contacto para esa dirección
	Reference string `json:"reference"` // Ej: "Puerta verde al lado del kiosco"
	IsDefault bool   `json:"is_default" gorm:"default:false"`
}

// Estructuras auxiliares para recibir datos del login
type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token string `json:"token"`
	User  string `json:"user"`
}
