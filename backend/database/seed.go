package database

import (
	"log"

	"github.com/axelprz/altisimo-panaderia-final/models"
)

func SeedProducts() {
	log.Println("🧹 Limpiando el catálogo anterior...")
	// Borramos los productos viejos
	DB.Where("1 = 1").Delete(&models.Product{})

	// Lista de productos actualizada
	products := []models.Product{
		{
			Name:       "Pan",
			Price:      1200,
			Unidad:     "Kilo",
			Desc:       "Pan fresco del día, elaborado con harinas de primera calidad.",
			Image:      "assets/images/pan.jpg",
			Variedades: []string{"Mignon", "Felipe", "Flautita"},
		},
		{
			Name:       "Prepizzas y Pizzetas",
			Price:      1800,
			Unidad:     "Paquete",
			Desc:       "Bases para pizza artesanales con media masa a la piedra. Ideales para eventos.",
			Image:      "assets/images/prepizzas.jpg",
			Variedades: []string{"Prepizza Grande (Pack x3)", "Prepizza Mediana (Pack x3)", "Pizzetas (Pack x12)"},
		},
		{
			Name:   "Pan de hamburguesa",
			Price:  2500,
			Unidad: "Docena",
			Desc:   "Pan suave y esponjoso, ideal para hamburguesas caseras.",
			Image:  "assets/images/hamburguesa.jpg",
		},
		{
			Name:   "Pan de pancho",
			Price:  2200,
			Unidad: "Docena",
			Desc:   "Pan tierno y alargado, perfecto para panchos.",
			Image:  "assets/images/pancho.jpg",
		},
		{
			Name:   "Torta Raspadita",
			Price:  1800,
			Unidad: "Docena",
			Desc:   "Clásica torta mendocina con grasa de pella.",
			Image:  "assets/images/raspadita.jpg",
		},
		{
			Name:   "Torta con Chicharrón",
			Price:  1800,
			Unidad: "Docena",
			Desc:   "Sabor tradicional con chicharrones seleccionados.",
			Image:  "assets/images/chicharron.jpg",
		},
		{
			Name:   "Torta de Hoja",
			Price:  1800,
			Unidad: "Docena",
			Desc:   "Nuestra especialidad hojaldrada: capas finas y crocantes logradas con amasado artesanal.",
			Image:  "assets/images/hoja.jpg",
		},
		{
			Name:       "Medialunas",
			Price:      3500,
			Unidad:     "Docena",
			Desc:       "Medialunas de manteca o grasa con almíbar.",
			Image:      "assets/images/medialuna.jpg",
			Variedades: []string{"Grasa", "Manteca"},
		},
		{
			Name:       "Churros",
			Price:      3200,
			Unidad:     "Docena",
			Desc:       "Churros crocantes ideales para reventa o acompañar el mate.",
			Image:      "assets/images/churros.jpg",
			Variedades: []string{"Simples", "Rellenos con Dulce de Leche", "Rellenos con Crema Pastelera"},
		},
		{
			Name:       "Facturas",
			Price:      3500,
			Unidad:     "Docena",
			Desc:       "Variedad de facturas artesanales para su comercio.",
			Image:      "assets/images/facturas.jpg",
			Variedades: []string{"Membrillo", "Dulce de Leche", "Crema Pastelera", "Mixtas"},
		},
		{
			Name:       "Alfajores",
			Price:      4500,
			Unidad:     "Docena",
			Desc:       "Alfajores artesanales que se deshacen en la boca.",
			Image:      "assets/images/alfajores.jpg",
			Variedades: []string{"Maicena", "Chocolate", "Nieve"},
		},
		{
			Name:       "Sanguches de Miga",
			Price:      8000,
			Unidad:     "Docena",
			Desc:       "Sándwiches triples de miga, súper húmedos y con abundante relleno.",
			Image:      "assets/images/miga.jpg",
			Variedades: []string{"Jamón y Queso", "Especiales Variados"},
		},
		{
			Name:   "Tortas de cumpleaños",
			Price:  15000,
			Unidad: "Unidad",
			Desc:   "Tortas decoradas y personalizadas para celebrar a lo grande.",
			Image:  "assets/images/tortas.jpg",
		},
	}

	for _, p := range products {
		DB.Create(&p)
	}

	log.Printf("🥐 ¡Catálogo actualizado! Se cargaron %d productos en la base de datos.\n", len(products))
}
