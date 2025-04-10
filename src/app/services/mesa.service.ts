import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MesaService {
  
  private apiUrl = 'http://192.168.99.102:5000/api'; // URL base da API

  constructor(private http: HttpClient) {}

  // Método para obter todas as mesas
  getMesas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/mesas`);
  }

  // Método para obter uma mesa específica
  getMesaById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/mesas/${id}`);
  }

  // Método para adicionar uma nova mesa
  addMesa(mesa: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/mesas`, mesa);
  }

  // Método para atualizar uma mesa existente
  updateMesa(id: string, mesa: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/mesas/${id}`, mesa);
  }

  // Método para deletar uma mesa
  deleteMesa(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/mesas/${id}`);
  }


  // Método para atualizar o status de uma mesa para "Finalizada"
  atualizarStatusMesa(id: string): Observable<any> {
    const url = `${this.apiUrl}/mesas/${id}/status`;  // A URL da sua API
    const body = { status: 'Finalizada' };  // Corpo da requisição com o status "Finalizada"
    return this.http.put(url, body);  // Requisição PUT para atualizar o status da mesa
  }


   // Método para atualizar o total de consumo de uma mesa
   atualizarTotalConsumo(idMesa: string, novoTotalConsumo: number): Observable<any> {
    const url = `${this.apiUrl}/mesas/${idMesa}`;
    const body = { totalConsumo: novoTotalConsumo };  // Corpo com o novo total consumido
    return this.http.put(url, body);  // Requisição PUT para atualizar
  }

}
