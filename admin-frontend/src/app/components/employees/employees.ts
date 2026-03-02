import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms'; // <-- 1. Importamos FormsModule
import { EmployeeService } from '../../services/employee';
import { Employee } from '../../models/employee.model';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule], // <-- 2. Lo agregamos aquí
  templateUrl: './employees.html'
})
export class EmployeesComponent implements OnInit {
  employees: Employee[] = [];
  filteredEmployees: Employee[] = []; // <-- Arreglo que mostraremos en la tabla
  isLoading = true; 
  
  // Variables para Búsqueda y Filtros
  searchTerm: string = '';
  filterRole: string = '';
  filterStatus: string = '';
  
  showModal = false;      
  animateModal = false;   
  isEditing = false;
  
  employeeForm: FormGroup;
  currentEmployeeId: number | null = null;
  toastMessage = '';
  showToast = false;

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
        this.applyFilters(); // <-- Aplicamos filtros al cargar
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error del servidor:', err);
        this.employees = [];
        this.filteredEmployees = [];
        this.isLoading = false;
        this.cdr.detectChanges(); 
      }
    });
  }

  // --- LÓGICA DE FILTROS EN TIEMPO REAL ---
  applyFilters(): void {
    this.filteredEmployees = this.employees.filter(emp => {
      // 1. Filtro por Búsqueda (Nombre, Apellido o DNI)
      const term = this.searchTerm.toLowerCase();
      const matchesSearch = !term || 
        emp.name.toLowerCase().includes(term) ||
        emp.last_name.toLowerCase().includes(term) ||
        emp.dni.includes(term);

      // 2. Filtro por Rol
      const matchesRole = !this.filterRole || emp.role === this.filterRole;

      // 3. Filtro por Estado (Activo / Inactivo)
      let matchesStatus = true;
      if (this.filterStatus === 'active') matchesStatus = emp.is_active === true;
      if (this.filterStatus === 'inactive') matchesStatus = emp.is_active === false;

      // Un empleado solo se muestra si cumple los 3 filtros
      return matchesSearch && matchesRole && matchesStatus;
    });
    
    this.cdr.detectChanges();
  }

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
      this.employeeService.updateEmployee(this.currentEmployeeId, employeeData).subscribe(() => {
        this.loadEmployees();
        this.closeModal();
        this.displayToast('Empleado actualizado exitosamente');
      });
    } else {
      this.employeeService.createEmployee(employeeData).subscribe(() => {
        this.loadEmployees();
        this.closeModal();
        this.displayToast('Empleado creado exitosamente');
      });
    }
  }

  deleteEmployee(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este empleado?')) {
      this.employeeService.deleteEmployee(id).subscribe(() => {
        // Actualizamos la base de datos local y re-aplicamos filtros
        this.employees = this.employees.filter(emp => emp.ID !== id);
        this.applyFilters(); 
        this.displayToast('Empleado eliminado');
      });
    }
  }

  displayToast(message: string): void {
    this.toastMessage = message;
    this.showToast = true;
    this.cdr.detectChanges();
    
    setTimeout(() => {
      this.showToast = false;
      this.cdr.detectChanges();
    }, 3000); 
  }
}