// src/app/services/vendas.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root',
})

export class VendasService {

  private apiUrl = 'http://192.168.99.102:5000/api'; // URL base da API

  constructor(private http: HttpClient) {}

  // Método para adicionar uma nova venda
  addVenda(venda: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/vendas`, venda);
  }

   // Método para listar todas as vendas
   getVendas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/vendas`);
  }

  // 🔥 Método para atualizar uma venda
  updateVenda(venda: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/vendas/${venda.id_venda}`, venda);
  }


  
}
