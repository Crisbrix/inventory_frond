import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Producto } from '../../services/product.service';

@Component({
  selector: 'app-editar-producto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './editar-producto.component.html',
  styleUrl: './editar-producto.component.css'
})
export class EditarProductoComponent implements OnInit {
  @Input() producto!: Producto;
  @Output() productoActualizado = new EventEmitter<void>();
  @Output() cancelarEdicion = new EventEmitter<void>();
  
  productoForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.productoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      descripcion: [''],
      precio: ['', [Validators.required, Validators.min(0.01)]],
      stock_actual: [0, [Validators.required, Validators.min(0)]],
      stock_minimo: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    if (this.producto) {
      this.productoForm.patchValue({
        nombre: this.producto.nombre,
        descripcion: this.producto.descripcion || '',
        precio: this.producto.precio,
        stock_actual: this.producto.stock || this.producto.stock_actual || 0,
        stock_minimo: this.producto.min_stock || this.producto.stock_minimo || 0
      });
    }
  }

  onSubmit() {
    if (this.productoForm.valid) {
      this.loading = true;
      this.error = '';

      const token = localStorage.getItem('token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      const productoData = {
        nombre: this.productoForm.value.nombre,
        descripcion: this.productoForm.value.descripcion || null,
        precio: parseFloat(this.productoForm.value.precio) || 0,
        stock_actual: parseInt(this.productoForm.value.stock_actual),
        stock_minimo: parseInt(this.productoForm.value.stock_minimo)
      };

      console.log('Actualizando productoData:', productoData); // Debug para verificar datos

      this.http.put(`http://localhost:3000/api/productos/${this.producto.id}`, productoData, { headers })
        .subscribe({
          next: (response: any) => {
            this.loading = false;
            if (response.success) {
              this.productoActualizado.emit();
            } else {
              this.error = response.message || 'Error al actualizar el producto';
            }
          },
          error: (err) => {
            this.loading = false;
            this.error = err.error?.message || 'Error al conectar con el servidor';
          }
        });
    } else {
      this.error = 'Por favor completa todos los campos correctamente';
    }
  }

  cancelar() {
    this.cancelarEdicion.emit();
  }

  getFieldError(fieldName: string): string {
    const field = this.productoForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName} es requerido`;
    }
    if (field?.hasError('minlength')) {
      return `Mínimo ${field.errors?.['minlength'].requiredLength} caracteres`;
    }
    if (field?.hasError('min')) {
      if (fieldName === 'precio') {
        return 'El precio debe ser mayor a 0';
      }
      return 'El valor debe ser mayor o igual a 0';
    }
    return '';
  }
}
