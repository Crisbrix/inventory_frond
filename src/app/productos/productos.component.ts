import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { RegistrarProductoComponent } from './registrar-producto/registrar-producto.component';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, RouterModule, RegistrarProductoComponent],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css'
})
export class ProductosComponent implements OnInit {
  productos: any[] = [];
  loading = false;
  error = '';
  mostrarFormulario = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.loading = true;
    this.error = '';

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get('http://localhost:3000/api/productos', { headers })
      .subscribe({
        next: (response: any) => {
          this.loading = false;
          if (response.success) {
            this.productos = response.data || [];
          } else {
            this.error = response.message || 'Error al cargar productos';
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || 'Error al conectar con el servidor';
        }
      });
  }

  toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;
  }

  onProductoCreado() {
    this.mostrarFormulario = false;
    this.cargarProductos();
  }
}

