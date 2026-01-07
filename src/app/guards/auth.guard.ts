import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const token = this.authService.getToken();
    const currentUser = this.authService.getCurrentUser();
    
    console.log('AuthGuard - Token:', token ? 'exists' : 'missing');
    console.log('AuthGuard - Current User:', currentUser ? 'exists' : 'missing');
    
    if (token && currentUser) {
      return true;
    } else {
      console.log('AuthGuard - Redirecting to login');
      this.router.navigate(['/login']);
      return false;
    }
  }
}
