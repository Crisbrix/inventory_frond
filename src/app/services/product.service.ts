import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Producto {
  id?: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  precio: number;
  stock: number;
  stock_actual?: number;
  categoria?: string;
  min_stock?: number;
  stock_minimo?: number;
  imagen?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductoResponse {
  success: boolean;
  message?: string;
  data?: Producto[];
  producto?: Producto;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'https://inventory-back-five.vercel.app/api/productos';

  constructor(private http: HttpClient) {}

  getProductos(): Observable<ProductoResponse> {
    return this.http.get<ProductoResponse>(this.apiUrl);
  }

  getProductoById(id: number): Observable<ProductoResponse> {
    return this.http.get<ProductoResponse>(`${this.apiUrl}/${id}`);
  }

  createProducto(producto: Producto): Observable<ProductoResponse> {
    return this.http.post<ProductoResponse>(this.apiUrl, producto);
  }

  updateProducto(id: number, producto: Producto): Observable<ProductoResponse> {
    return this.http.put<ProductoResponse>(`${this.apiUrl}/${id}`, producto);
  }

  deleteProducto(id: number): Observable<ProductoResponse> {
    return this.http.delete<ProductoResponse>(`${this.apiUrl}/${id}`);
  }

  buscarProducto(term: string): Observable<ProductoResponse> {
    return this.http.get<ProductoResponse>(`${this.apiUrl}/buscar?q=${term}`);
  }

  getProductosByCategoria(categoria: string): Observable<ProductoResponse> {
    return this.http.get<ProductoResponse>(`${this.apiUrl}/categoria/${categoria}`);
  }

  getProductosLowStock(): Observable<ProductoResponse> {
    return this.http.get<ProductoResponse>(`${this.apiUrl}/low-stock`);
  }
}
