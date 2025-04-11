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

  campo1: boolean = false;
  campo2: boolean = false;
  campo3: boolean = false;
  campo4: boolean = false;
  campo5: boolean = false;

  nomesObservacoes: { [key: string]: string } = {};

  // Paginação
  paginaAtual: number = 1;
  itensPorPagina: number = 10;

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

  get leadsFiltrados() {
    if (!this.filtroBusca) return this.leads;
    const termo = this.filtroBusca.toLowerCase();
    return this.leads.filter(lead =>
      lead.nome?.toLowerCase().includes(termo) || String(lead.id).includes(termo)
    );
  }

  get leadsPaginados() {
    const start = (this.paginaAtual - 1) * this.itensPorPagina;
    const end = start + this.itensPorPagina;
    return this.leadsFiltrados.slice(start, end);
  }

  get inicioPaginado(): number {
    return (this.paginaAtual - 1) * this.itensPorPagina + 1;
  }

  get fimPaginado(): number {
    return Math.min(this.paginaAtual * this.itensPorPagina, this.leadsFiltrados.length);
  }

  formatarTelefone(): void {
    if (!this.leadSelecionado?.numero_celular) return;
    let numero = this.leadSelecionado.numero_celular.replace(/\D/g, '');
    if (numero.startsWith('55')) {
      numero = numero.substring(2);
    }
    numero = numero.substring(0, 11);
    let formatado = '';
    if (numero.length <= 10) {
      formatado = numero.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else {
      formatado = numero.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
    this.leadSelecionado.numero_celular = `+55 ${formatado}`.trim();
  }

  formatarCelularParaExibicao(numero: string): string {
    if (!numero) return '';
    let limpo = numero.replace(/\D/g, '');
    if (limpo.startsWith('55')) limpo = limpo.slice(2);
    if (limpo.length === 11) {
      return `+55 (${limpo.slice(0, 2)}) ${limpo.slice(2, 7)}-${limpo.slice(7)}`;
    }
    if (limpo.length === 10) {
      return `+55 (${limpo.slice(0, 2)}) ${limpo.slice(2, 6)}-${limpo.slice(6)}`;
    }
    return `+55 ${numero}`;
  }

  abrirModal(acao: number, lead: any = null): void {
    if (acao === 2 && lead) {
      this.leadService.buscarLeadPorId(lead.id, this.usuario.empresa).subscribe({
        next: (res) => {
          this.modoEdicao = true;
          this.leadSelecionado = {
            ...this.leadModelo,
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
      this.parametros = this.usuario.parametros || [];
      this.nomesObservacoes = {
        observacao1: this.buscarNome('observacao1'),
        observacao2: this.buscarNome('observacao2'),
        observacao3: this.buscarNome('observacao3'),
        observacao4: this.buscarNome('observacao4'),
        observacao5: this.buscarNome('observacao5')
      };
      this.campo1 = this.verificarAtivo('observacao1');
      this.campo2 = this.verificarAtivo('observacao2');
      this.campo3 = this.verificarAtivo('observacao3');
      this.campo4 = this.verificarAtivo('observacao4');
      this.campo5 = this.verificarAtivo('observacao5');
    }
  }

  verificarAtivo(titulo: string): boolean {
    const parametro = this.parametros.find(p => p.Titulo === titulo);
    return parametro?.Ativo === true || parametro?.Ativo === 'true';
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
      },
      error: (err) => console.error('❌ Erro ao carregar leads:', err)
    });
  }

  salvarLead(): void {
    if (!this.leadSelecionado) return;
    const numeroLimpo = this.leadSelecionado.numero_celular.replace(/\D/g, '');
    const leadParaEnvio = {
      id: Number(this.leadSelecionado.id),
      empresa: this.leadSelecionado.empresa,
      nome: this.leadSelecionado.nome,
      numero_celular: numeroLimpo,
      email: this.leadSelecionado.email || null,
      pausa: !!this.leadSelecionado.pausado,
      observacao1: this.leadSelecionado.observacao1 || null,
      observacao2: this.leadSelecionado.observacao2 || null,
      observacao3: this.leadSelecionado.observacao3 || null,
      observacao4: this.leadSelecionado.observacao4 || null,
      observacao5: this.leadSelecionado.observacao5 || null,
      lembrete: this.leadSelecionado.lembrete || null
    };
    if (this.leadSelecionado.id) {
      this.leadService.editarLead(leadParaEnvio).subscribe({
        next: () => {
          this.fecharModal();
          this.carregarLeads();
        },
        error: (err) => console.error("❌ Erro ao atualizar lead:", err)
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
      next: () => this.carregarLeads(),
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
        lead.pausa = !lead.pausa;
      },
      error: (err) => console.error("❌ Erro ao atualizar pausa:", err)
    });
  }

  isHoje(data: string): boolean {
    const hoje = new Date();
    const hojeFormatado = hoje.toLocaleDateString('en-CA');
    return data === hojeFormatado;
  }

  mudarPagina(novaPagina: number): void {
    this.paginaAtual = novaPagina;
  }
}
