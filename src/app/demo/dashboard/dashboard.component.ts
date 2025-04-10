import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { LeadService } from '../../services/lead.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export default class DashboardComponent implements OnInit {
  usuario: any = null;
  parametros: any[] = [];
  mostrarModal: boolean = false;
  leads: any[] = [];
  leadSelecionado: any = null;
  filtroBusca: string = '';
  modoEdicao: boolean = false;

  nomesObservacoes: { [key: string]: string } = {};

  leadModelo = {
    id: null,
    empresa: '',
    nome: '',
    numero_celular: '',
    email: '',
    pausado: false,
    observacao1: '', ativoObservacao1: false,
    observacao2: '', ativoObservacao2: false,
    observacao3: '', ativoObservacao3: false,
    observacao4: '', ativoObservacao4: false,
    observacao5: '', ativoObservacao5: false,
    lembrete: 'N/A'
  };
  
  constructor(private authService: AuthService, private leadService: LeadService) {}

  ngOnInit(): void {
    this.carregarDadosUsuario();
    this.carregarLeads();
  }

  // Getter que retorna os leads filtrados
  get leadsFiltrados() {
    if (!this.filtroBusca) return this.leads;

    const termo = this.filtroBusca.toLowerCase();
    return this.leads.filter(lead =>
      lead.nome?.toLowerCase().includes(termo) ||
      String(lead.id).includes(termo)
    );
  }

  formatarTelefone(): void {
    if (!this.leadSelecionado?.numero_celular) return;
  
    // Remove tudo que não for número
    let numero = this.leadSelecionado.numero_celular.replace(/\D/g, '');
  
    // Remove o DDI se já estiver (só para evitar duplicar)
    if (numero.startsWith('55')) {
      numero = numero.substring(2);
    }
  
    // Limita a 11 dígitos após o DDI
    numero = numero.substring(0, 11);
  
    let formatado = '';
  
    if (numero.length <= 10) {
      formatado = numero.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else {
      formatado = numero.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
  
    this.leadSelecionado.numero_celular = `+55 ${formatado}`.trim();
  }
  
  



  abrirModal(acao: number, lead: any = null): void {
    if (acao === 2 && lead) {

    
        // Buscar lead pelo ID e preencher os dados corretamente
        this.leadService.buscarLeadPorId(lead.id, this.usuario.empresa).subscribe({
          next: (res) => {
            console.log("🔎 Lead BUSCADO PELO ID:", res.retorno);
            
            this.modoEdicao = true;

            this.leadSelecionado = {
              ...this.leadModelo, // Mantém a estrutura base
              id: res.retorno.id || null,
              empresa: this.usuario.empresa,
              nome: res.retorno.nome || '',
              numero_celular: res.retorno.telefone || '55 ',
              email: res.retorno.email || '',
              pausado: res.retorno.pausa || false,
              observacao1: res.retorno.observacao_1 || '',
              ativoObservacao1: !!res.retorno.observacao_1, 
              observacao2: res.retorno.observacao_2 || '',
              ativoObservacao2: !!res.retorno.observacao_2, 
              observacao3: res.retorno.observacao_3 || '',
              ativoObservacao3: !!res.retorno.observacao_3, 
              observacao4: res.retorno.observacao_4 || '',
              ativoObservacao4: !!res.retorno.observacao_4, 
              observacao5: res.retorno.observacao_5 || '',
              ativoObservacao5: !!res.retorno.observacao_5, 
              lembrete: res.retorno.lembrete || 'N/A',
            };
    
            this.mostrarModal = true;
          },
          error: (err) => console.error("❌ Erro ao buscar lead:", err)
        });
     
    } else {

      this.modoEdicao = false;
       // Adicionar novo lead: usa o modelo fixo e define a empresa
       this.leadSelecionado = { ...this.leadModelo, empresa: this.usuario.empresa };
       this.mostrarModal = true;
    }
  }
  

  fecharModal(): void {
    this.mostrarModal = false;
    this.leadSelecionado = null;
  }

  carregarDadosUsuario(): void {
    this.usuario = this.authService.getUser();
    if (this.usuario) {
      console.log('📌 Usuário logado:', this.usuario);
      this.parametros = this.usuario.parametros || [];

      console.log('PARAMETROS CARREGADOS ',this.parametros)



      // Monta os nomes fixos das observações
      this.nomesObservacoes = {
        observacao1: this.buscarNome('observacao1'),
        observacao2: this.buscarNome('observacao2'),
        observacao3: this.buscarNome('observacao3'),
        observacao4: this.buscarNome('observacao4'),
        observacao5: this.buscarNome('observacao5')
      };



    }
  }


  private buscarNome(titulo: string): string {
    const campo = this.parametros.find(p => p.Titulo === titulo);
    return campo?.["Observação/Nome do campo"]?.trim() || this.formatarTitulo(titulo);
  }
  
  private formatarTitulo(titulo: string): string {
    return titulo.replace('observacao', 'Observação ');
  }

  carregarLeads(): void {
    if (!this.usuario?.empresa) return;

    this.leadService.visualizarContatos(this.usuario.empresa).subscribe({
      next: (res) => {
        this.leads = res.retorno || [];
        console.log('✅ Leads carregados:', this.leads);
      },
      error: (err) => console.error('❌ Erro ao carregar leads:', err)
    });
  }

  
  salvarLead(): void {
    if (!this.leadSelecionado) return;

    const numeroLimpo = this.leadSelecionado.numero_celular.replace(/\D/g, '');
  
    const leadParaEnvio = {
      id: Number(this.leadSelecionado.id), // Garante que seja número
      empresa: this.leadSelecionado.empresa,
      nome: this.leadSelecionado.nome,
      numero_celular: numeroLimpo, // Converte para string
      email: this.leadSelecionado.email || null,
      pausa: !!this.leadSelecionado.pausado, // Garante booleano
      observacao1: this.leadSelecionado.observacao1 || null,
      observacao2: this.leadSelecionado.observacao2 || null,
      observacao3: this.leadSelecionado.observacao3 || null,
      observacao4: this.leadSelecionado.observacao4 || null,
      observacao5: this.leadSelecionado.observacao5 || null,
      lembrete: this.leadSelecionado.lembrete || null
    };
  
    console.log("🔍 Enviando lead atualizado:", leadParaEnvio);
  
    if (this.leadSelecionado.id) {
      this.leadService.editarLead(leadParaEnvio).subscribe({
        next: (res) => {
          console.log("✅ Lead atualizado com sucesso:", res);
          this.fecharModal();
          this.carregarLeads();
        },
        error: (err) => {
          console.error("❌ Erro ao atualizar lead:", err);
          if (err.error) console.error("📌 Detalhes do erro:", err.error);
        }
      });
    } else {
      this.leadService.cadastrarLead(leadParaEnvio).subscribe({
        next: () => {
          this.fecharModal();
          this.carregarLeads();
        },
        error: (err) => console.error("❌ Erro ao cadastrar lead:", err)
      });
    }
  }
  
  
  excluirLead(id: number): void {
    if (!this.usuario?.empresa) return;
    if (!confirm('Tem certeza que deseja excluir este lead?')) return;
  
    this.leadService.removerLead(id.toString(), this.usuario.empresa).subscribe({
      next: () => {
        console.log('🗑 Lead excluído com sucesso');
        this.carregarLeads();
      },
      error: (err) => console.error('❌ Erro ao excluir lead:', err)
    });
  }


  onTogglePausa(lead: any): void {
    const leadParaEnvio = {
      id: Number(lead.id),
      empresa: this.usuario.empresa,
      nome: lead.nome,
      numero_celular: String(lead.numero_celular),
      email: lead.email || null,
      pausa: !lead.pausa,
      observacao1: lead.observacao1 || null,
      observacao2: lead.observacao2 || null,
      observacao3: lead.observacao3 || null,
      observacao4: lead.observacao4 || null,
      observacao5: lead.observacao5 || null,
      lembrete: lead.lembrete || null
    };
  
    this.leadService.editarLead(leadParaEnvio).subscribe({
      next: () => {
        lead.pausa = !lead.pausa; // atualiza na tabela
        console.log("✅ Pausa atualizada com sucesso");
      },
      error: (err) => {
        console.error("❌ Erro ao atualizar pausa:", err);
      }
    });
  }
  
  
  
}
