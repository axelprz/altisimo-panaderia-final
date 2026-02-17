package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

type Response struct {
	Mensaje string `json:"mensaje"`
	Estado  string `json:"estado"`
}

func main() {
	port := ":8080"

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)

		data := Response{
			Mensaje: "¡Hola! El Backend en Go está funcionando correctamente",
			Estado:  "OK",
		}

		json.NewEncoder(w).Encode(data)
	})

	fmt.Printf("Servidor escuchando en el puerto %s...\n", port)

	if err := http.ListenAndServe(port, nil); err != nil {
		log.Fatal(err)
	}
}
