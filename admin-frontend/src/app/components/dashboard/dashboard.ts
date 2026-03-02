import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { DashboardService, DashboardStats } from '../../services/dashboard';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  isLoading = true;

  // Configuración del gráfico de Dona (Pedidos)
  public pieChartOptions: ChartOptions<'doughnut'> = { 
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' }
    },
    cutout: '70%', // Hace que el anillo sea más delgado y elegante
  };
  
  public pieChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Aceptados', 'Pendientes'],
    datasets: [ { 
      data: [0, 0], 
      backgroundColor: ['#10B981', '#F59E0B'], // Verde y Naranja Tailwind
      hoverBackgroundColor: ['#059669', '#D97706'],
      borderWidth: 0,
      hoverOffset: 4
    } ]
  };

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.isLoading = true;
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        
        // Actualizamos el gráfico con los datos reales
        this.pieChartData.datasets[0].data = [data.accepted_orders, data.pending_orders];
        // Forzamos la actualización de la referencia para que Chart.js re-renderice
        this.pieChartData = {...this.pieChartData}; 
        
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar estadísticas:', err);
        // Si hay error o no hay datos, inicializamos en cero
        this.stats = { total_sales: 0, accepted_orders: 0, pending_orders: 0 };
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}