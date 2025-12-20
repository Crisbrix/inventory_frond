import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CardData {
  title: string;
  value: string;
  iconType: string;
  subtitle: string;
  badge?: string;
  color?: string;
}

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent {
  @Input() cardData!: CardData;

  getIconClass(): string {
    const colorMap: { [key: string]: string } = {
      'orange': 'icon-orange',
      'green': 'icon-green',
      'blue': 'icon-blue',
      'purple': 'icon-purple',
      'red': 'icon-red'
    };
    return colorMap[this.cardData.color || 'orange'] || 'icon-orange';
  }
}
