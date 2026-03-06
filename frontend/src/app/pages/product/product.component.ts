import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService, Product } from '../../services/product.service';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product.component.html'
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
        this.products = (data || []).filter(p => p.is_active !== false);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar catálogo:', err);
        this.isLoading = false;
      }
    });
  }

  // --- FORMATEADOR DE IMÁGENES PÚBLICO ---
  formatImageUrl(imgPath: string | undefined): string {
    if (!imgPath) {
      return '/assets/images/placeholder.jpg'; 
    }

    // 1. Si es Base64 (viene de la BD directamente de las fotos nuevas)
    if (imgPath.startsWith('data:image')) {
      return imgPath; 
    }

    // 2. Si es una URL externa
    if (imgPath.startsWith('http')) {
      return imgPath;
    }

    // 3. Si es una ruta relativa de tus Seeds
    if (imgPath.startsWith('/assets/') || imgPath.startsWith('assets/')) {
      return imgPath.startsWith('/') ? imgPath : '/' + imgPath;
    }

    return '/' + imgPath; // Por si acaso queda algún formato viejo
  }
}