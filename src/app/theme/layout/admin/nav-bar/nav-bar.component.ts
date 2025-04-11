// project import
import { Component, EventEmitter, Output, OnInit } from '@angular/core';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {
  @Output() NavCollapsedMob = new EventEmitter();
  navCollapsedMob = false;
  headerStyle: string = '';
  menuClass: boolean = false;
  collapseStyle: string = 'none';

  nomeEmpresa: string = 'EMPRESA';
  logoPath: string = 'assets/logo/default.png';

  ngOnInit(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.nomeEmpresa = user.empresa || 'EMPRESA';

        console.log('NOME DA EMPRESA', this.nomeEmpresa);
        
        this.logoPath = `assets/logo/${user.empresa.toLowerCase()}.png`;
      } catch (error) {
        console.error('Erro ao ler usuário do localStorage:', error);
      }
    }
  }

  toggleMobOption() {
    this.menuClass = !this.menuClass;
    this.headerStyle = this.menuClass ? 'none' : '';
    this.collapseStyle = this.menuClass ? 'block' : 'none';
  }
}
