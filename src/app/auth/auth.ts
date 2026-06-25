import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../environment';

interface LocalUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private apiUrl = 'https://reqres.in/api';
  private currentUserKey = 'gaming_current_user';
  private localUsersKey = 'gaming_users';

  private headers = new HttpHeaders({
    'x-api-key': environment.reqresApiKey
  });

  constructor(private router: Router, private http: HttpClient) {}

  // Înregistrare: încearcă reqres.in, dacă respinge facem fallback local.
  // În AMBELE cazuri de succes, userul e logat automat și trimis în dashboard.
  register(email: string, password: string, firstName: string, lastName: string): Observable<{ source: 'api' | 'local' }> {
    return this.http.post(`${this.apiUrl}/register`, { email, password }, { headers: this.headers }).pipe(
      map(() => {
        this.saveLocalUser({ email, password, firstName, lastName });
        this.setSession(email, true);
        this.router.navigate(['/dashboard']);
        return { source: 'api' as const };
      }),
      catchError(() => {
        const users = this.getLocalUsers();
        if (users.some(u => u.email === email)) {
          return throwError(() => ({ status: 409, message: 'Există deja un cont cu acest email. Te poți autentifica direct.' }));
        }
        this.saveLocalUser({ email, password, firstName, lastName });
        this.setSession(email, true);
        this.router.navigate(['/dashboard']);
        return of({ source: 'local' as const });
      })
    );
  }

  // Login: încearcă reqres.in, dacă respinge verificăm contul local salvat la register.
  login(email: string, password: string, rememberMe: boolean): Observable<{ source: 'api' | 'local' }> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, { email, password }, { headers: this.headers }).pipe(
      map(() => {
        this.setSession(email, rememberMe);
        this.router.navigate(['/dashboard']);
        return { source: 'api' as const };
      }),
      catchError((err) => {
        const localMatch = this.getLocalUsers().find(u => u.email === email && u.password === password);
        if (localMatch) {
          this.setSession(email, rememberMe);
          this.router.navigate(['/dashboard']);
          return of({ source: 'local' as const });
        }
        return throwError(() => err);
      })
    );
  }

  private saveLocalUser(user: LocalUser) {
    if (typeof window === 'undefined') return;
    const users = this.getLocalUsers();
    if (!users.some(u => u.email === user.email)) {
      users.push(user);
      localStorage.setItem(this.localUsersKey, JSON.stringify(users));
    }
  }

  private getLocalUsers(): LocalUser[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(this.localUsersKey);
    return data ? JSON.parse(data) : [];
  }

  private setSession(email: string, rememberMe: boolean) {
    if (typeof window === 'undefined') return;
    const sessionData = { email };
    if (rememberMe) {
      localStorage.setItem(this.currentUserKey, JSON.stringify(sessionData));
    } else {
      sessionStorage.setItem(this.currentUserKey, JSON.stringify(sessionData));
    }
  }

  isLoggedIn(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(localStorage.getItem(this.currentUserKey) || sessionStorage.getItem(this.currentUserKey));
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.currentUserKey);
      sessionStorage.removeItem(this.currentUserKey);
    }
    this.router.navigate(['/login']);
  }

  getCurrentUser(): any {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(this.currentUserKey) || sessionStorage.getItem(this.currentUserKey);
    return data ? JSON.parse(data) : null;
  }
}