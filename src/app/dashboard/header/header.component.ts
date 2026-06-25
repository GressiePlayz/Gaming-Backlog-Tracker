import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '../../auth/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="header-banner">
      <h2>{{ title() }}</h2>
      <div class="header-actions">
        <button (click)="onRefresh()" class="refresh-btn">🔄 Sincronizează</button>
        <button (click)="logout()" class="logout-btn">🚪 Deconectare</button>
      </div>
    </header>
  `,
  styles: [`
    .header-banner { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; background: #1f1f1f; color: white; border-radius: 8px; margin-bottom: 20px; }
    .header-actions { display: flex; gap: 10px; }
    button { padding: 8px 14px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; transition: opacity 0.2s; }
    button:hover { opacity: 0.85; }
    .refresh-btn { background: #1890ff; color: white; }
    .logout-btn { background: #ff4d4f; color: white; }
  `]
})
export class HeaderComponent {
  
  title = input<string>('Dashboard');

  
  refreshData = output<void>();

  constructor(private authService: Auth) {}

  onRefresh() {
    this.refreshData.emit();
  }

  logout() {
    this.authService.logout();
  }
}