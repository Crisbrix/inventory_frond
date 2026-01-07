import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quick-actions.component.html',
  styleUrl: './quick-actions.component.css'
})
export class QuickActionsComponent {
  
  constructor(private router: Router) {}

  actions = [
    {
      label: 'Nuevo Producto',
      icon: 'plus',
      action: () => this.router.navigate(['/productos'])
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
      ];

  executeAction(action: () => void) {
    action();
  }
}

