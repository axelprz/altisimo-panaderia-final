import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html'
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  isLoading = true;
  total = 0;
  isCheckingOut = false;
  orderSuccess = false;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart() {
    this.isLoading = true;
    this.cartService.getCart().subscribe({
      next: (items) => {
        this.cartItems = items;
        this.calculateTotal();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando carrito:', err);
        this.isLoading = false;
      }
    });
  }

  removeItem(id: number) {
    this.cartService.removeFromCart(id).subscribe({
      next: () => {
        // Filtramos el array localmente para no tener que recargar toda la página
        this.cartItems = this.cartItems.filter(item => item.ID !== id);
        this.calculateTotal();
      },
      error: (err) => console.error('Error borrando item:', err)
    });
  }

  calculateTotal() {
    this.total = this.cartItems.reduce((acc, item) => {
      // Red de seguridad: si el producto no viene (ej: fue borrado de la BD), lo ignoramos
      if (!item.product) return acc;
      
      return acc + (item.product.price * item.quantity);
    }, 0);
  }

  increaseQuantity(item: CartItem) {
    item.quantity++;
    this.updateItemQuantity(item);
  }

  decreaseQuantity(item: CartItem) {
    if (item.quantity > 1) {
      item.quantity--;
      this.updateItemQuantity(item);
    }
  }

  updateItemQuantity(item: CartItem) {
    this.calculateTotal(); // Actualizamos visualmente el total de inmediato
    this.cartService.updateQuantity(item.ID, item.quantity).subscribe({
      error: (err) => {
        console.error('Error al actualizar cantidad', err);
        this.loadCart(); // Si falla el servidor, recargamos los datos reales
      }
    });
  }

  procederAlPago() {
    this.isCheckingOut = true;
    this.cartService.checkout().subscribe({
      next: (response) => {
        this.isCheckingOut = false;
        this.orderSuccess = true; // Mostramos pantalla de éxito
        this.cartItems = [];      // Vaciamos vista local
        this.total = 0;
      },
      error: (err) => {
        console.error('Error al enviar pedido:', err);
        this.isCheckingOut = false;
        alert('Hubo un error al procesar tu pedido. Inténtalo de nuevo.');
      }
    });
  }
}