import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // <-- Añade ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { AddressService, Address } from '../../services/address.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  passwordForm: FormGroup;
  addressForm: FormGroup; 

  isLoading = false;
  
  // Variables dinámicas
  userEmail = ''; 
  userRole = '';
  userInitial = '';

  // Variables de Direcciones
  addresses: Address[] = [];
  showAddressModal = false;
  isSavingAddress = false;

  // --- NUEVAS VARIABLES PARA TOAST Y MODAL DE ELIMINAR ---
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  showDeleteModal = false;
  addressToDelete: number | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private addressService: AddressService,
    private cdr: ChangeDetectorRef // <-- Para forzar la actualización visual del Toast
  ) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

    this.addressForm = this.fb.group({
      title: ['', Validators.required],
      street: ['', Validators.required],
      city: ['Mendoza', Validators.required], 
      phone: ['', [Validators.required, Validators.pattern('^[0-9]*$')]], 
      reference: ['']
    });
  }

  ngOnInit(): void {
    this.loadUserData();
    this.loadAddresses(); 
  }

  // --- CONTROLADOR DEL TOAST UNIFICADO ---
  showNotification(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    this.cdr.detectChanges();
    
    setTimeout(() => {
      this.showToast = false;
      this.cdr.detectChanges();
    }, 4000); // Se oculta a los 4 segundos
  }

  loadUserData() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = token.split('.')[1];
        const decodedInfo = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
        
        this.userEmail = decodedInfo.email || 'usuario@correo.com';
        this.userRole = decodedInfo.role || 'client'; 
        this.userInitial = this.userEmail.charAt(0).toUpperCase();
      } catch (e) {
        console.error('Error al decodificar el token', e);
      }
    }
  }

  // --- LÓGICA DE DIRECCIONES ---
  loadAddresses() {
    this.addressService.getAddresses().subscribe({
      next: (data) => this.addresses = data || [],
      error: (err) => console.error('Error cargando direcciones', err)
    });
  }

  openAddressModal() {
    this.addressForm.reset({ city: 'Mendoza' }); 
    this.showAddressModal = true;
  }

  closeAddressModal() {
    this.showAddressModal = false;
  }

  saveAddress() {
    if (this.addressForm.invalid) return;

    this.isSavingAddress = true;
    this.addressService.addAddress(this.addressForm.value).subscribe({
      next: (newAddr) => {
        this.addresses.push(newAddr); 
        this.isSavingAddress = false;
        this.closeAddressModal();
        this.showNotification('Dirección guardada correctamente.', 'success');
      },
      error: (err) => {
        console.error(err);
        this.isSavingAddress = false;
        this.showNotification('Error al guardar la dirección.', 'error');
      }
    });
  }

  // Lógica del Modal de Eliminación
  confirmDeleteAddress(id: number | undefined) {
    if (!id) return;
    this.addressToDelete = id;
    this.showDeleteModal = true;
  }

  cancelDelete() {
    this.showDeleteModal = false;
    this.addressToDelete = null;
  }

  processDelete() {
    if (!this.addressToDelete) return;
    
    this.addressService.deleteAddress(this.addressToDelete).subscribe({
      next: () => {
        this.addresses = this.addresses.filter(a => a.ID !== this.addressToDelete); 
        this.cancelDelete();
        this.showNotification('La dirección ha sido eliminada.', 'success');
      },
      error: (err) => {
        console.error(err);
        this.cancelDelete();
        this.showNotification('No se pudo eliminar la dirección.', 'error');
      }
    });
  }

  // --- LÓGICA DE SEGURIDAD ---
  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.passwordForm.invalid) return;
    this.isLoading = true;

    const { currentPassword, newPassword } = this.passwordForm.value;

    this.authService.changePassword({ currentPassword, newPassword }).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.passwordForm.reset();
        this.showNotification(res.message || 'Contraseña actualizada con éxito.', 'success');
      },
      error: (err) => {
        this.isLoading = false;
        this.showNotification(err.error?.error || 'Contraseña actual incorrecta.', 'error');
      }
    });
  }
}