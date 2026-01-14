import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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
      precio: [0, [Validators.required]],
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

      console.log('Form values:', this.productoForm.value);
      console.log('Precio value:', this.productoForm.value.precio);
      console.log('Parsed precio:', parseFloat(this.productoForm.value.precio));

      const productoData = {
        nombre: this.productoForm.value.nombre,
        descripcion: this.productoForm.value.descripcion || null,
        precio: Number(this.productoForm.value.precio) || 0,
        stock_actual: parseInt(this.productoForm.value.stock_actual),
        stock_minimo: parseInt(this.productoForm.value.stock_minimo)
        // codigo no se envía, se genera automáticamente en el backend
      };

      console.log('Enviando productoData:', productoData); // Debug para verificar datos

      this.http.post(`${environment.apiUrl}/productos`, productoData, { headers })
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
                precio: 0,
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
      if (fieldName === 'precio') {
        return 'El precio debe ser mayor a 0';
      }
      return 'El valor debe ser mayor o igual a 0';
    }
    return '';
  }
}

