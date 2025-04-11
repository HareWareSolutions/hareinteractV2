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

  campo1 = false;
  campo2 = false;
  campo3 = false;
  campo4 = false;
  campo5 = false;

  nomesObservacoes: { [key: string]: string } = {};

  // Paginação
  paginaAtual: number = 1;
  itensPorPagina: number = 10;
  totalPaginas: number = 0;
  paginas: number[] = [];

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

  get leadsFiltrados(): any[] {
    let filtrados = this.leads;

    if (this.filtroBusca) {
      const termo = this.filtroBusca.toLowerCase();
      filtrados = this.leads.filter(lead =>
        lead.nome?.toLowerCase().includes(termo) ||
        String(lead.id).includes(termo)
      );
    }

    this.totalPaginas = Math.ceil(filtrados.length / this.itensPorPagina);
    this.paginas = Array.from({ length: this.totalPaginas }, (_, i) => i + 1);

    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    return filtrados.slice(inicio, inicio + this.itensPorPagina);
  }

  mudarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaAtual = pagina;
    }
  }

  formatarTelefone(): void {
    if (!this.leadSelecionado?.numero_celular) return;
    let numero = this.leadSelecionado.numero_celular.replace(/\D/g, '');
    if (numero.startsWith('55')) numero = numero.substring(2);
    numero = numero.substring(0, 11);
    let formatado = numero.length <= 10
      ? numero.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
      : numero.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    this.leadSelecionado.numero_celular = `+55 ${formatado}`.trim();
  }

  formatarCelularParaExibicao(numero: string): string {
    if (!numero) return '';
    let limpo = numero.replace(/\D/g, '');
    if (limpo.startsWith('55')) limpo = limpo.slice(2);
    return limpo.length === 11
      ? `+55 (${limpo.slice(0, 2)}) ${limpo.slice(2, 7)}-${limpo.slice(7)}`
      : limpo.length === 10
      ? `+55 (${limpo.slice(0, 2)}) ${limpo.slice(2, 6)}-${limpo.slice(6)}`
      : `+55 ${numero}`;
  }

  abrirModal(acao: number, lead: any = null): void {
    this.modoEdicao = acao === 2 && !!lead;
    if (this.modoEdicao) {
      this.leadService.buscarLeadPorId(lead.id, this.usuario.empresa).subscribe({
        next: (res) => {
          const r = res.retorno;
          this.leadSelecionado = {
            ...this.leadModelo,
            id: r.id || null,
            empresa: this.usuario.empresa,
            nome: r.nome || '',
            numero_celular: r.telefone || '55 ',
            email: r.email || '',
            pausado: r.pausa || false,
            observacao1: r.observacao_1 || '',
            ativoObservacao1: !!r.observacao_1,
            observacao2: r.observacao_2 || '',
            ativoObservacao2: !!r.observacao_2,
            observacao3: r.observacao_3 || '',
            ativoObservacao3: !!r.observacao_3,
            observacao4: r.observacao_4 || '',
            ativoObservacao4: !!r.observacao_4,
            observacao5: r.observacao_5 || '',
            ativoObservacao5: !!r.observacao_5,
            lembrete: r.lembrete || 'N/A',
          };
          this.mostrarModal = true;
        },
        error: (err) => console.error("❌ Erro ao buscar lead:", err)
      });
    } else {
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
        observacao5: this.buscarNome('observacao5'),
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
        this.paginaAtual = 1;
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

    const observable = this.leadSelecionado.id
      ? this.leadService.editarLead(leadParaEnvio)
      : this.leadService.cadastrarLead(leadParaEnvio);

    observable.subscribe({
      next: () => {
        this.fecharModal();
        this.carregarLeads();
      },
      error: (err) => console.error("❌ Erro ao salvar lead:", err)
    });
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
      next: () => (lead.pausa = !lead.pausa),
      error: (err) => console.error("❌ Erro ao atualizar pausa:", err)
    });
  }

  isHoje(data: string): boolean {
    const hoje = new Date().toISOString().split('T')[0];
    return data === hoje;
  }
}
