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
  // Ahora variedadSeleccionada es un objeto completo
  variedadSeleccionada: any = null; 
  product: any;
  mostrarNotificacion: boolean = false;

  productData: any = {
    'pan': {
      name: 'Pan',
      price: 1200,
      unidad: 'Kilo',
      desc: 'Pan fresco del día, elaborado con harinas de primera calidad.',
      img: 'assets/images/pan.jpg',
      variedades: [
        { nombre: 'Mignon', extra: 0 },
        { nombre: 'Felipe', extra: 0 },
        { nombre: 'Flautita', extra: 0 },
        { nombre: 'Masa Madre', extra: 800 }
      ]
    },
    'prepizzas': {
      name: 'Prepizzas y Pizzetas',
      price: 1800,
      unidad: 'Paquete',
      desc: 'Bases para pizza artesanales con media masa a la piedra.',
      img: 'assets/images/prepizzas.jpg',
      variedades: [
        { nombre: 'Prepizza Grande - Tomate (Pack x3)', extra: 0 },
        { nombre: 'Prepizza Mediana - Tomate (Pack x3)', extra: 0 },
        { nombre: 'Pizzetas (Paquete x 12 unidades)', extra: 0 }
      ]
    },
    'pan-hamburguesa': {
      name: 'Pan de Hamburguesa',
      price: 1200,
      unidad: 'Pack x4',
      desc: 'Pan brioche con sésamo, ideal para burgers gourmet.',
      img: 'assets/images/hamburguesa.jpg',
      variedades: [{ nombre: 'Clásico con Sésamo', extra: 0 }]
    },
    'pan-pancho': {
      name: 'Pan de Pancho',
      price: 1100,
      unidad: 'Pack x6',
      desc: 'Pan de Viena suave y esponjoso.',
      img: 'assets/images/pancho.jpg',
      variedades: [{ nombre: 'Estándar', extra: 0 }]
    },
    'torta-raspadita': {
      name: 'Torta Raspadita',
      price: 1800,
      unidad: 'Docena',
      desc: 'Clásica torta mendocina con grasa de pella.',
      img: 'assets/images/raspadita.jpg',
      variedades: [{ nombre: 'Tradicional', extra: 0 }]
    },
    'con-chicharron': {
      name: 'Torta con Chicharrón',
      price: 2100,
      unidad: 'Docena',
      desc: 'Sabor tradicional con chicharrones seleccionados.',
      img: 'assets/images/chicharron.jpg',
      variedades: [{ nombre: 'Tradicional', extra: 0 }]
    },
    'torta-hoja': {
      name: 'Torta de Hoja',
      price: 2000,
      unidad: 'Docena',
      desc: 'Especialidad hojaldrada artesanal.',
      img: 'assets/images/hoja.jpg',
      variedades: [{ nombre: 'Tradicional', extra: 0 }]
    },
    'churros': {
      name: 'Churros',
      price: 3200,
      unidad: 'Docena',
      desc: 'Churros crocantes ideales para reventa.',
      img: 'assets/images/churros.jpg',
      variedades: [
        { nombre: 'Simples', extra: 0 },
        { nombre: 'Rellenos con Dulce de Leche', extra: 600 },
        { nombre: 'Rellenos con Crema Pastelera', extra: 600 }
      ]
    },
    'facturas': {
      name: 'Facturas',
      price: 3800,
      unidad: 'Docena',
      desc: 'Variedad de facturas artesanales.',
      img: 'assets/images/facturas.jpg',
      variedades: [
        { nombre: 'Surtidas', extra: 0 },
        { nombre: 'Solo Dulce de Leche', extra: 0 },
        { nombre: 'Solo Pastelera', extra: 0 }
      ]
    },
    'medialunas': {
      name: 'Medialunas',
      price: 3800,
      unidad: 'Docena',
      desc: 'Medialunas de manteca o grasa con almíbar.',
      img: 'assets/images/medialuna.jpg',
      variedades: [
        { nombre: 'Grasa', extra: 0 },
        { nombre: 'Manteca', extra: 0 }
      ]
    },
    'alfajores': {
      name: 'Alfajores Artesanales',
      price: 4800,
      unidad: 'Docena',
      desc: 'Alfajores de maicena con abundante relleno.',
      img: 'assets/images/alfajores.jpg',
      variedades: [
        { nombre: 'Dulce de Leche', extra: 0 },
        { nombre: 'Miel de Caña', extra: 600 }
      ]
    },
    'sanguches': {
      name: 'Sándwiches de Miga',
      price: 5200,
      unidad: 'Docena',
      desc: 'Miga fresca de elaboración propia, 3 capas.',
      img: 'assets/images/miga.jpg',
      variedades: [
        { nombre: 'Simples (J&Q)', extra: 0 },
        { nombre: 'Especiales (Huevo/Tomate)', extra: 1300 },
        { nombre: 'Premium (Roquefort/Crudo)', extra: 2500 }
      ]
    },
    'tortas-cumpleaños': {
      name: 'Tortas de Cumpleaños',
      price: 8500,
      unidad: 'Kg',
      desc: 'Bizcochuelo artesanal con dos cortes de relleno.',
      img: 'assets/images/tortas.jpg',
      variedades: [
        { nombre: 'Clásica (Merengue)', extra: 0 },
        { nombre: 'Personalizada (Temática/Fondant)', extra: 3500 }
      ]
    },
  };

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
    if (this.productId && this.productData[this.productId]) {
      this.product = this.productData[this.productId];
      if (this.product.variedades && this.product.variedades.length > 0) {
        this.variedadSeleccionada = this.product.variedades[0];
      }
    }
  }

  get precioCalculado(): number {
    if (!this.product || !this.variedadSeleccionada) return 0;
    return this.product.price + this.variedadSeleccionada.extra;
  }

  agregarAlCarrito() {
    this.mostrarNotificacion = true;
    setTimeout(() => {
      this.mostrarNotificacion = false;
    }, 3000);
  }
}