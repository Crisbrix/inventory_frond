import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovimientosService, TopProducto, EstadisticaMovimiento } from '../../services/movimientos.service';

@Component({
  selector: 'app-charts-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './charts-section.component.html',
  styleUrl: './charts-section.component.css'
})
export class ChartsSectionComponent implements OnInit {
  @Input() topProductos: TopProducto[] = [];
  @Input() entradasSalidasData: EstadisticaMovimiento[] = [];
  @Input() movimientosPorTipoData: EstadisticaMovimiento[] = [];

  topProducts: any[] = [];
  entradasSalidasChart: any[] = [];
  movimientosPorTipoChart: any[] = [];
  loading = false;

  constructor(private movimientosService: MovimientosService) {}

  ngOnInit() {
    if (this.topProductos.length === 0) {
      this.loadChartData();
    } else {
      this.transformData();
    }
  }

  loadChartData() {
    this.loading = true;

    // Cargar top productos
    this.movimientosService.getTopProductos().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.topProductos = response.data;
        }
      },
      error: (error: any) => {
        console.error('Error cargando top productos:', error);
      }
    });

    // Cargar estadísticas entradas vs salidas
    this.movimientosService.getEntradasSalidas().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.entradasSalidasData = response.data;
        }
      },
      error: (error: any) => {
        console.error('Error cargando estadísticas entradas-salidas:', error);
      }
    });

    // Cargar movimientos por tipo
    this.movimientosService.getMovimientosPorTipoChart().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.movimientosPorTipoData = response.data;
        }
      },
      error: (error: any) => {
        console.error('Error cargando movimientos por tipo:', error);
      }
    });

    setTimeout(() => {
      this.transformData();
      this.loading = false;
    }, 1000);
  }

  transformData() {
    // Transformar top productos para el chart
    this.topProducts = this.topProductos.map(producto => ({
      name: producto.nombre,
      movements: producto.total_movimientos,
      entradas: producto.total_entradas,
      salidas: producto.total_salidas
    }));

    // Transformar datos para gráfica de entradas vs salidas
    this.entradasSalidasChart = this.entradasSalidasData.map(item => ({
      type: item.tipo_movimiento,
      value: item.total_cantidad || item.total_movimientos,
      label: item.tipo_movimiento === 'ENTRADA' ? 'Entradas' : 'Salidas'
    }));

    // Transformar datos para gráfica de movimientos por tipo
    this.movimientosPorTipoChart = this.movimientosPorTipoData.map(item => ({
      type: item.tipo_movimiento,
      value: item.total_movimientos,
      label: this.getMovementLabel(item.tipo_movimiento)
    }));
  }

  getMovementLabel(tipo: string): string {
    const labels: { [key: string]: string } = {
      'ENTRADA': 'Entradas',
      'SALIDA': 'Salidas',
      'AJUSTE': 'Ajustes'
    };
    return labels[tipo] || tipo;
  }

  getPercentage(value: number, total: number): number {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  }

  // Métodos para las gráficas
  getTopProductBarWidth(movements: number): number {
    const maxMovements = Math.max(...this.topProducts.map(p => p.movements));
    return maxMovements > 0 ? (movements / maxMovements) * 100 : 0;
  }

  getEntradaSalidaBarWidth(value: number): number {
    const maxValue = Math.max(...this.entradasSalidasChart.map(item => item.value));
    return maxValue > 0 ? (value / maxValue) * 100 : 0;
  }

  getMovimientoTipoBarWidth(value: number): number {
    const maxValue = Math.max(...this.movimientosPorTipoChart.map(item => item.value));
    return maxValue > 0 ? (value / maxValue) * 100 : 0;
  }
}



