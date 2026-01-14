import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './configuracion.component.html',
  styleUrl: './configuracion.component.css'
})
export class ConfiguracionComponent implements OnInit {
  loading = false;
  error = '';
  success = '';
  
  // Formularios
  perfilForm: FormGroup;
  sistemaForm: FormGroup;
  notificacionesForm: FormGroup;
  
  // Datos del usuario actual
  usuarioActual: any = null;
  
  // Estado de los formularios
  activeTab = 'perfil';

  constructor(
    private http: HttpClient,
    private fb: FormBuilder
  ) {
    this.perfilForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      telefono: [''],
      direccion: ['']
    });

    this.sistemaForm = this.fb.group({
      nombre_empresa: ['', [Validators.required]],
      logo_url: [''],
      tema: ['light'],
      idioma: ['es'],
      formato_fecha: ['DD/MM/YYYY']
    });

    this.notificacionesForm = this.fb.group({
      email_alertas: [true],
      email_reportes: [true],
      email_bajo_stock: [true],
      notificaciones_push: [false],
      frecuencia_reportes: ['semanal']
    });
  }

  ngOnInit() {
    this.cargarConfiguracion();
  }

  cargarConfiguracion() {
    this.loading = true;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Cargar datos del usuario actual
    this.cargarUsuarioActual(headers);
    
    // Cargar configuración del sistema desde el backend
    this.http.get(`${environment.apiUrl}/configuracion`, { headers })
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            const config = response.data;
            // Mapear configuración a los formularios
            this.sistemaForm.patchValue({
              nombre_empresa: config.nombre_empresa?.valor || '',
              logo_url: config.logo_url?.valor || '',
              tema: config.tema?.valor || 'light',
              idioma: config.idioma?.valor || 'es',
              formato_fecha: config.formato_fecha?.valor || 'DD/MM/YYYY'
            });

            this.notificacionesForm.patchValue({
              email_alertas: config.email_alertas?.valor === 'true',
              email_reportes: config.email_reportes?.valor === 'true',
              email_bajo_stock: config.email_bajo_stock?.valor === 'true',
              notificaciones_push: config.notificaciones_push?.valor === 'true',
              frecuencia_reportes: config.frecuencia_reportes?.valor || 'semanal'
            });
          }
        },
        error: (err) => {
          console.error('Error cargando configuración:', err);
        }
      });
  }

  cargarUsuarioActual(headers: HttpHeaders) {
    // Obtener usuario del localStorage (ya que no hay endpoint específico)
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      this.usuarioActual = JSON.parse(userData);
      this.perfilForm.patchValue({
        nombre: this.usuarioActual.nombre || '',
        email: this.usuarioActual.email || '',
        username: this.usuarioActual.username || '',
        telefono: this.usuarioActual.telefono || '',
        direccion: this.usuarioActual.direccion || ''
      });
    }
    this.loading = false;
  }


  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  guardarPerfil() {
    if (this.perfilForm.valid) {
      this.loading = true;
      this.error = '';
      this.success = '';

      const token = localStorage.getItem('token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      const perfilData = this.perfilForm.value;

      // Simulación de actualización (en caso real sería un endpoint)
      this.simularActualizacionPerfil(perfilData);
    }
  }

  simularActualizacionPerfil(perfilData: any) {
    setTimeout(() => {
      // Actualizar datos en localStorage
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const updatedUser = { ...currentUser, ...perfilData };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      this.usuarioActual = updatedUser;
      this.success = 'Perfil actualizado exitosamente';
      this.loading = false;
    }, 1500);
  }

  guardarSistema() {
    if (this.sistemaForm.valid) {
      this.loading = true;
      this.error = '';
      this.success = '';

      const token = localStorage.getItem('token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      const sistemaData = this.sistemaForm.value;

      // Enviar configuración al backend
      this.http.put(`${environment.apiUrl}/configuracion`, sistemaData, { headers })
        .subscribe({
          next: (response: any) => {
            this.loading = false;
            if (response.success) {
              this.success = 'Configuración del sistema guardada exitosamente';
            } else {
              this.error = response.message || 'Error al guardar configuración';
            }
          },
          error: (err) => {
            this.loading = false;
            this.error = err.error?.message || 'Error al conectar con el servidor';
          }
        });
    }
  }

  guardarNotificaciones() {
    if (this.notificacionesForm.valid) {
      this.loading = true;
      this.error = '';
      this.success = '';

      const token = localStorage.getItem('token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      const notificacionesData = this.notificacionesForm.value;

      // Enviar configuración de notificaciones al backend
      this.http.put(`${environment.apiUrl}/configuracion`, notificacionesData, { headers })
        .subscribe({
          next: (response: any) => {
            this.loading = false;
            if (response.success) {
              this.success = 'Preferencias de notificación guardadas exitosamente';
            } else {
              this.error = response.message || 'Error al guardar preferencias';
            }
          },
          error: (err) => {
            this.loading = false;
            this.error = err.error?.message || 'Error al conectar con el servidor';
          }
        });
    }
  }

  probarConexion() {
    this.loading = true;
    this.error = '';
    this.success = '';

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Probar conexión con el backend
    this.http.get(`${environment.apiUrl}/health`, { headers })
      .subscribe({
        next: (response: any) => {
          this.loading = false;
          this.success = 'Conexión exitosa con el servidor';
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Error al conectar con el servidor';
        }
      });
  }

  limpiarCache() {
    if (confirm('¿Estás seguro de limpiar la caché local?')) {
      localStorage.clear();
      sessionStorage.clear();
      this.success = 'Caché limpiada exitosamente. Por favor, recarga la página.';
    }
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
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
