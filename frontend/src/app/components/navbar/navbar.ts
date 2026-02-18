import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // <--- 1. IMPORTAR ESTO

@Component({
  selector: 'app-navbar',
  standalone: true,
  // 2. AGREGARLO AQUÍ (Esto hace que routerLink y routerLinkActiveOptions funcionen)
  imports: [CommonModule, RouterModule], 
  templateUrl: './navbar.html',
  styleUrl: './navbar.css' // O .scss si usas sass
})
export class NavbarComponent {
  isMobileMenuOpen = false;

  toggleMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
}