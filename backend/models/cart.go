package models

import "gorm.io/gorm"

type CartItem struct {
	gorm.Model
	UserID    uint   `json:"user_id"`
	ProductID uint   `json:"product_id"`
	Quantity  int    `json:"quantity"`
	Variedad  string `json:"variedad"`
	// Relación para traer los datos del producto automáticamente después
	Product Product `gorm:"foreignKey:ProductID" json:"product"`
}
