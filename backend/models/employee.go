package models

import "gorm.io/gorm"

type Employee struct {
	gorm.Model
	Name     string `gorm:"not null" json:"name"`
	LastName string `gorm:"not null" json:"last_name"`
	DNI      string `gorm:"uniqueIndex;not null" json:"dni"`
	Role     string `gorm:"not null" json:"role"`
	Phone    string `json:"phone"`
	IsActive bool   `gorm:"default:true" json:"is_active"`
}
