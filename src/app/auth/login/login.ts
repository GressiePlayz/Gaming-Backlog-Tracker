import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Auth } from '../auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private fb = new FormBuilder();
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    rememberMe: [false]
  });

  errorMessage = signal<string | null>(null);

  constructor(private authService: Auth) {}

  onSubmit() {
    if (this.loginForm.valid) {
      this.errorMessage.set(null);
      const { email, password, rememberMe } = this.loginForm.value;
      this.authService.login(email!, password!, rememberMe!).subscribe({
        next: () => {
          // succes – redirecționare deja făcută în serviciu
        },
        error: (err) => {
          if (err.status === 401 || err.status === 400) {
            this.errorMessage.set('Email sau parolă incorecte! Dacă nu ai cont, înregistrează-te.');
          } else {
            this.errorMessage.set('Eroare de conectare la server. Încearcă din nou.');
          }
        }
      });
    }
  }
}