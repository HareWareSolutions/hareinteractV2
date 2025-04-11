// angular import
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';

@Component({
  selector: 'app-nav-logo',
  templateUrl: './nav-logo.component.html',
  styleUrls: ['./nav-logo.component.scss']
})
export class NavLogoComponent implements OnInit {
  @Input() navCollapsed: boolean;
  @Output() NavCollapse = new EventEmitter();
  windowWidth = window.innerWidth;

  nomeEmpresa: string = 'EMPRESA';
  logoPath: string = 'assets/logo/default.png';

  ngOnInit(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.nomeEmpresa = user.empresa || 'EMPRESA';
        this.logoPath = `assets/logo/${user.empresa.toLowerCase()}.png`;
      } catch (error) {
        console.error('Erro ao ler usuário do localStorage:', error);
      }
    }
  }

  navCollapse() {
    if (this.windowWidth >= 992) {
      this.navCollapsed = !this.navCollapsed;
      this.NavCollapse.emit();
    }
  }
}
