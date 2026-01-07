import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertasService, Alerta } from '../../services/alertas.service';

interface Alert {
  id: number;
  type: 'stock-low' | 'stock-zero' | 'expiring' | 'adjustment' | 'no-movement';
  title: string;
  message: string;
  product?: string;
  priority: 'high' | 'medium' | 'low';
}

@Component({
  selector: 'app-alerts-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alerts-panel.component.html',
  styleUrl: './alerts-panel.component.css'
})
export class AlertsPanelComponent implements OnInit {
  @Input() alertas: Alerta[] = [];
  alerts: Alert[] = [];
  loading = false;

  constructor(private alertasService: AlertasService) {}

  ngOnInit() {
    if (this.alertas.length === 0) {
      this.loadAlertas();
    } else {
      this.transformAlertas();
    }
  }

  loadAlertas() {
    this.loading = true;
    this.alertasService.getAlertasActivas().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.alertas = response.data;
          this.transformAlertas();
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error cargando alertas:', error);
        this.loading = false;
      }
    });
  }

  transformAlertas() {
    this.alerts = this.alertas.map(alerta => ({
      id: alerta.id || 0,
      type: this.getAlertTypeFromTipo(alerta.tipo),
      title: this.getAlertTitle(alerta.tipo),
      message: alerta.mensaje,
      product: alerta.producto_nombre,
      priority: this.getPriorityFromTipo(alerta.tipo)
    }));
  }

  getAlertTypeFromTipo(tipo: string): Alert['type'] {
    const typeMap: { [key: string]: Alert['type'] } = {
      'STOCK_BAJO': 'stock-low',
      'STOCK_CERO': 'stock-zero',
      'VENCIMIENTO': 'expiring',
      'AJUSTE': 'adjustment',
      'SIN_MOVIMIENTO': 'no-movement'
    };
    return typeMap[tipo] || 'stock-low';
  }

  getAlertTitle(tipo: string): string {
    const titleMap: { [key: string]: string } = {
      'STOCK_BAJO': 'Stock bajo',
      'STOCK_CERO': 'Stock en cero',
      'VENCIMIENTO': 'Próximo vencimiento',
      'AJUSTE': 'Ajuste realizado',
      'SIN_MOVIMIENTO': 'Sin movimiento'
    };
    return titleMap[tipo] || 'Alerta';
  }

  getPriorityFromTipo(tipo: string): Alert['priority'] {
    const highPriority = ['STOCK_CERO', 'STOCK_BAJO'];
    const mediumPriority = ['VENCIMIENTO'];
    
    if (highPriority.includes(tipo)) return 'high';
    if (mediumPriority.includes(tipo)) return 'medium';
    return 'low';
  }

  getAlertIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'stock-zero': 'zero',
      'stock-low': 'alert',
      'expiring': 'clock',
      'adjustment': 'edit',
      'no-movement': 'pause'
    };
    return icons[type] || 'alert';
  }

  getPriorityClass(priority: string): string {
    return `priority-${priority}`;
  }

  markAsRead(alertId: number) {
    // TODO: Implementar marcar como leído
    console.log('Marcar alerta como leída:', alertId);
  }
}


