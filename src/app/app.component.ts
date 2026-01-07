import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'Inventory Dashboard';
  isUserMenuOpen = false;
  isSidebarOpen = false;

  constructor(
    public router: Router,
    public authService: AuthService
  ) {}

  ngOnInit() {
    // Si no está autenticado y no está en login, redirigir al login
    if (!this.authService.isAuthenticated() && this.router.url !== '/login') {
      this.router.navigate(['/login']);
    }

    // Cerrar menú al hacer click fuera
    document.addEventListener('click', (event: any) => {
      if (!event.target.closest('.user-info-container')) {
        this.isUserMenuOpen = false;
      }
      
      // Cerrar sidebar al hacer click fuera en móvil
      if (window.innerWidth <= 768 && !event.target.closest('.sidebar') && !event.target.closest('.menu-toggle')) {
        this.isSidebarOpen = false;
      }
    });

    // Cerrar sidebar al cambiar tamaño de ventana
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        this.isSidebarOpen = false;
      }
    });
  }

  get isLoginPage(): boolean {
    return this.router.url === '/login';
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }

  goToProfile() {
    this.isUserMenuOpen = false;
    // Aquí puedes agregar la navegación al perfil cuando lo implementes
    console.log('Ir a perfil');
  }

  logout() {
    this.isUserMenuOpen = false;
    this.authService.logout();
  }
}
