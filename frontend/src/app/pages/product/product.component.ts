import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Importamos para usar routerLink

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, RouterModule], // Añadido RouterModule
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent {
  products = [
    { id: 'pan', name: 'Pan', images: 'assets/images/pan.jpg' },
    { id: 'prepizzas', name: 'Prepizzas y Pizzetas', images: 'assets/images/prepizzas.jpg' },
    { id: 'torta-raspadita', name: 'Torta Raspadita', images: 'assets/images/raspadita.jpg' },
    { id: 'con-chicharron', name: 'Torta con Chicharrón', images: 'assets/images/chicharron.jpg' },
    { id: 'cara-sucia', name: 'Cara Sucia', images: 'assets/images/carasucia.jpg' },
    { id: 'torta-hoja', name: 'Torta de Hoja', images: 'assets/images/hoja.jpg' },
    { id: 'medialunas', name: 'Medialunas', images: 'assets/images/medialuna.jpg' },
    { id: 'churros', name: 'Churros', images: 'assets/images/churros.jpg' },
    { id: 'facturas', name: 'Facturas', images: 'assets/images/facturas.jpg' }
  ];
}