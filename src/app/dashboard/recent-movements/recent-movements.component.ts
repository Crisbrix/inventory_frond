import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovimientosService, Movimiento } from '../../services/movimientos.service';

interface Movement {
  id: number;
  type: 'entrada' | 'salida' | 'ajuste';
  product: string;
  quantity: number;
  date: string;
  user: string;
}

@Component({
  selector: 'app-recent-movements',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recent-movements.component.html',
  styleUrl: './recent-movements.component.css'
})
export class RecentMovementsComponent implements OnInit {
  @Input() movimientos: Movimiento[] = [];
  movements: Movement[] = [];
  loading = false;

  constructor(private movimientosService: MovimientosService) {}

  ngOnInit() {
    if (this.movimientos.length === 0) {
      this.loadMovimientos();
    } else {
      this.transformMovimientos();
    }
  }

  loadMovimientos() {
    this.loading = true;
    this.movimientosService.getMovimientosHoy().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.movimientos = response.data;
          this.transformMovimientos();
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error cargando movimientos:', error);
        this.loading = false;
      }
    });
  }

  transformMovimientos() {
    this.movements = this.movimientos.map(mov => ({
      id: mov.id || 0,
      type: mov.tipo_movimiento.toLowerCase() as 'entrada' | 'salida' | 'ajuste',
      product: mov.producto_nombre || 'Producto desconocido',
      quantity: mov.tipo_movimiento === 'SALIDA' ? -mov.cantidad : mov.cantidad,
      date: this.formatDate(mov.fecha),
      user: 'Usuario' // TODO: Obtener usuario del backend
    }));
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'Hace unos minutos';
    } else if (diffHours < 24) {
      return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    } else if (diffDays === 1) {
      return 'Ayer';
    } else {
      return `Hace ${diffDays} días`;
    }
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'entrada': 'Entrada',
      'salida': 'Salida',
      'ajuste': 'Ajuste'
    };
    return labels[type] || type;
  }

  getTypeClass(type: string): string {
    return `type-${type}`;
  }
}



