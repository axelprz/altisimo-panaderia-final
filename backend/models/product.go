package models

import "gorm.io/gorm"

type Product struct {
	gorm.Model
	Name       string   `json:"name"`
	Price      float64  `json:"price"`  // ¡Imprescindible para el carrito!
	Unidad     string   `json:"unidad"` // Kilo, Docena, etc.
	Desc       string   `json:"desc"`
	Image      string   `json:"img"`                               // Lo llamamos Image en Go, pero viaja como "img" a Angular
	Variedades []string `json:"variedades" gorm:"serializer:json"` // Permite guardar arreglos en PostgreSQL/MySQL sin complicarnos
}
