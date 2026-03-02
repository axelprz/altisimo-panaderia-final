import { Component, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './layout.html',
})
export class Layout {
  isSidebarOpen = false;
  
  // Inyectamos el Router de Angular
  private router = inject(Router);

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  // Función para cerrar sesión
  logout(): void {
    // 1. Eliminamos el token de seguridad del navegador
    localStorage.removeItem('token');
    
    // 2. Cerramos el menú lateral (por si estaba abierto en móvil)
    this.isSidebarOpen = false;
    
    // 3. Redirigimos a la pantalla de login
    this.router.navigate(['/login']);
  }
}