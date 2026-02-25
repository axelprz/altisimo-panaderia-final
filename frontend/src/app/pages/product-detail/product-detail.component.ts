import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  productId: string | null = '';
  cantidad: number = 1;
  variedadSeleccionada: string = '';
  product: any;
  mostrarNotificacion: boolean = false; // Para el cartel flotante

  productData: any = {
    'pan': {
      name: 'Pan',
      price: 1200,
      unidad: 'Kilo',
      desc: 'Pan fresco del día, elaborado con harinas de primera calidad.',
      img: 'assets/images/pan.jpg',
      variedades: ['Mignon', 'Felipe', 'Flautita']
    },
    'prepizzas': {
      name: 'Prepizzas y Pizzetas',
      price: 1800,
      unidad: 'Paquete',
      desc: 'Bases para pizza artesanales con media masa a la piedra. Nuestras prepizzas son aireadas y con una base crocante que no se dobla. Las pizzetas vienen precocidas, ideales para eventos o reventa por paquete.',
      img: 'assets/images/prepizzas.jpg',
      variedades: [
        'Prepizza Grande - Tomate (Pack x3)',
        'Prepizza Mediana - Tomate (Pack x3)',
        'Pizzetas (Paquete x 12 unidades)'
      ]
    },
    'torta-raspadita': {
      name: 'Torta Raspadita',
      price: 1800,
      unidad: 'Docena',
      desc: 'Clásica torta mendocina con grasa de pella.',
      img: 'assets/images/raspadita.jpg'
    },
    'con-chicharron': {
      name: 'Torta con Chicharrón',
      price: 1800,
      unidad: 'Docena',
      desc: 'Sabor tradicional con chicharrones seleccionados.',
      img: 'assets/images/chicharron.jpg'
    },
    'torta-de-hoja': {
      name: 'Torta de Hoja',
      price: 1800,
      unidad: 'Docena',
      desc: 'Nuestra especialidad hojaldrada: capas finas y crocantes logradas con un amasado artesanal y el punto justo de cocción.',
      img: 'assets/images/hoja.jpg'
    },
    'cara-sucia': {
      name: 'Cara Sucia',
      price: 1800,
      unidad: 'Docena',
      desc: 'Tortitas con azúcar negra, un clásico infaltable.',
      img: 'assets/images/carasucia.jpg'
    },
    'churros': {
      name: 'Churros',
      price: 3200,
      unidad: 'Docena',
      desc: 'Churros crocantes ideales para reventa.',
      img: 'assets/images/churros.jpg',
      variedades: ['Simples', 'Rellenos con Dulce de Leche', 'Rellenos con Crema Pastelera']
    },
    'facturas': {
      name: 'Facturas',
      price: 3500,
      unidad: 'Docena',
      desc: 'Variedad de facturas artesanales para su comercio.',
      img: 'assets/images/facturas.jpg',
      variedades: ['Membrillo', 'Dulce de Leche', 'Crema Pastelera', 'Mixtas']
    },
    'medialunas': {
      name: 'Medialunas',
      price: 3500,
      unidad: 'Docena',
      desc: 'Medialunas de manteca o grasa con almíbar.',
      img: 'assets/images/medialuna.jpg',
      variedades: ['Grasa', 'Manteca']
    }
  };

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
    if (this.productId && this.productData[this.productId]) {
      this.product = this.productData[this.productId];
      if (this.product.variedades) {
        this.variedadSeleccionada = this.product.variedades[0];
      }
    }
  }

  agregarAlCarrito() {
    this.mostrarNotificacion = true;
    // Ocultar después de 3 segundos
    setTimeout(() => {
      this.mostrarNotificacion = false;
    }, 3000);
  }
}