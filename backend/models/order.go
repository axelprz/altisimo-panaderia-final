package models

import "gorm.io/gorm"

type Order struct {
	gorm.Model
	UserID          uint        `json:"user_id"`
	Total           float64     `json:"total"`
	Status          string      `json:"status"`           // "pending", "accepted", "rejected"
	RejectionReason string      `json:"rejection_reason"` // <-- NUEVO CAMPO
	DeliveryDate    string      `json:"delivery_date"`
	Items           []OrderItem `json:"items" gorm:"foreignKey:OrderID"`
	// Opcional: Relación para traer los datos del cliente
	User User `json:"user" gorm:"foreignKey:UserID"`
}

type OrderItem struct {
	gorm.Model
	OrderID   uint    `json:"order_id"`
	ProductID uint    `json:"product_id"`
	Quantity  int     `json:"quantity"`
	Variedad  string  `json:"variedad"`
	Price     float64 `json:"price"` // Guardamos el precio al momento de comprar
	Product   Product `json:"product" gorm:"foreignKey:ProductID"`
}
