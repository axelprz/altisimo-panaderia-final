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
  
  currentTab: 'pending' | 'accepted' = 'pending';

  // Estados para Aceptación
  acceptingOrderId: number | null = null;
  deliveryDate: string = '';

  // --- VARIABLES PARA TOAST Y MODALES ---
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  showCancelModal = false;
  orderToCancelId: number | null = null;
  orderToCancelStatus: 'pending' | 'accepted' = 'pending';
  rejectionReason = '';

  showDeliverModal = false;
  orderToDeliverId: number | null = null;

  constructor(
    private orderService: OrderService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  switchTab(tab: 'pending' | 'accepted') {
    this.currentTab = tab;
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading = true;
    this.orders = []; 
    this.cdr.detectChanges();

    const request = this.currentTab === 'pending' 
      ? this.orderService.getPendingOrders() 
      : this.orderService.getAcceptedOrders();

    request.subscribe({
      next: (data) => {
        this.orders = data || []; 
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando pedidos', err);
        this.isLoading = false;
        this.showNotification('Error al cargar la lista de pedidos', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  // --- LÓGICA DE ACEPTACIÓN ---
  startAcceptance(id: number) {
    this.acceptingOrderId = id;
    this.deliveryDate = ''; 
    this.cdr.detectChanges();
  }

  cancelAcceptance() {
    this.acceptingOrderId = null;
    this.deliveryDate = '';
    this.cdr.detectChanges();
  }

  confirmAcceptance(id: number) {
    if (!this.deliveryDate) {
      this.showNotification('Debes asignar una fecha y hora para la entrega.', 'error');
      return;
    }

    this.orderService.updateOrderStatus(id, 'accepted', '', this.deliveryDate).subscribe({
      next: () => {
        this.orders = this.orders.filter(o => o.ID !== id);
        this.cancelAcceptance();
        this.showNotification('Pedido programado con éxito.', 'success');
      },
      error: (err) => {
        console.error(err);
        this.showNotification('Ocurrió un error al procesar el pedido.', 'error');
      }
    });
  }

  // --- LÓGICA DE CANCELACIÓN (Modal) ---
  openCancelModal(id: number, type: 'pending' | 'accepted') {
    this.orderToCancelId = id;
    this.orderToCancelStatus = type;
    this.rejectionReason = '';
    this.showCancelModal = true;
    this.acceptingOrderId = null; 
    this.cdr.detectChanges();
  }

  closeCancelModal() {
    this.showCancelModal = false;
    this.orderToCancelId = null;
    this.rejectionReason = '';
    this.cdr.detectChanges();
  }

  confirmCancellation() {
    if (!this.orderToCancelId || !this.rejectionReason.trim()) return;

    const newStatus = this.orderToCancelStatus === 'pending' ? 'rejected' : 'cancelled';

    this.orderService.updateOrderStatus(this.orderToCancelId, newStatus, this.rejectionReason).subscribe({
      next: () => {
        this.orders = this.orders.filter(o => o.ID !== this.orderToCancelId);
        this.closeCancelModal();
        this.showNotification('Pedido cancelado correctamente.', 'success');
      },
      error: (err) => {
        console.error(err);
        this.showNotification('No se pudo cancelar el pedido.', 'error');
      }
    });
  }

  // --- LÓGICA DE ENTREGA (Modal) ---
  openDeliverModal(id: number) {
    this.orderToDeliverId = id;
    this.showDeliverModal = true;
    this.cdr.detectChanges();
  }

  closeDeliverModal() {
    this.showDeliverModal = false;
    this.orderToDeliverId = null;
    this.cdr.detectChanges();
  }

  confirmDelivery() {
    if (!this.orderToDeliverId) return;

    this.orderService.updateOrderStatus(this.orderToDeliverId, 'delivered').subscribe({
      next: () => {
        this.orders = this.orders.filter(o => o.ID !== this.orderToDeliverId);
        this.closeDeliverModal();
        this.showNotification('¡Pago ingresado a la caja!', 'success');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.closeDeliverModal();
        this.showNotification('Error al marcar como entregado.', 'error');
      }
    });
  }

  // --- TOAST NOTIFICATIONS ---
  showNotification(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    this.cdr.detectChanges();
    
    setTimeout(() => {
      this.showToast = false;
      this.cdr.detectChanges();
    }, 4000); 
  }

  formatImageUrl(imgPath: string | undefined): string {
    if (!imgPath) return '/assets/images/placeholder.jpg'; 
    if (imgPath.startsWith('data:image')) return imgPath; 
    if (imgPath.startsWith('http')) return imgPath;
    if (imgPath.startsWith('/assets/') || imgPath.startsWith('assets/')) return imgPath;
    return `http://localhost:8080${imgPath}`;
  }
}