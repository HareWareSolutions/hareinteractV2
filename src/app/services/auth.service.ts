import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, throwError, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://service-api.hareinteract.com.br/logar-leads';

  constructor(private http: HttpClient) {}

  login(email: string, senha: string): Observable<any> {
    const url = `${this.apiUrl}?usuario=${encodeURIComponent(email)}&senha=${encodeURIComponent(senha)}`;

    return this.http.post<any>(url, {}).pipe(
      map(response => {
        if (response && response.id) {
          localStorage.setItem('user', JSON.stringify(response));
          return response; // tudo certo
        } else {
          throw new Error('Credenciais inválidas');
        }
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  isAuthenticated(): boolean {
    return localStorage.getItem('user') !== null;
  }

  getUser(): any {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  logout(): void {
    localStorage.removeItem('user');
  }
}
