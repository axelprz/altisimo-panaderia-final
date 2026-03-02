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
    { id: 'pan-hamburguesa', name: 'Pan de hamburguesa', images: 'assets/images/hamburguesa.jpg' },
    { id: 'pan-pancho', name: 'Pan de pancho', images: 'assets/images/pancho.jpg' },
    { id: 'torta-raspadita', name: 'Torta Raspadita', images: 'assets/images/raspadita.jpg' },
    { id: 'con-chicharron', name: 'Torta con Chicharrón', images: 'assets/images/chicharron.jpg' },
    { id: 'torta-hoja', name: 'Torta de Hoja', images: 'assets/images/hoja.jpg' },
    { id: 'medialunas', name: 'Medialunas', images: 'assets/images/medialuna.jpg' },
    { id: 'churros', name: 'Churros', images: 'assets/images/churros.jpg' },
    { id: 'facturas', name: 'Facturas', images: 'assets/images/facturas.jpg' },
    { id: 'alfajores', name: 'Alfajores', images: 'assets/images/alfajores.jpg' },
    { id: 'sanguches', name: 'Sanguches de Miga', images: 'assets/images/miga.jpg' },
    { id: 'tortas-cumpleaños', name: 'Tortas de cumpleaños', images: 'assets/images/tortas.jpg' }
  ];
}