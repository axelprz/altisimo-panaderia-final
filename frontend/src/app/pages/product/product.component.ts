import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService, Product } from '../../services/product.service'; // Ajusta la ruta si es necesario

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product.component.html'
  // Eliminamos styleUrls porque ahora usaremos puramente Tailwind
})
export class ProductComponent implements OnInit {
  products: Product[] = [];
  isLoading = true;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading = true;
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar catálogo:', err);
        this.isLoading = false;
      }
    });
  }

  // Función de seguridad para las rutas de las imágenes
  formatImageUrl(imgPath: string): string {
    if (!imgPath) return '/assets/images/placeholder.jpg';
    const cleanPath = imgPath.trim();
    if (cleanPath.startsWith('http') || cleanPath.startsWith('/')) {
      return cleanPath;
    }
    return '/' + cleanPath;
  }
}