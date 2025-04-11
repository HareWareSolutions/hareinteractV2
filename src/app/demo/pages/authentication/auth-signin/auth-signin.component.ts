import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-signin',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule,RouterModule], // ✅ Importando ReactiveFormsModule
  templateUrl: './auth-signin.component.html',
  styleUrls: ['./auth-signin.component.scss']
})
export default class AuthSigninComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(private authService: AuthService, private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      // email: ['ramirez@teste.com.br', [Validators.required, Validators.email]],
      // senha: ['teste@123', Validators.required]
      email: ['', [Validators.required, Validators.email]],
      senha: ['', Validators.required]
    });
  }

  onSubmit() {
    // console.log("Tentando fazer login...");
  
    if (this.loginForm.invalid) {
      // console.log("Formulário inválido!");
      return;
    }
  
    const { email, senha } = this.loginForm.value;
    // console.log("Dados do formulário:", email, senha);
    
    this.authService.login(email, senha).subscribe({
      next: () => {
        // console.log("Login bem-sucedido!");
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        // console.error("Erro ao fazer login:", error);
        this.errorMessage = 'Login inválido. Verifique suas credenciais.';
      }
    });
  }
  
}
