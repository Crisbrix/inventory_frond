import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from './card/card.component';
import { QuickActionsComponent } from './quick-actions/quick-actions.component';
import { AlertsPanelComponent } from './alerts-panel/alerts-panel.component';
import { ChartsSectionComponent } from './charts-section/charts-section.component';
import { RecentMovementsComponent } from './recent-movements/recent-movements.component';

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
export class DashboardComponent {
  // Cards de indicadores rápidos
  indicatorCards = [
    {
      title: 'Productos Totales',
      value: '1,234',
      iconType: 'box',
      subtitle: 'En inventario',
      color: 'blue'
    },
    {
      title: 'Stock Bajo',
      value: '23',
      iconType: 'alert',
      subtitle: 'Requieren atención',
      color: 'orange'
    },
    {
      title: 'Movimientos Hoy',
      value: '156',
      iconType: 'movement',
      subtitle: 'Entradas y salidas',
      color: 'green'
    },
    {
      title: 'Alertas Activas',
      value: '8',
      iconType: 'warning',
      subtitle: 'Pendientes de revisar',
      color: 'red'
    }
  ];
}
