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
  passwordForm!: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  userEmail = 'admin@altisimo.com'; // Puedes obtenerlo de tu AuthService si guardaste el email

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Inicializamos el formulario con validación cruzada para confirmar contraseña
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
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