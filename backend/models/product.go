package models

import "gorm.io/gorm"

type Product struct {
	gorm.Model
	Name   string  `json:"name"`
	Price  float64 `json:"price"`
	Unidad string  `json:"unidad"`
	Desc   string  `json:"desc"`
	// AÑADIMOS gorm:"type:text" para que soporte imágenes en Base64
	Image      string   `json:"img" gorm:"type:text"`
	Variedades []string `json:"variedades" gorm:"serializer:json"`
	IsActive   bool     `json:"is_active" gorm:"default:true"`
}
