import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RegistrarProductoComponent } from './registrar-producto/registrar-producto.component';
import { EditarProductoComponent } from './editar-producto/editar-producto.component';
import { ProductService, Producto } from '../services/product.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, RouterModule, RegistrarProductoComponent, EditarProductoComponent],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css'
})
export class ProductosComponent implements OnInit {
  productos: Producto[] = [];
  loading = false;
  error = '';
  mostrarFormulario = false;
  productoAEditar: Producto | null = null;

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.loading = true;
    this.error = '';

    this.productService.getProductos().subscribe({
      next: (response) => {
        this.loading = false;
        console.log('Productos recibidos:', response.data); // Debug para ver los datos
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

  editarProducto(id: number) {
    const producto = this.productos.find(p => p.id === id);
    if (producto) {
      this.productoAEditar = producto;
    }
  }

  onProductoActualizado() {
    this.productoAEditar = null;
    this.cargarProductos();
  }

  cancelarEdicion() {
    this.productoAEditar = null;
  }

  eliminarProducto(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      this.productService.deleteProducto(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.cargarProductos();
          } else {
            this.error = response.message || 'Error al eliminar producto';
          }
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al eliminar producto';
        }
      });
    }
  }
}

