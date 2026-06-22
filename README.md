# Gaming Backlog Tracker

**Proiect Angular** — Smaranda Sergiu-Ionel & Pătrașcu Alexandru Cătălin

## 1. Descrierea proiectului

Gaming Backlog Tracker este o aplicație web care permite utilizatorilor să își gestioneze
lista personală de jocuri video — fie cele pe care le au în desfășurare, fie cele pe care
și le propun să le termine (backlog). Aplicația ajută la urmărirea progresului, a orelor
jucate și a platformei pe care este jucat fiecare titlu, oferind o privire centralizată
asupra colecției de jocuri a utilizatorului.

Ideea a apărut din nevoia reală a multor gameri de a ține evidența jocurilor cumpărate
dar neterminate, a trofeelor/achievement-urilor de vânat și a progresului general prin
biblioteca personală de jocuri.

## 2. Funcționalități principale

### Autentificare (Login + Register)
- Formular de **login**: email, parolă, checkbox "Remember me" (păstrează userul logat
  folosind local storage / token persistent).
- Formular de **register**: email, parolă, confirmare parolă, nume, prenume.
- Validare custom pentru parolă: minim 6 caractere, cu cel puțin o literă mare, o literă
  mică, o cifră și un caracter special.
- Conectare la [Reqres](https://reqres.in/) ca Fake API pentru autentificare.
- Pagina de login este vizibilă doar utilizatorilor neautentificați; după logare, accesul
  la ea este blocat printr-un route guard, iar utilizatorul e redirecționat către
  dashboard.

### Tabelul de jocuri (Backlog)
Tabelul principal al aplicației conține următoarele coloane:
1. **Titlu joc**
2. **Platformă** (PC, PS5, Xbox)
3. **Progres** (0–100%, prin slider/input numeric)
4. **Ore jucate**
5. **Status** (In Progress, Completed, Backlog)

Funcționalități pe tabel:
- **Adăugare** unui joc nou printr-un modal cu formular validat.
- **Editare** unei intrări existente, tot printr-un modal.
- **Ștergere** unei intrări, printr-un buton dedicat pe fiecare rând.
- **Căutare** prin titlul jocului, folosind un searchbar.
- **Sortare** după fiecare coloană (titlu, platformă, progres, ore, status).

### Funcționalitate bonus
La adăugarea unui joc cu status "Completed" sau progres 100%, aplicația declanșează un
efect de confetti pe ecran, folosind librăria externă `canvas-confetti`.

## 3. Arhitectură tehnică

- **Angular 20**, proiect organizat pe module **lazy-loaded** (ex: modulul de auth separat
  de modulul de backlog/dashboard), încărcate la nevoie prin routing.
- **NgZorro** ca librărie de UI pentru componente (tabel, modal, input, butoane, slider).
- Folosirea de **componente** dedicate pentru fiecare bucată de UI reutilizabilă (ex:
  componenta de rând din tabel, componenta de formular pentru adăugare/editare joc).
- Comunicare între componente prin **`@Input()`** și **`@Output()`** (ex: componenta de
  formular trimite jocul nou adăugat către componenta părinte prin output, iar componenta
  de tabel primește lista de jocuri prin input).
- Un **serviciu** (`GameService`) responsabil de gestionarea listei de jocuri (CRUD local,
  eventual conectare la un backend real ca bonus).
- Folosirea unui **signal** Angular pentru a gestiona starea reactivă a listei de
  jocuri/filtrare/căutare.
- Autentificare gestionată printr-un `AuthService`, cu interceptor/guard pentru protejarea
  rutelor.

## 4. Tehnologii folosite

| Tehnologie       | Scop                                  |
|------------------|----------------------------------------|
| Angular 20       | Framework principal                   |
| NgZorro          | Librărie de componente UI             |
| RxJS / Signals   | Gestionarea stării reactive           |
| Reqres API       | Fake API pentru autentificare         |
| canvas-confetti  | Efect vizual bonus (librărie externă) |
