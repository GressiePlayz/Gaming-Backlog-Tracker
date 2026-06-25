import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './auth/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'login', 
    pathMatch: 'full' 
  },
  { 
    path: 'login', 
    // Încarcă din login.ts clasa Login
    loadComponent: () => import('./auth/login/login').then(m => m.Login),
    canActivate: [guestGuard]
  },
  { 
    path: 'register', 
    // Încarcă din register.ts clasa Register
    loadComponent: () => import('./auth/register/register').then(m => m.Register),
    canActivate: [guestGuard]
  },
  { 
    path: 'dashboard', 
    // Dashboard-ul tău are .component.ts în screenshot, deci rămâne așa:
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];