import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'datta-able';

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    // Redirecionamento manual se estiver na rota raiz "/"
    if (this.router.url === '/' || this.router.url === '') {
      if (this.authService.isAuthenticated()) {
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/auth/login']);
      }
    }

    // Mantém o comportamento de scroll
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) return;
      window.scrollTo(0, 0);
    });
  }
}
