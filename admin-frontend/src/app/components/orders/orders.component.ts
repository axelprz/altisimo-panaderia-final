import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.component.html'
})
export class OrdersComponent implements OnInit {
  orders: any[] = [];
  isLoading = true;
  
  // Estados para Rechazo
  rejectingOrderId: number | null = null;
  rejectionReason: string = '';

  // NUEVO: Estados para Aceptación
  acceptingOrderId: number | null = null;
  deliveryDate: string = '';

  constructor(
    private orderService: OrderService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading = true;
    this.orderService.getPendingOrders().subscribe({
      next: (data) => {
        this.orders = data || []; 
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // --- LÓGICA DE ACEPTACIÓN ---
  startAcceptance(id: number) {
    this.acceptingOrderId = id;
    this.deliveryDate = ''; // Resetear fecha
    this.rejectingOrderId = null; // Cerrar el de rechazo si estaba abierto
    this.cdr.detectChanges();
  }

  cancelAcceptance() {
    this.acceptingOrderId = null;
    this.deliveryDate = '';
    this.cdr.detectChanges();
  }

  confirmAcceptance(id: number) {
    if (!this.deliveryDate) {
      alert('Por favor, selecciona una fecha y hora de entrega.');
      return;
    }

    // Enviamos el estado 'accepted' y la fecha al servicio
    this.orderService.updateOrderStatus(id, 'accepted', '', this.deliveryDate).subscribe({
      next: () => {
        this.orders = this.orders.filter(o => o.ID !== id);
        this.cancelAcceptance();
      },
      error: (err) => console.error(err)
    });
  }

  // --- LÓGICA DE RECHAZO ---
  startRejection(id: number) {
    this.rejectingOrderId = id;
    this.rejectionReason = '';
    this.acceptingOrderId = null; // Cerrar el de aceptación si estaba abierto
    this.cdr.detectChanges();
  }

  cancelRejection() {
    this.rejectingOrderId = null;
    this.rejectionReason = '';
    this.cdr.detectChanges();
  }

  confirmRejection(id: number) {
    if (!this.rejectionReason.trim()) {
      alert('Por favor, ingresa un motivo de rechazo.');
      return;
    }
    
    this.orderService.updateOrderStatus(id, 'rejected', this.rejectionReason).subscribe({
      next: () => {
        this.orders = this.orders.filter(o => o.ID !== id);
        this.cancelRejection();
      },
      error: (err) => console.error(err)
    });
  }

  formatImageUrl(imgPath: string): string {
    if (!imgPath) return '/assets/images/placeholder.png';
    const cleanPath = imgPath.trim();
    if (cleanPath.startsWith('http') || cleanPath.startsWith('/')) return cleanPath;
    return '/' + cleanPath;
  }
}