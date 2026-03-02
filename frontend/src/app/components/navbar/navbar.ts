import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service'; // <-- 1. Importar el servicio del carrito

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html'
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private cartService = inject(CartService); // <-- 2. Inyectarlo

  isLoggedIn$ = this.authService.isLoggedIn$;
  cartCount$ = this.cartService.cartCount$; // <-- 3. Conectar el contador
  isMobileMenuOpen = false;

  toggleMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  logout() {
    this.authService.logout();
  }
}