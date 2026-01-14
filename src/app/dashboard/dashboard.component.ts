import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from './card/card.component';
import { QuickActionsComponent } from './quick-actions/quick-actions.component';
import { AlertsPanelComponent } from './alerts-panel/alerts-panel.component';
import { ChartsSectionComponent } from './charts-section/charts-section.component';
import { RecentMovementsComponent } from './recent-movements/recent-movements.component';
import { ProductService, Producto } from '../services/product.service';
import { AuthService } from '../services/auth.service';
import { MovimientosService } from '../services/movimientos.service';
import { AlertasService } from '../services/alertas.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    CardComponent, 
    QuickActionsComponent,
    AlertsPanelComponent,
    ChartsSectionComponent,
    RecentMovementsComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  indicatorCards = [
    {
      title: 'Productos Totales',
      value: '0',
      iconType: 'box',
      subtitle: 'En inventario',
      color: 'blue'
    },
    {
      title: 'Stock Bajo',
      value: '0',
      iconType: 'alert',
      subtitle: 'Requieren atención',
      color: 'orange'
    },
    {
      title: 'Movimientos Hoy',
      value: '0',
      iconType: 'movement',
      subtitle: 'Entradas y salidas',
      color: 'green'
    },
    {
      title: 'Alertas Activas',
      value: '0',
      iconType: 'warning',
      subtitle: 'Pendientes de revisar',
      color: 'red'
    }
  ];

  productos: Producto[] = [];
  loading = true;
  currentUser: any = null;
  movimientosHoy: any[] = [];
  alertasActivas: any[] = [];
  entradasSalidasData: any[] = [];
  movimientosPorTipoData: any[] = [];
  topProductos: any[] = [];

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private movimientosService: MovimientosService,
    private alertasService: AlertasService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    
    // Cargar productos
    this.productService.getProductos().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.productos = response.data;
        }
      },
      error: (error) => {
        console.error('Error cargando productos:', error);
      }
    });

    // Cargar movimientos de hoy
    this.movimientosService.getMovimientosHoy().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.movimientosHoy = response.data;
        }
      },
      error: (error) => {
        console.error('Error cargando movimientos de hoy:', error);
      }
    });

    // Cargar alertas activas
    this.alertasService.getAlertasActivas().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.alertasActivas = response.data;
        }
      },
      error: (error) => {
        console.error('Error cargando alertas activas:', error);
      }
    });

    // Cargar estadísticas de entradas vs salidas
    this.movimientosService.getEntradasSalidas().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.entradasSalidasData = response.data;
        }
      },
      error: (error) => {
        console.error('Error cargando estadísticas entradas-salidas:', error);
      }
    });

    // Cargar movimientos por tipo
    this.movimientosService.getMovimientosPorTipoChart().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.movimientosPorTipoData = response.data;
        }
      },
      error: (error) => {
        console.error('Error cargando movimientos por tipo:', error);
      }
    });

    // Cargar top productos más movidos
    this.movimientosService.getTopProductos().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.topProductos = response.data;
        }
      },
      error: (error) => {
        console.error('Error cargando top productos:', error);
      }
    });

    this.loading = false;
    this.updateIndicatorCards();
  }

  updateIndicatorCards() {
    const totalProductos = this.productos.length;
    const stockBajo = this.productos.filter(p => 
      p.stock_minimo && p.stock_actual <= p.stock_minimo
    ).length;

    this.indicatorCards[0].value = totalProductos.toString();
    this.indicatorCards[1].value = stockBajo.toString();
    this.indicatorCards[2].value = this.movimientosHoy.length.toString();
    this.indicatorCards[3].value = this.alertasActivas.length.toString();
  }
}
