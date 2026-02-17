package models

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Email    string `gorm:"uniqueIndex;not null" json:"email"`
	Password string `json:"-"` // Nunca devolvemos el password en el JSON
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
