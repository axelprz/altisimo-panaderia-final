import { Component, ChangeDetectorRef } from '@angular/core'; // <-- 1. Importamos ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html'
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder, 
    private http: HttpClient, 
    private router: Router,
    private cdr: ChangeDetectorRef // <-- 2. Lo inyectamos aquí
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges(); // Forzamos actualización visual al empezar a cargar

    this.http.post<any>('http://localhost:8080/api/admin/login', this.loginForm.value).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        // 3. Detenemos la carga y capturamos el error
        this.isLoading = false;
        
        // Si el backend envía un mensaje, lo mostramos. Si no, mostramos un mensaje genérico.
        this.errorMessage = err.error?.error || 'Credenciales incorrectas o error de conexión.';
        
        // 4. MAGIA: Forzamos a Angular a redibujar el HTML, quitando el spinner y mostrando el cartel rojo
        this.cdr.detectChanges(); 
      }
    });
  }
}