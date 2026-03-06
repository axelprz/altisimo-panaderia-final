package models

import "gorm.io/gorm"

type Order struct {
	gorm.Model
	UserID          uint    `json:"user_id"`
	Total           float64 `json:"total"`
	Status          string  `json:"status"`
	RejectionReason string  `json:"rejection_reason"`
	DeliveryDate    string  `json:"delivery_date"`

	// NUEVOS CAMPOS: Snapshot de la dirección para el repartidor
	DeliveryAddress string `json:"delivery_address"`
	DeliveryPhone   string `json:"delivery_phone"`

	Items []OrderItem `json:"items" gorm:"foreignKey:OrderID"`
	User  User        `json:"user" gorm:"foreignKey:UserID"`
}

type OrderItem struct {
	gorm.Model
	OrderID   uint    `json:"order_id"`
	ProductID uint    `json:"product_id"`
	Quantity  int     `json:"quantity"`
	Variedad  string  `json:"variedad"`
	Price     float64 `json:"price"`
	Product   Product `json:"product" gorm:"foreignKey:ProductID"`
}
