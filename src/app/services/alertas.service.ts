import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Alerta {
  id?: number;
  producto_id: number;
  producto_nombre?: string;
  producto_codigo?: string;
  tipo: string;
  mensaje: string;
  fecha: string;
  atendida: boolean;
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
export class AlertasService {
  private apiUrl = `${environment.apiUrl}/alertas`;

  constructor(private http: HttpClient) {}

  // Obtener todas las alertas
  getAlertas(): Observable<ApiResponse<Alerta[]>> {
    return this.http.get<ApiResponse<Alerta[]>>(this.apiUrl);
  }

  // Obtener alertas activas
  getAlertasActivas(): Observable<ApiResponse<Alerta[]>> {
    return this.http.get<ApiResponse<Alerta[]>>(`${this.apiUrl}/activas`);
  }

  // Obtener alertas por producto
  getAlertasByProducto(productoId: number): Observable<ApiResponse<Alerta[]>> {
    return this.http.get<ApiResponse<Alerta[]>>(`${this.apiUrl}/producto/${productoId}`);
  }

  // Marcar alerta como atendida
  marcarAtendida(alertaId: number): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${alertaId}/atender`, {});
  }

  // Crear nueva alerta
  createAlerta(alerta: Partial<Alerta>): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(this.apiUrl, alerta);
  }

  // Eliminar alerta
  deleteAlerta(alertaId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${alertaId}`);
  }
}
