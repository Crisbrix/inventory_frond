import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProductoVenta {
  id: number;
  nombre: string;
  codigo: string;
  stock: number;
  stock_actual?: number;
  precio: number;
  min_stock?: number;
}

export interface DetalleVenta {
  producto_id: number;
  cantidad: number;
  precio: number;
  producto_nombre?: string;
  producto_codigo?: string;
}

export interface Venta {
  id?: number;
  usuario_id: number;
  usuario_nombre?: string;
  fecha: string;
  total: number;
  metodo_pago?: string;
  monto_recibido?: number;
  descuento?: number;
  detalles?: DetalleVenta[];
  total_productos?: number;
}

export interface NuevaVenta {
  usuario_id: number;
  detalles: DetalleVenta[];
  metodo_pago: 'EFECTIVO' | 'TARJETA' | 'VIRTUAL';
  monto_recibido?: number;
  descuento?: number;
}

export interface VentaResponse {
  success: boolean;
  message?: string;
  data?: {
    id: number;
    total: number;
    subtotal: number;
    descuento: number;
    monto_recibido: number;
    cambio: number;
    metodo_pago: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VentasService {
  private apiUrl = `${environment.apiUrl}/ventas`;

  constructor(private http: HttpClient) {}

  // Obtener todas las ventas
  getVentas(): Observable<ApiResponse<Venta[]>> {
    return this.http.get<ApiResponse<Venta[]>>(this.apiUrl);
  }

  // Obtener venta por ID
  getVentaById(id: number): Observable<ApiResponse<Venta>> {
    return this.http.get<ApiResponse<Venta>>(`${this.apiUrl}/${id}`);
  }

  // Obtener ventas por rango de fechas
  getVentasPorFechas(fechaInicio: string, fechaFin: string): Observable<ApiResponse<Venta[]>> {
    return this.http.get<ApiResponse<Venta[]>>(`${this.apiUrl}/fechas?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`);
  }

  // Crear nueva venta
  createVenta(venta: NuevaVenta): Observable<VentaResponse> {
    return this.http.post<VentaResponse>(this.apiUrl, venta);
  }

  // Formatear moneda colombiana
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  // Calcular cambio
  calcularCambio(montoRecibido: number, total: number): number {
    return Math.max(0, montoRecibido - total);
  }

  // Calcular subtotal
  calcularSubtotal(detalles: DetalleVenta[]): number {
    return detalles.reduce((sum, detalle) => sum + (detalle.cantidad * detalle.precio), 0);
  }

  // Calcular total con descuento
  calcularTotal(subtotal: number, descuento: number = 0): number {
    return subtotal - (descuento / 100) * subtotal;
  }
}
