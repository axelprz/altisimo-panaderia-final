package services

import (
	"bytes"
	"fmt"
	"net/smtp"
	"os"
)

// SendEmail es la función principal que envía correos usando SMTP
func SendEmail(toEmail string, subject string, body string) error {
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")
	smtpUser := os.Getenv("SMTP_USER")
	smtpPass := os.Getenv("SMTP_PASS")

	// Si no hay credenciales configuradas, solo imprimimos en consola (útil para desarrollo)
	if smtpUser == "" || smtpPass == "" {
		fmt.Printf("\n[SIMULACIÓN DE EMAIL]\nPara: %s\nAsunto: %s\nCuerpo:\n%s\n\n", toEmail, subject, body)
		return nil
	}

	auth := smtp.PlainAuth("", smtpUser, smtpPass, smtpHost)

	// Construimos el mensaje con sus cabeceras
	var msg bytes.Buffer
	msg.WriteString(fmt.Sprintf("From: Panadería Altísimo <%s>\r\n", smtpUser))
	msg.WriteString(fmt.Sprintf("To: %s\r\n", toEmail))
	msg.WriteString(fmt.Sprintf("Subject: %s\r\n", subject))
	msg.WriteString("MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n\n")
	msg.WriteString(body)

	address := fmt.Sprintf("%s:%s", smtpHost, smtpPort)

	err := smtp.SendMail(address, auth, smtpUser, []string{toEmail}, msg.Bytes())
	if err != nil {
		fmt.Println("Error enviando correo:", err)
		return err
	}

	return nil
}

// Plantillas de Correo Predefinidas

func SendOrderAcceptedEmail(toEmail string, orderID uint, deliveryDate string) {
	subject := fmt.Sprintf("¡Tu pedido #%d ha sido confirmado! 🥖", orderID)

	// Usamos HTML básico para que el correo se vea bonito
	body := fmt.Sprintf(`
		<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
			<h2 style="color: #4A3728;">¡Hola! Tu pan está en el horno.</h2>
			<p style="color: #555; font-size: 16px;">Nos alegra informarte que tu pedido <strong>#%d</strong> ha sido aceptado por nuestros maestros panaderos.</p>
			
			<div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0;">
				<p style="margin: 0; color: #166534; font-weight: bold;">Fecha de entrega programada:</p>
				<p style="margin: 5px 0 0 0; font-size: 18px; color: #14532d;">%s</p>
			</div>
			
			<p style="color: #777;">Puedes revisar los detalles de tu compra ingresando a tu Perfil en nuestra plataforma.</p>
			<br>
			<p style="color: #4A3728; font-weight: bold;">Gracias por elegir Panadería Altísimo.</p>
		</div>
	`, orderID, deliveryDate)

	// Ejecutamos el envío en una Goroutine (hilo en segundo plano) para no bloquear la respuesta HTTP
	go SendEmail(toEmail, subject, body)
}

func SendOrderRejectedEmail(toEmail string, orderID uint, reason string, isCancelled bool) {
	action := "Rechazado"
	if isCancelled {
		action = "Cancelado"
	}

	subject := fmt.Sprintf("Actualización sobre tu pedido #%d", orderID)

	body := fmt.Sprintf(`
		<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
			<h2 style="color: #b91c1c;">Actualización de tu pedido</h2>
			<p style="color: #555; font-size: 16px;">Lamentamos informarte que tu pedido <strong>#%d</strong> ha sido %s.</p>
			
			<div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
				<p style="margin: 0; color: #991b1b; font-weight: bold;">Nota del Panadero:</p>
				<p style="margin: 5px 0 0 0; font-style: italic; color: #7f1d1d;">"%s"</p>
			</div>
			
			<p style="color: #777;">Si tienes alguna duda, no dudes en contactarnos directamente al local.</p>
			<br>
			<p style="color: #4A3728; font-weight: bold;">El equipo de Panadería Altísimo.</p>
		</div>
	`, orderID, action, reason)

	go SendEmail(toEmail, subject, body)
}
