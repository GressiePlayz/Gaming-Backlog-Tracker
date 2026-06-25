import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Auth } from '../auth';

function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value || '';
  const hasUpperCase = /[A-Z]/.test(value);
  const hasLowerCase = /[a-z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(value);
  const isValid = value.length >= 6 && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
  return isValid ? null : { passwordStrength: true };
}

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordsMismatch: true };
}

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  private fb = new FormBuilder();
  registerForm = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, passwordStrengthValidator]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: passwordsMatchValidator });

  errorMessage = signal<string | null>(null);

  constructor(private authService: Auth) {}

  onSubmit() {
    if (this.registerForm.valid) {
      this.errorMessage.set(null);
      const { email, password, firstName, lastName } = this.registerForm.value;
      this.authService.register(email!, password!, firstName!, lastName!).subscribe({
        next: () => {
          // succes – userul e deja logat și redirecționat în dashboard din Auth.register()
        },
        error: (err) => {
          this.errorMessage.set(err.message || 'Eroare la înregistrare. Încearcă din nou.');
        }
      });
    }
  }
}