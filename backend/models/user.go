package models

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Email    string `json:"email" gorm:"unique"`
	Password string `json:"-"`                            // El "-" oculta la contraseña cuando enviamos el JSON a Angular
	Role     string `json:"role" gorm:"default:'client'"` // <-- ¡ESTE ES EL CAMPO CLAVE!
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
