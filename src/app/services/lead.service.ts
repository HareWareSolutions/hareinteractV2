import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LeadService {

  private apiBaseUrl = 'https://service-api.hareinteract.com.br';

  constructor(private http: HttpClient) {}

  /**
   * Cadastrar Lead
   * @param dados Objeto contendo os dados do lead
   */
  cadastrarLead(dados: any): Observable<any> {
    let params = new HttpParams();
    Object.keys(dados).forEach(key => {
      if (dados[key] !== null && dados[key] !== undefined) {
        params = params.append(key, dados[key]);
      }
    });

    return this.http.post(`${this.apiBaseUrl}/cadastrar-contato`, {}, { params });
  }


  /**
   * Visualizar contatos de uma empresa
   * @param empresa Nome da empresa
   */
  
  visualizarContatos(empresa: string): Observable<any> {
    let params = new HttpParams().set('empresa', empresa);
    return this.http.post(`${this.apiBaseUrl}/visualizar-contatos`, {}, { params });
  }


  editarLead(dados: any): Observable<any> {
    let params = new HttpParams();
    Object.keys(dados).forEach(key => {
      if (dados[key] !== null && dados[key] !== undefined) {
        params = params.append(key, dados[key]);
      }
    });

    // console.log("Enviando os seguintes parâmetros:", params.toString()); // Debug para ver os dados enviados
    
    return this.http.post(`${this.apiBaseUrl}/editar-contato-lead`, {}, { params });
  }
  

removerLead(id: string, empresa: string): Observable<any> {
  const params = new HttpParams()
    .set('id', id)
    .set('empresa', empresa);

  return this.http.post(`${this.apiBaseUrl}/excluir-contato`, null, { params });
}


  
  buscarLeadPorId(id_contato: number, empresa: string): Observable<any> {
    let params = new HttpParams()
      .set("id_contato", id_contato.toString())
      .set("empresa", empresa);

    return this.http.post(`${this.apiBaseUrl}/dados-contato-lead`, {}, { params });
  }


}
