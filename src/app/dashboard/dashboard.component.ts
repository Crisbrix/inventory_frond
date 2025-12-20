import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from './card/card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  selectedPeriod: string = 'Esta Semana';
  
  periods = [
    { label: 'Hoy', value: 'Hoy' },
    { label: 'Esta Semana', value: 'Esta Semana' },
    { label: 'Este Mes', value: 'Este Mes' },
    { label: 'Este Año', value: 'Este Año' }
  ];

  cards = [
    {
      title: 'Total Ventas Hoy',
      value: '24',
      iconType: 'cart',
      subtitle: 'Total Ventas Hoy',
      color: 'orange'
    },
    {
      title: 'Ingresos Totales Hoy',
      value: '$10,000',
      iconType: 'money',
      subtitle: 'Ingresos Totales Hoy',
      color: 'green'
    },
    {
      title: 'Ticket Promedio',
      value: '$5,000',
      iconType: 'chart',
      subtitle: 'Ticket Promedio',
      color: 'blue'
    },
    {
      title: 'Producto Más Vendido',
      value: 'martillos',
      iconType: 'box',
      subtitle: 'Producto Más Vendido',
      badge: '4 unidades',
      color: 'purple'
    }
  ];

  selectPeriod(period: string) {
    this.selectedPeriod = period;
  }
}
