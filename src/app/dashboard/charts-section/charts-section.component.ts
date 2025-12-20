import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-charts-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './charts-section.component.html',
  styleUrl: './charts-section.component.css'
})
export class ChartsSectionComponent {
  topProducts = [
    { name: 'Martillos', movements: 245 },
    { name: 'Destornilladores', movements: 189 },
    { name: 'Clavos galvanizados', movements: 156 },
    { name: 'Pintura acrílica', movements: 134 },
    { name: 'Cinta aislante', movements: 98 }
  ];
}

