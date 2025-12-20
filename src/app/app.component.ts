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
    });
  }

  get isLoginPage(): boolean {
    return this.router.url === '/login';
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
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
