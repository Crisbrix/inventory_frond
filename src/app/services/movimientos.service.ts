import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Movimiento {
  id?: number;
  producto_id: number;
  producto_nombre?: string;
  producto_codigo?: string;
  tipo_movimiento: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  cantidad: number;
  fecha: string;
  observacion?: string;
}

export interface TopProducto {
  id: number;
  nombre: string;
  codigo: string;
  total_movimientos: number;
  total_entradas: number;
  total_salidas: number;
}

export interface EstadisticaMovimiento {
  tipo_movimiento: string;
  total_movimientos: number;
  total_cantidad: number;
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
export class MovimientosService {
  private apiUrl = `${environment.apiUrl}/movimientos`;

  constructor(private http: HttpClient) {}

  // Obtener todos los movimientos
  getMovimientos(): Observable<ApiResponse<Movimiento[]>> {
    return this.http.get<ApiResponse<Movimiento[]>>(this.apiUrl);
  }

  // Obtener movimientos de hoy
  getMovimientosHoy(): Observable<ApiResponse<Movimiento[]>> {
    return this.http.get<ApiResponse<Movimiento[]>>(`${this.apiUrl}/hoy`);
  }

  // Obtener movimientos por tipo
  getMovimientosPorTipo(tipo: string): Observable<ApiResponse<Movimiento[]>> {
    return this.http.get<ApiResponse<Movimiento[]>>(`${this.apiUrl}/tipo/${tipo}`);
  }

  // Obtener top 5 productos más movidos
  getTopProductos(): Observable<ApiResponse<TopProducto[]>> {
    return this.http.get<ApiResponse<TopProducto[]>>(`${this.apiUrl}/top-productos`);
  }

  // Obtener estadísticas de entradas vs salidas
  getEntradasSalidas(): Observable<ApiResponse<EstadisticaMovimiento[]>> {
    return this.http.get<ApiResponse<EstadisticaMovimiento[]>>(`${this.apiUrl}/estadisticas/entradas-salidas`);
  }

  // Obtener movimientos por tipo para gráfica
  getMovimientosPorTipoChart(): Observable<ApiResponse<EstadisticaMovimiento[]>> {
    return this.http.get<ApiResponse<EstadisticaMovimiento[]>>(`${this.apiUrl}/estadisticas/por-tipo`);
  }

  // Crear nuevo movimiento
  createMovimiento(movimiento: Partial<Movimiento>): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.apiUrl, movimiento);
  }

  // Obtener movimientos por producto
  getMovimientosByProducto(productoId: number): Observable<ApiResponse<Movimiento[]>> {
    return this.http.get<ApiResponse<Movimiento[]>>(`${this.apiUrl}/producto/${productoId}`);
  }
}
