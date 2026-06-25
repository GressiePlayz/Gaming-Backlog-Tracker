import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HeaderComponent } from './header/header.component';

import { NzTableModule } from 'ng-zorro-antd/table';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzButtonModule } from 'ng-zorro-antd/button';

import confetti from 'canvas-confetti';

interface Game {
  id: number;
  title: string;
  platform: string;
  progress: number;
  hours: number;
  status: 'Backlog' | 'În Desfășurare' | 'Finalizat';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderComponent,
    NzTableModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzInputNumberModule,
    NzButtonModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  dashboardTitle = 'Gaming Backlog Tracker';

  games = signal<Game[]>(this.loadGamesFromStorage());
  searchQuery = signal<string>('');
  filteredGames = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.games();
    return this.games().filter(game =>
      game.title.toLowerCase().includes(query) ||
      game.platform.toLowerCase().includes(query)
    );
  });

  isModalVisible = signal(false);
  modalTitle = signal('Adaugă Joc Nou');
  editingGameId = signal<number | null>(null);

  gameForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.gameForm = this.fb.group({
      title: ['', [Validators.required]],
      platform: ['PC', [Validators.required]],
      progress: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      hours: [0, [Validators.required, Validators.min(0)]],
      status: ['Backlog', [Validators.required]]
    });
  }

  // ===== localStorage =====
  private loadGamesFromStorage(): Game[] {
    if (typeof window === 'undefined') return this.getDefaultGames();
    const stored = localStorage.getItem('gaming_games');
    if (stored) {
      try { return JSON.parse(stored); } catch { return this.getDefaultGames(); }
    }
    return this.getDefaultGames();
  }

  private getDefaultGames(): Game[] {
    return [
      { id: 1, title: 'Sker Ritual', platform: 'PlayStation 5', progress: 90, hours: 45, status: 'În Desfășurare' },
      { id: 2, title: 'Call of Duty: Modern Warfare 3', platform: 'PC', progress: 100, hours: 120, status: 'Finalizat' },
      { id: 3, title: 'Wolfenstein 2009', platform: 'PC', progress: 10, hours: 2, status: 'Backlog' }
    ];
  }

  private saveGamesToStorage(games: Game[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gaming_games', JSON.stringify(games));
    }
  }

  // ===== Modal =====
  openAddModal() {
    this.editingGameId.set(null);
    this.modalTitle.set('Adaugă Joc Nou');
    this.gameForm.reset({ platform: 'PC', progress: 0, hours: 0, status: 'Backlog' });
    this.isModalVisible.set(true);
  }

  openEditModal(game: Game) {
    this.editingGameId.set(game.id);
    this.modalTitle.set('Editează Jocul');
    this.gameForm.setValue({
      title: game.title,
      platform: game.platform,
      progress: game.progress,
      hours: game.hours,
      status: game.status
    });
    this.isModalVisible.set(true);
  }

  handleCancel() {
    this.isModalVisible.set(false);
  }

  handleSave() {
    if (this.gameForm.invalid) return;

    let formValues = this.gameForm.value;

    // === Corecție automată a statusului în funcție de progres ===
    const progress = formValues.progress;
    let status = formValues.status;

    if (progress === 100) {
      status = 'Finalizat'; // forțează Finalizat
    } else {
      // dacă progresul < 100 și statusul e Finalizat, îl corectăm
      if (status === 'Finalizat') {
        status = 'În Desfășurare';
      }
    }

    formValues = { ...formValues, status };

    // Confetti la finalizare
    if (status === 'Finalizat' || progress === 100) {
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    }

    const editingId = this.editingGameId();
    let newList: Game[];

    if (editingId !== null) {
      newList = this.games().map(g =>
        g.id === editingId ? { ...g, ...formValues } : g
      );
    } else {
      const newGame: Game = { id: Date.now(), ...formValues };
      newList = [...this.games(), newGame];
    }

    this.games.set(newList);
    this.saveGamesToStorage(newList);
    this.isModalVisible.set(false);
  }

  deleteGame(id: number) {
    const newList = this.games().filter(g => g.id !== id);
    this.games.set(newList);
    this.saveGamesToStorage(newList);
  }

  // ===== Sortări =====
  sortTitle = (a: Game, b: Game) => a.title.localeCompare(b.title);
  sortPlatform = (a: Game, b: Game) => a.platform.localeCompare(b.platform);
  sortProgress = (a: Game, b: Game) => a.progress - b.progress;
  sortHours = (a: Game, b: Game) => a.hours - b.hours;
  sortStatus = (a: Game, b: Game) => a.status.localeCompare(b.status);

  // ===== Gestionare progres =====
  onProgressChange(value: number) {
    if (value === 100) {
      this.gameForm.get('status')?.setValue('Finalizat');
    } else {
      // dacă progresul scade sub 100 și statusul era Finalizat, îl schimbăm în În Desfășurare
      const currentStatus = this.gameForm.get('status')?.value;
      if (currentStatus === 'Finalizat') {
        this.gameForm.get('status')?.setValue('În Desfășurare');
      }
      // dacă utilizatorul a pus manual Backlog, rămâne Backlog
    }
  }

  handleRefresh() {
    const stored = localStorage.getItem('gaming_games');
    if (stored) {
      try {
        this.games.set(JSON.parse(stored));
        console.log('Date sincronizate din stocare locală.');
      } catch { console.warn('Eroare la sincronizare.'); }
    } else {
      console.log('Nu există date salvate.');
    }
  }
}