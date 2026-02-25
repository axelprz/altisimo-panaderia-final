import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, of } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Ajustamos la URL para que sea la base de nuestra API
  private apiUrl = 'http://localhost:8080/api'; 
  private tokenKey = 'auth_token';
  
  // BehaviorSubject nos permite saber si estamos logueados en cualquier parte de la app
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: { email: string; password: string }): Observable<any> {
    // Le agregamos '/login' a la URL base
    return this.http.post<{ token: string, user: string }>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        // Guardamos el token real que nos dio Go
        localStorage.setItem(this.tokenKey, response.token);
        this.isLoggedInSubject.next(true);
      })
    );
  }

  // --- NUEVO MÉTODO: CAMBIAR CONTRASEÑA ---
  changePassword(data: { currentPassword: string, newPassword: string }): Observable<any> {
    // 1. Obtenemos el token guardado
    const token = localStorage.getItem(this.tokenKey);
    
    // 2. Armamos la cabecera (Header) de autorización
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    // 3. Enviamos la petición PUT a la ruta protegida
    return this.http.put(`${this.apiUrl}/user/password`, data, { headers });
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/login']);
  }

  // Método auxiliar para obtener el estado actual sin suscribirse
  public get isLoggedInValue(): boolean {
    return this.isLoggedInSubject.value;
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }
}