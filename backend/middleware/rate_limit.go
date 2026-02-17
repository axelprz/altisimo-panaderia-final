package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

// IPManager gestiona los limitadores por cada dirección IP
type IPRateLimiter struct {
	ips map[string]*rate.Limiter
	mu  *sync.RWMutex
	r   rate.Limit
	b   int
}

// Constructor: r = peticiones por segundo, b = ráfaga máxima (burst)
func NewIPRateLimiter(r rate.Limit, b int) *IPRateLimiter {
	i := &IPRateLimiter{
		ips: make(map[string]*rate.Limiter),
		mu:  &sync.RWMutex{},
		r:   r,
		b:   b,
	}

	// Rutina de limpieza: Borra IPs viejas cada minuto para no llenar la RAM
	go func() {
		for {
			time.Sleep(time.Minute)
			i.mu.Lock()
			for ip, limiter := range i.ips {
				// Si no tiene tokens (está bloqueado) lo dejamos, si está libre lo borramos
				if limiter.Burst() == i.b {
					// Estrategia simple: limpiar el mapa periódicamente
					delete(i.ips, ip)
				}
			}
			i.mu.Unlock()
		}
	}()

	return i
}

// Obtener o crear un limitador para una IP
func (i *IPRateLimiter) GetLimiter(ip string) *rate.Limiter {
	i.mu.Lock()
	defer i.mu.Unlock()

	limiter, exists := i.ips[ip]
	if !exists {
		limiter = rate.NewLimiter(i.r, i.b)
		i.ips[ip] = limiter
	}

	return limiter
}

// INSTANCIA GLOBAL (Permite 1 intento cada 3 segundos, con ráfaga de 3 intentos seguidos)
// Esto es estricto: ideal para logins.
var LoginLimiter = NewIPRateLimiter(rate.Every(3*time.Second), 3)

func RateLimitMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		limiter := LoginLimiter.GetLimiter(ip)

		if !limiter.Allow() {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error": "Demasiados intentos de inicio de sesión. Por favor espera unos momentos.",
			})
			return
		}

		c.Next()
	}
}
