import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { DashboardService, DashboardStats } from '../../services/dashboard';

// IMPORTANTE PARA QUE FUNCIONE CHART.JS EN ANGULAR STANDALONE
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  isLoading = true;

  // =========================================
  // GRÁFICO 1: ESTADO DE PEDIDOS (BARRAS)
  // =========================================
  public barChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: '#4A3728', padding: 12, cornerRadius: 8 }
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } } // Sin decimales en pedidos
    }
  };
  public barChartType: ChartType = 'bar';
  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Pendientes', 'Aceptados', 'Entregados'],
    datasets: [{ 
      data: [0, 0, 0], 
      backgroundColor: ['#F59E0B', '#10B981', '#4A3728'], // Amarillo, Verde, Marrón
      borderRadius: 8
    }]
  };

  // =========================================
  // GRÁFICO 2: INGRESOS ÚLTIMOS 7 DÍAS (LÍNEAS)
  // =========================================
  public lineChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { 
        backgroundColor: '#4A3728', 
        callbacks: {
          label: (context) => ` $${context.parsed.y}`
        }
      }
    },
    scales: {
      y: { beginAtZero: true }
    },
    elements: {
      line: { tension: 0.4 } // Hace la línea curva
    }
  };
  public lineChartType: ChartType = 'line';
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'], // Se sobrescribe al cargar
    datasets: [{ 
      data: [0, 0, 0, 0, 0, 0, 0],
      borderColor: '#C5A059', // Dorado
      backgroundColor: 'rgba(197, 160, 89, 0.2)', // Dorado transparente debajo de la línea
      fill: true,
      pointBackgroundColor: '#4A3728',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#C5A059',
      borderWidth: 3
    }]
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
        
        // 1. Actualizamos el gráfico de Barras
        this.barChartData.datasets[0].data = [
          data.pending_orders, 
          data.accepted_orders, 
          data.delivered_orders
        ];
        this.barChartData = {...this.barChartData}; // Forzar actualización visual
        
        // 2. Actualizamos el gráfico de Líneas (Si hay historial)
        if (data.daily_sales && data.daily_sales.length > 0) {
          // Extraemos las fechas para las etiquetas X
          this.lineChartData.labels = data.daily_sales.map(sale => {
            const date = new Date(sale.date);
            return `${date.getDate()}/${date.getMonth()+1}`; // Ej: 5/3
          });
          // Extraemos los totales para el eje Y
          this.lineChartData.datasets[0].data = data.daily_sales.map(sale => sale.total);
          this.lineChartData = {...this.lineChartData};
        }
        
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar estadísticas:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}