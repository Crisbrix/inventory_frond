import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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
export class AlertsPanelComponent {
  alerts: Alert[] = [
    {
      id: 1,
      type: 'stock-zero',
      title: 'Stock en cero',
      message: 'Producto sin stock disponible',
      product: 'Martillos profesionales',
      priority: 'high'
    },
    {
      id: 2,
      type: 'stock-low',
      title: 'Stock bajo',
      message: 'Quedan menos de 10 unidades',
      product: 'Destornilladores set',
      priority: 'high'
    },
    {
      id: 3,
      type: 'expiring',
      title: 'Próximo vencimiento',
      message: 'Vence en 7 días',
      product: 'Pintura acrílica',
      priority: 'medium'
    },
    {
      id: 4,
      type: 'adjustment',
      title: 'Diferencia por ajuste',
      message: 'Ajuste realizado hoy',
      product: 'Clavos galvanizados',
      priority: 'low'
    },
    {
      id: 5,
      type: 'no-movement',
      title: 'Sin movimiento',
      message: 'Sin movimientos en 60 días',
      product: 'Cinta aislante',
      priority: 'low'
    }
  ];

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
}


