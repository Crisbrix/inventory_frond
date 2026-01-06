import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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
export class RecentMovementsComponent {
  movements: Movement[] = [
    {
      id: 1,
      type: 'entrada',
      product: 'Martillos profesionales',
      quantity: 50,
      date: 'Hace 2 horas',
      user: 'Juan Pérez'
    },
    {
      id: 2,
      type: 'salida',
      product: 'Destornilladores set',
      quantity: -15,
      date: 'Hace 5 horas',
      user: 'María García'
    },
    {
      id: 3,
      type: 'ajuste',
      product: 'Clavos galvanizados',
      quantity: -3,
      date: 'Hace 1 día',
      user: 'Carlos López'
    },
    {
      id: 4,
      type: 'entrada',
      product: 'Pintura acrílica',
      quantity: 30,
      date: 'Hace 1 día',
      user: 'Ana Martínez'
    },
    {
      id: 5,
      type: 'salida',
      product: 'Cinta aislante',
      quantity: -20,
      date: 'Hace 2 días',
      user: 'Luis Rodríguez'
    }
  ];

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


