import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentasService, ProductoVenta } from '../services/ventas.service';
import { ProductService } from '../services/product.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ventas.component.html',
  styleUrl: './ventas.component.css'
})
export class VentasComponent implements OnInit {
  productosDisponibles: ProductoVenta[] = [];
  busquedaProducto: string = '';

  // Carrito de productos
  carrito: { producto: ProductoVenta; cantidad: number }[] = [];

  // Datos de pago
  metodoPago: 'EFECTIVO' | 'TARJETA' | 'VIRTUAL' = 'EFECTIVO';
  montoRecibido: number = 0;
  descuento: number = 0;

  // Estados
  loading = false;
  procesandoVenta = false;

  constructor(
    private ventasService: VentasService,
    private productService: ProductService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.loading = true;
    this.productService.getProductos().subscribe({
      next: (response: any) => {
        console.log('Datos de productos recibidos:', response.data); // Debug
        if (response.success && response.data) {
          this.productosDisponibles = response.data;
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error cargando productos:', error);
        this.loading = false;
      }
    });
  }

  // Método para agregar producto directamente al hacer clic
  agregarProductoDirecto(producto: ProductoVenta) {
    // Verificar stock disponible
    const stockDisponible = producto.stock || producto.stock_actual || 0;
    if (1 > stockDisponible) {
      alert(`Stock insuficiente. Solo hay ${stockDisponible} unidades disponibles.`);
      return;
    }

    // Verificar si el producto ya está en el carrito
    const itemExistente = this.carrito.find(item => item.producto.id === producto.id);
    if (itemExistente) {
      const nuevaCantidad = itemExistente.cantidad + 1;
      if (nuevaCantidad > stockDisponible) {
        alert(`Stock insuficiente. Solo hay ${stockDisponible} unidades disponibles.`);
        return;
      }
      itemExistente.cantidad = nuevaCantidad;
    } else {
      this.carrito.push({ producto, cantidad: 1 });
    }
  }

  eliminarDelCarrito(index: number) {
    this.carrito.splice(index, 1);
  }

  actualizarCantidadCarrito(index: number, nuevaCantidad: number) {
    if (nuevaCantidad <= 0) {
      this.eliminarDelCarrito(index);
      return;
    }

    const item = this.carrito[index];
    const stockDisponible = item.producto.stock || item.producto.stock_actual || 0;
    
    if (nuevaCantidad > stockDisponible) {
      alert(`Stock insuficiente. Solo hay ${stockDisponible} unidades disponibles.`);
      return;
    }

    item.cantidad = nuevaCantidad;
  }

  getSubtotal(): number {
    return this.carrito.reduce((total, item) => {
      return total + (item.producto.precio * item.cantidad);
    }, 0);
  }

  getTotal(): number {
    return this.getSubtotal() - this.descuento;
  }

  procesarVenta() {
    if (this.carrito.length === 0) {
      alert('El carrito está vacío. Agregue productos antes de procesar la venta.');
      return;
    }

    if (this.metodoPago === 'EFECTIVO' && this.montoRecibido < this.getTotal()) {
      alert('El monto recibido es insuficiente');
      return;
    }

    this.procesandoVenta = true;
    const currentUser = this.authService.getCurrentUser();

    const venta = {
      usuario_id: currentUser?.id || 1,
      detalles: this.carrito.map(item => ({
        producto_id: item.producto.id,
        cantidad: item.cantidad,
        precio: item.producto.precio
      })),
      metodo_pago: this.metodoPago,
      monto_recibido: this.metodoPago === 'EFECTIVO' ? this.montoRecibido : this.getTotal(),
      descuento: this.descuento
    };

    console.log('Enviando venta:', venta);

    this.ventasService.createVenta(venta).subscribe({
      next: (response) => {
        if (response.success) {
          alert(`Venta #${response.data?.id} procesada exitosamente`);
          this.limpiarFormulario();
          // Recargar productos para actualizar stock
          this.cargarProductos();
        } else {
          alert(response.message || 'Error al procesar la venta');
        }
        this.procesandoVenta = false;
      },
      error: (error: any) => {
        console.error('Error procesando venta:', error);
        alert('Error al procesar la venta');
        this.procesandoVenta = false;
      }
    });
  }

  // Método para abrir formulario de registro de productos
  abrirFormularioProducto() {
    // Aquí puedes abrir un modal o navegar a una página de registro
    alert('Función de registro de productos próximamente');
  }

  limpiarFormulario() {
    this.carrito = [];
    this.montoRecibido = 0;
    this.metodoPago = 'EFECTIVO';
    this.busquedaProducto = '';
    this.descuento = 0;
  }

  calcularCambio(): number {
    if (this.metodoPago !== 'EFECTIVO') return 0;
    return this.ventasService.calcularCambio(this.montoRecibido, this.getTotal());
  }

  calcularValorTotalInventario(): number {
    return this.productosDisponibles.reduce((total, producto) => {
      return total + (producto.stock * producto.precio);
    }, 0);
  }

  getProductosStockBajo(): number {
    return this.productosDisponibles.filter(p => 
      p.stock <= (p.min_stock || 5)
    ).length;
  }

  formatCurrency(value: number): string {
    if (isNaN(value) || value === null || value === undefined) {
      return '$0';
    }
    return this.ventasService.formatCurrency(value);
  }

  filtrarProductos(): ProductoVenta[] {
    if (!this.busquedaProducto) return this.productosDisponibles;
    
    const busqueda = this.busquedaProducto.toLowerCase();
    return this.productosDisponibles.filter((producto: ProductoVenta) =>
      producto.nombre.toLowerCase().includes(busqueda) ||
      producto.codigo.toLowerCase().includes(busqueda)
    );
  }
}
