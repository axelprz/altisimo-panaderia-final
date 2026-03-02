import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Product } from './product.service';

export interface CartItemInput {
  product_id: number;
  quantity: number;
  variedad: string;
}

export interface CartItem {
  ID: number;
  product_id: number;
  quantity: number;
  variedad: string;
  product: Product;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:8080/api/cart';
  
  private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadInitialCart();
  }

  // ¡CORREGIDO! Ahora usa siempre 'token'
  private getHeaders() {
    const token = localStorage.getItem('auth_token'); 
    return token ? new HttpHeaders().set('Authorization', `Bearer ${token}`) : new HttpHeaders();
  }

  private updateCartCount(items: CartItem[]) {
    if (!items || !Array.isArray(items)) {
      this.cartCountSubject.next(0);
      return;
    }
    const totalItems = items.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
    this.cartCountSubject.next(totalItems);
  }

  loadInitialCart() {
    const token = localStorage.getItem('auth_token'); // <- CORREGIDO AQUÍ TAMBIÉN
    if (token) {
      this.http.get<CartItem[]>(this.apiUrl, { headers: this.getHeaders() }).subscribe({
        next: (items) => this.updateCartCount(items),
        error: (err) => {
          console.error('Error cargando carrito inicial', err);
          this.cartCountSubject.next(0);
        }
      });
    } else {
      this.cartCountSubject.next(0);
    }
  }

  getCart(): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      tap(items => this.updateCartCount(items))
    );
  }

  addToCart(item: CartItemInput): Observable<any> {
    return this.http.post(this.apiUrl, item, { headers: this.getHeaders() }).pipe(
      tap(() => this.loadInitialCart())
    );
  }

  removeFromCart(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      tap(() => this.loadInitialCart())
    );
  }

  updateQuantity(id: number, quantity: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, { quantity: Number(quantity) }, { headers: this.getHeaders() }).pipe(
      tap(() => this.loadInitialCart())
    );
  }

  // NUEVA FUNCIÓN DE CHECKOUT
  checkout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/checkout`, {}, { headers: this.getHeaders() }).pipe(
      tap(() => this.loadInitialCart()) // Reinicia el contador a 0 automáticamente
    );
  }
}