import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms'; 
import { EmployeeService } from '../../services/employee'; // Asegúrate de que la ruta sea correcta
import { Employee } from '../../models/employee.model';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './employees.html'
})
export class EmployeesComponent implements OnInit {
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  isLoading = true; 
  
  // Variables para Búsqueda y Filtros
  searchTerm: string = '';
  filterRole: string = '';
  filterStatus: string = '';
  
  // Variables del Modal de Formulario
  showModal = false;      
  animateModal = false;   
  isEditing = false;
  employeeForm: FormGroup;
  currentEmployeeId: number | null = null;
  
  // --- NUEVAS VARIABLES PARA TOAST Y MODAL ELIMINAR ---
  toastMessage = '';
  showToast = false;
  toastType: 'success' | 'error' = 'success';

  showDeleteModal = false;
  employeeToDelete: number | null = null;

  constructor(
    private employeeService: EmployeeService, 
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.employeeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      dni: ['', [Validators.required, Validators.pattern('^[0-9]{7,8}$')]],
      role: ['Atención al Cliente', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10,14}$')]],
      is_active: [true]
    });
  }

  get f() { return this.employeeForm.controls; }

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.isLoading = true;
    this.employeeService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data || [];
        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error del servidor:', err);
        this.employees = [];
        this.filteredEmployees = [];
        this.isLoading = false;
        this.displayToast('Error al cargar empleados', 'error');
        this.cdr.detectChanges(); 
      }
    });
  }

  // --- LÓGICA DE FILTROS EN TIEMPO REAL ---
  applyFilters(): void {
    this.filteredEmployees = this.employees.filter(emp => {
      const term = this.searchTerm.toLowerCase();
      const matchesSearch = !term || 
        emp.name.toLowerCase().includes(term) ||
        emp.last_name.toLowerCase().includes(term) ||
        emp.dni.includes(term);

      const matchesRole = !this.filterRole || emp.role === this.filterRole;

      let matchesStatus = true;
      if (this.filterStatus === 'active') matchesStatus = emp.is_active === true;
      if (this.filterStatus === 'inactive') matchesStatus = emp.is_active === false;

      return matchesSearch && matchesRole && matchesStatus;
    });
    
    this.cdr.detectChanges();
  }

  // --- LÓGICA DEL MODAL DE FORMULARIO ---
  openModal(employee?: Employee): void {
    if (employee) {
      this.isEditing = true;
      this.currentEmployeeId = employee.ID!;
      this.employeeForm.patchValue(employee);
    } else {
      this.isEditing = false;
      this.currentEmployeeId = null;
      this.employeeForm.reset(); 
      this.employeeForm.patchValue({ role: 'Atención al Cliente', is_active: true });
    }
    
    this.showModal = true;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.animateModal = true;
      this.cdr.detectChanges();
    }, 50);
  }

  closeModal(): void {
    this.animateModal = false;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.showModal = false;
      this.cdr.detectChanges();
    }, 300);
  }

  saveEmployee(): void {
    if (this.employeeForm.invalid) return;

    const employeeData: Employee = this.employeeForm.value;

    if (this.isEditing && this.currentEmployeeId) {
      this.employeeService.updateEmployee(this.currentEmployeeId, employeeData).subscribe({
        next: () => {
          this.loadEmployees();
          this.closeModal();
          this.displayToast('Empleado actualizado exitosamente', 'success');
        },
        error: () => this.displayToast('Error al actualizar empleado', 'error')
      });
    } else {
      this.employeeService.createEmployee(employeeData).subscribe({
        next: () => {
          this.loadEmployees();
          this.closeModal();
          this.displayToast('Empleado registrado exitosamente', 'success');
        },
        error: () => this.displayToast('Error al registrar empleado', 'error')
      });
    }
  }

  // --- LÓGICA DEL MODAL DE ELIMINAR ---
  confirmDeleteEmployee(id: number | undefined): void {
    if (!id) return;
    this.employeeToDelete = id;
    this.showDeleteModal = true;
  }

  cancelDelete() {
    this.showDeleteModal = false;
    this.employeeToDelete = null;
  }

  processDelete() {
    if (!this.employeeToDelete) return;

    this.employeeService.deleteEmployee(this.employeeToDelete).subscribe({
      next: () => {
        this.employees = this.employees.filter(emp => emp.ID !== this.employeeToDelete);
        this.applyFilters(); 
        this.cancelDelete();
        this.displayToast('Empleado dado de baja', 'success');
      },
      error: () => {
        this.cancelDelete();
        this.displayToast('Error al eliminar empleado', 'error');
      }
    });
  }

  // --- CONTROLADOR DEL TOAST UNIFICADO ---
  displayToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    this.cdr.detectChanges();
    
    setTimeout(() => {
      this.showToast = false;
      this.cdr.detectChanges();
    }, 4000); 
  }
}