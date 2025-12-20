import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-registrar-producto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './registrar-producto.component.html',
  styleUrl: './registrar-producto.component.css'
})
export class RegistrarProductoComponent {
  @Output() productoCreado = new EventEmitter<void>();
  productoForm: FormGroup;
  loading = false;
  error = '';
  success = false;
  productoRegistrado: any = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    public router: Router
  ) {
    this.productoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      codigo: [''], // Opcional, se genera automáticamente
      descripcion: [''],
      stock_actual: [0, [Validators.required, Validators.min(0)]],
      stock_minimo: [0, [Validators.required, Validators.min(0)]]
    });
  }

  onSubmit() {
    if (this.productoForm.valid) {
      this.loading = true;
      this.error = '';
      this.success = false;

      const token = localStorage.getItem('token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      const productoData = {
        nombre: this.productoForm.value.nombre,
        descripcion: this.productoForm.value.descripcion || null,
        stock_actual: parseInt(this.productoForm.value.stock_actual),
        stock_minimo: parseInt(this.productoForm.value.stock_minimo)
        // codigo no se envía, se genera automáticamente en el backend
      };

      this.http.post('http://localhost:3000/api/productos', productoData, { headers })
        .subscribe({
          next: (response: any) => {
            this.loading = false;
            if (response.success) {
              this.success = true;
              this.productoRegistrado = response.data;
              this.error = ''; // Limpiar errores
              this.productoForm.reset({
                stock_actual: 0,
                stock_minimo: 0,
                descripcion: ''
              });
              // Emitir evento para notificar al componente padre
              setTimeout(() => {
                this.success = false;
                this.productoRegistrado = null;
                this.productoCreado.emit();
              }, 2000);
            } else {
              this.error = response.message || 'Error al registrar el producto';
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

  getFieldError(fieldName: string): string {
    const field = this.productoForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName} es requerido`;
    }
    if (field?.hasError('minlength')) {
      return `Mínimo ${field.errors?.['minlength'].requiredLength} caracteres`;
    }
    if (field?.hasError('min')) {
      return 'El valor debe ser mayor o igual a 0';
    }
    return '';
  }
}

