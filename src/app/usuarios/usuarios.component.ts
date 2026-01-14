import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent implements OnInit {
  usuarios: any[] = [];
  loading = false;
  error = '';
  success = '';
  mostrarFormulario = false;
  usuarioForm: FormGroup;
  editando = false;
  usuarioIdEditando: number | null = null;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    this.usuarioForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      correo: ['', [Validators.required, Validators.email]],
      password: [''],
      rol: ['VENDEDOR']
    });
  }

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.loading = true;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Usar endpoint real de usuarios
    this.http.get(`${environment.apiUrl}/usuarios`, { headers })
      .subscribe({
        next: (response: any) => {
          this.loading = false;
          if (response.success) {
            this.usuarios = response.data;
          } else {
            this.error = response.message || 'Error al cargar usuarios';
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
    if (!this.mostrarFormulario) {
      this.resetFormulario();
    }
  }

  resetFormulario() {
    this.usuarioForm.reset({
      nombre: '',
      correo: '',
      password: '',
      rol: 'VENDEDOR'
    });
    this.editando = false;
    this.usuarioIdEditando = null;
  }

  editarUsuario(usuario: any) {
    this.editando = true;
    this.usuarioIdEditando = usuario.id;
    this.usuarioForm.patchValue({
      nombre: usuario.nombre,
      correo: usuario.correo,
      password: '',
      rol: usuario.rol
    });
    this.mostrarFormulario = true;
  }

  guardarUsuario() {
    if (this.usuarioForm.valid) {
      this.loading = true;
      this.error = '';
      this.success = '';

      const token = localStorage.getItem('token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      const usuarioData = this.usuarioForm.value;

      if (this.editando && this.usuarioIdEditando) {
        // Actualizar usuario existente
        this.http.put(`${environment.apiUrl}/usuarios/${this.usuarioIdEditando}`, usuarioData, { headers })
          .subscribe({
            next: (response: any) => {
              this.loading = false;
              if (response.success) {
                this.success = 'Usuario actualizado exitosamente';
                this.resetFormulario();
                this.mostrarFormulario = false;
                this.cargarUsuarios();
              } else {
                this.error = response.message || 'Error al actualizar usuario';
              }
            },
            error: (err) => {
              this.loading = false;
              this.error = err.error?.message || 'Error al conectar con el servidor';
            }
          });
      } else {
        // Usar endpoint de usuarios para crear nuevo usuario
        this.http.post(`${environment.apiUrl}/usuarios`, usuarioData, { headers })
          .subscribe({
            next: (response: any) => {
              this.loading = false;
              if (response.success) {
                this.success = 'Usuario creado exitosamente';
                this.resetFormulario();
                this.mostrarFormulario = false;
                this.cargarUsuarios();
              } else {
                this.error = response.message || 'Error al crear usuario';
              }
            },
            error: (err) => {
              this.loading = false;
              this.error = err.error?.message || 'Error al conectar con el servidor';
            }
          });
      }
    }
  }


  eliminarUsuario(usuario: any) {
    if (confirm(`¿Estás seguro de eliminar al usuario ${usuario.nombre}?`)) {
      this.loading = true;
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      // Usar endpoint real para eliminar usuario
      this.http.delete(`${environment.apiUrl}/usuarios/${usuario.id}`, { headers })
        .subscribe({
          next: (response: any) => {
            this.loading = false;
            if (response.success) {
              this.success = 'Usuario eliminado exitosamente';
              this.cargarUsuarios();
            } else {
              this.error = response.message || 'Error al eliminar usuario';
            }
          },
          error: (err) => {
            this.loading = false;
            this.error = err.error?.message || 'Error al conectar con el servidor';
          }
        });
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.usuarioForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName} es requerido`;
    }
    if (field?.hasError('minlength')) {
      return `Mínimo ${field.errors?.['minlength'].requiredLength} caracteres`;
    }
    if (field?.hasError('email')) {
      return 'Email inválido';
    }
    return '';
  }
}
