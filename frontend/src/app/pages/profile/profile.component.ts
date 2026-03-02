import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  passwordForm: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  
  // Variables dinámicas para la interfaz
  userEmail = ''; 
  userRole = '';
  userInitial = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    // Inicializamos el formulario en el constructor
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Extraemos la parte central del JWT (el Payload)
        const payload = token.split('.')[1];
        // Decodificamos Base64Url a texto normal
        const decodedInfo = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        
        // Asignamos los datos a nuestras variables
        this.userEmail = decodedInfo.email || 'usuario@correo.com';
        this.userRole = decodedInfo.role || 'client'; // Si no tiene rol, asumimos cliente
        
        // Sacamos la primera letra del correo para el ícono circular
        this.userInitial = this.userEmail.charAt(0).toUpperCase();
      } catch (e) {
        console.error('Error al decodificar el token para el perfil', e);
      }
    }
  }

  // Validador personalizado para asegurar que las contraseñas coinciden
  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.passwordForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { currentPassword, newPassword } = this.passwordForm.value;

    this.authService.changePassword({ currentPassword, newPassword }).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = res.message || 'Contraseña cambiada con éxito.';
        this.passwordForm.reset();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.error || 'Ocurrió un error al cambiar la contraseña.';
      }
    });
  }
}