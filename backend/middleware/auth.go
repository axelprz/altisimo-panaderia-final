package middleware

import (
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func RequireAuth(c *gin.Context) {
	// 1. Obtener el header
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header faltante"})
		return
	}

	// 2. Separar "Bearer" del token de forma segura
	// Esto maneja si el usuario puso muchos espacios o ninguno
	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Formato de token inválido. Debe ser: Bearer <token>"})
		return
	}

	tokenString := parts[1]

	// 3. Leer secreto y DEPURAR (Ver en consola si está vacío)
	jwtSecret := os.Getenv("JWT_SECRET")

	// --- BORRAR ESTOS PRINTS EN PRODUCCIÓN ---
	fmt.Println("--- DEBUG AUTH ---")
	fmt.Printf("Token recibido: %s...\n", tokenString[:10]) // Muestra los primeros 10 chars
	fmt.Printf("Secreto usado (len): %d\n", len(jwtSecret)) // Si es 0, ahí está el error
	// ------------------------------------------

	if jwtSecret == "" {
		c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Error servidor: JWT_SECRET no cargado"})
		return
	}

	// 4. Validar Token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("método de firma inesperado: %v", token.Header["alg"])
		}
		return []byte(jwtSecret), nil
	})

	// 5. Manejo de errores explícito
	if err != nil {
		fmt.Println("❌ Error JWT:", err) // ESTO TE DIRÁ LA CAUSA REAL
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token inválido: " + err.Error()})
		return
	}

	if !token.Valid {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token no válido"})
		return
	}

	// (Opcional) Guardar datos del usuario en el contexto para usarlos en el handler
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		// Asegúrate de que 'sub' sea lo que esperas (float64 por defecto en JSON numbers)
		c.Set("user_id", claims["sub"])
		c.Set("user_email", claims["email"])
	}

	c.Next()
}
