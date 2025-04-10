import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const isAuthenticated = this.authService.isAuthenticated();
    console.log('🔍 AuthGuard | isAuthenticated:', isAuthenticated);

    if (!isAuthenticated) {
      console.warn("⛔ Acesso negado: Redirecionando para login...");
      this.router.navigate(['/auth/login']);
      return false;
    }
    
    return true;
  }
}
