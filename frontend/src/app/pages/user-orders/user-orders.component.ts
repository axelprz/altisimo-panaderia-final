import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; 
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-user-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-orders.component.html'
})
export class UserOrdersComponent implements OnInit {
  orders: any[] = [];
  isLoading = true;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.orderService.getUserOrders().subscribe({
      next: (data) => {
        this.orders = data || [];
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  getStatusClass(status: string) {
    const classes: any = {
      'pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'accepted': 'bg-green-100 text-green-700 border-green-200',
      'delivered': 'bg-gray-200 text-gray-600 border-gray-300',
      'rejected': 'bg-red-100 text-red-700 border-red-200',
      'cancelled': 'bg-red-100 text-red-700 border-red-200'
    };
    return classes[status] || 'bg-gray-100 text-gray-700';
  }

  // --- FORMATEADOR SEGURO DE IMÁGENES ---
  formatImageUrl(imgPath: string | undefined): string {
    if (!imgPath) return '/assets/images/placeholder.jpg'; 
    if (imgPath.startsWith('data:image')) return imgPath; 
    if (imgPath.startsWith('http')) return imgPath;
    if (imgPath.startsWith('/assets/') || imgPath.startsWith('assets/')) return imgPath.startsWith('/') ? imgPath : '/' + imgPath;
    return '/' + imgPath;
  }
}