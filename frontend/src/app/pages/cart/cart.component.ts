import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // <-- IMPORTANTE: Necesario para el ngModel del selector
import { CartService, CartItem } from '../../services/cart.service';
import { AddressService, Address } from '../../services/address.service'; // <-- Importamos el servicio de direcciones

@Component({
  selector: 'app-cart',
  standalone: true,
  // Agregamos FormsModule a los imports
  imports: [CommonModule, RouterModule, FormsModule], 
  templateUrl: './cart.component.html'
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  isLoading = true;
  total = 0;
  isCheckingOut = false;
  orderSuccess = false;

  // --- NUEVAS VARIABLES PARA ENVÍO ---
  addresses: Address[] = [];
  selectedAddressId: number | null = null;

  constructor(
    private cartService: CartService,
    private addressService: AddressService // <-- Inyectamos el servicio
  ) {}

  ngOnInit(): void {
    this.loadCart();
    this.loadAddresses(); // Cargamos las direcciones apenas entra al carrito
  }

  // --- CARGAR DIRECCIONES ---
  loadAddresses() {
    this.addressService.getAddresses().subscribe({
      next: (data) => {
        this.addresses = data || [];
        // Si el usuario tiene direcciones, autoseleccionamos la principal (o la primera)
        if (this.addresses.length > 0) {
          const defaultAddr = this.addresses.find(a => a.is_default);
          this.selectedAddressId = defaultAddr ? defaultAddr.ID! : this.addresses[0].ID!;
        }
      },
      error: (err) => console.error('Error cargando direcciones', err)
    });
  }

  // --- LÓGICA DEL CARRITO ---
  loadCart() {
    this.isLoading = true;
    this.cartService.getCart().subscribe({
      next: (items) => {
        this.cartItems = items || [];
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

  // --- PROCESO DE PAGO (NUEVO FLUJO) ---
  procederAlPago() {
    // 1. Validación de seguridad: no dejar avanzar sin dirección
    if (!this.selectedAddressId) {
      alert("Por favor, selecciona una dirección de entrega antes de continuar.");
      return;
    }

    this.isCheckingOut = true;
    
    // 2. Enviamos el ID de la dirección al servicio
    this.cartService.checkout(this.selectedAddressId).subscribe({
      next: (response) => {
        this.isCheckingOut = false;
        this.orderSuccess = true; // Mostramos pantalla de éxito
        this.cartItems = [];      // Vaciamos vista local
        this.total = 0;
      },
      error: (err) => {
        console.error('Error al enviar pedido:', err);
        this.isCheckingOut = false;
        // Mostramos el mensaje de error del backend si existe
        alert(err.error?.error || 'Hubo un error al procesar tu pedido. Inténtalo de nuevo.');
      }
    });
  }
}