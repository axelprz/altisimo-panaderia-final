import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-detail.component.html'
})
export class ProductDetailComponent implements OnInit {
  productId: number | null = null;
  product: Product | undefined;
  
  cantidad: number = 1;
  variedadSeleccionada: string = ''; 
  
  isLoading: boolean = true;
  isAdding: boolean = false;
  mostrarNotificacion: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService 
  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.productId = Number(idParam);
      this.loadProduct();
    }
  }

  loadProduct() {
    this.isLoading = true;
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.product = products.find(p => p.ID === this.productId);
        
        if (this.product && this.product.variedades && this.product.variedades.length > 0) {
          this.variedadSeleccionada = this.product.variedades[0];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar producto:', err);
        this.isLoading = false;
      }
    });
  }

  // --- FORMATEADOR DE IMÁGENES PÚBLICO ---
  formatImageUrl(imgPath: string | undefined): string {
    if (!imgPath) {
      return '/assets/images/placeholder.jpg'; 
    }

    if (imgPath.startsWith('data:image')) {
      return imgPath; 
    }

    if (imgPath.startsWith('http')) {
      return imgPath;
    }

    if (imgPath.startsWith('/assets/') || imgPath.startsWith('assets/')) {
      return imgPath.startsWith('/') ? imgPath : '/' + imgPath;
    }

    return '/' + imgPath;
  }

  agregarAlCarrito() {
    if (!this.product) return;

    this.isAdding = true;

    const cartItem = {
      product_id: this.product.ID,
      quantity: this.cantidad,
      variedad: this.variedadSeleccionada || ''
    };

    this.cartService.addToCart(cartItem).subscribe({
      next: () => {
        this.isAdding = false;
        
        this.mostrarNotificacion = true;
        setTimeout(() => {
          this.mostrarNotificacion = false;
        }, 3000);
      },
      error: (err) => {
        console.error('Error al agregar al carrito:', err);
        this.isAdding = false;
        alert('Por favor, inicia sesión para agregar productos al carrito.');
      }
    });
  }
}