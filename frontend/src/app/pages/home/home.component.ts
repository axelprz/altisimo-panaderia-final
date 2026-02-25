import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; // 1. Importamos el módulo de rutas

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule], // 2. Lo agregamos aquí para que funcionen los routerLink
  templateUrl: './home.component.html'
})
export class HomeComponent {
  // Aquí no hace falta escribir funciones de redirección
  // porque el "routerLink" en el HTML se encarga de todo.
}