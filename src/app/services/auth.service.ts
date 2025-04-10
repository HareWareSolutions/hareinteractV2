import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://service-api.hareinteract.com.br/logar-leads';

  constructor(private http: HttpClient) {}

  login(email: string, senha: string): Observable<any> {
    const url = `${this.apiUrl}?usuario=${encodeURIComponent(email)}&senha=${encodeURIComponent(senha)}`;

    return this.http.post(url, {}).pipe(
      tap(response => {
        if (response && response.id) { // Valida se a resposta contém um ID (usuário válido)
          console.log("✅ Login bem-sucedido:", response);
          localStorage.setItem('user', JSON.stringify(response)); // Salva os dados do usuário
        } else {
          console.warn("⚠ Login falhou: resposta inválida", response);
        }
      })
    );
  }

  isAuthenticated(): boolean {
    const user = localStorage.getItem('user');
    console.log("🔍 Verificando autenticação... Usuário:", user);
    return user !== null; // Retorna `true` se houver um usuário salvo
  }

  getUser(): any {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  logout(): void {
    console.log("🚪 Saindo...");
    localStorage.removeItem('user');
  }
}
