import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quick-actions.component.html',
  styleUrl: './quick-actions.component.css'
})
export class QuickActionsComponent {
  actions = [
    {
      label: 'Nuevo Producto',
      icon: 'plus',
      action: () => console.log('Nuevo producto')
    },
    {
      label: 'Registrar Entrada',
      icon: 'input',
      action: () => console.log('Registrar entrada')
    },
    {
      label: 'Registrar Salida',
      icon: 'output',
      action: () => console.log('Registrar salida')
    },
    {
      label: 'Ajuste de Inventario',
      icon: 'adjust',
      action: () => console.log('Ajuste')
    },
    {
      label: 'Ver Reportes',
      icon: 'reports',
      action: () => console.log('Reportes')
    }
  ];

  executeAction(action: () => void) {
    action();
  }
}

