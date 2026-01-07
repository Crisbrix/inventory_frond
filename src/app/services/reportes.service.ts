import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private apiUrl = 'https://inventory-back-phi.vercel.app/api/ventas';
  private productosUrl = 'https://inventory-back-phi.vercel.app/api/productos';

  constructor(private http: HttpClient) {}

  getVentasPorPeriodo(params: any): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/periodo`, { params });
  }

  getTendenciaVentas(params: any): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/tendencia`, { params });
  }

  getVentasPorCategoria(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/categorias`);
  }

  getTopProductos(limite?: number): Observable<ApiResponse<any[]>> {
    if (limite) {
      return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/top-productos?limite=${limite}`);
    }
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/top-productos`);
  }

  getVentasPorMetodoPago(periodo?: string): Observable<ApiResponse<any[]>> {
    if (periodo) {
      return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/metodos-pago?periodo=${periodo}`);
    }
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/metodos-pago`);
  }

  getRotacionInventario(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/rotacion-inventario`);
  }

  getKPIs(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/kpis`);
  }

  getStockActual(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.productosUrl}`);
  }
}
