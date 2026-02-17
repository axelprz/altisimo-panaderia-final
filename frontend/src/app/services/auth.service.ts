import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, of } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Cuando tengamos el backend en Go, usaremos esta URL real
  private apiUrl = 'http://localhost:8080/api/login'; 
  private tokenKey = 'auth_token';
  
  // BehaviorSubject nos permite saber si estamos logueados en cualquier parte de la app
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: { email: string; password: string }): Observable<any> {
    // LLAMADA REAL AL BACKEND GO
    return this.http.post<{ token: string, user: string }>(this.apiUrl, credentials).pipe(
      tap(response => {
        // Guardamos el token real que nos dio Go
        localStorage.setItem(this.tokenKey, response.token);
        this.isLoggedInSubject.next(true);
      })
    );
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