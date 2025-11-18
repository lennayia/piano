# Piano Learning App

Moderní webová aplikace pro výuku hry na klavír, vytvořená s React a Vite.

## Funkce

- **Registrace uživatelů** - Jednoduchá registrace pomocí jména, příjmení a emailu
- **Strukturované lekce** - Postupné lekce od základů po pokročilé techniky
- **Sledování pokroku** - Automatické ukládání dokončených lekcí
- **Admin panel** - Přehled registrovaných uživatelů a statistik
- **Moderní UI** - Čistý, intuitivní design s Lucide ikonami
- **Responzivní design** - Funguje na všech zařízeních

## Technologie

- **React 19** - Moderní UI knihovna
- **Vite** - Rychlý build nástroj
- **React Router** - Client-side routing
- **Zustand** - Jednoduchý state management s persistencí
- **Lucide React** - Moderní sada ikon

## Struktura projektu

```
src/
├── components/
│   ├── auth/          # Autentizace (registrační formulář)
│   ├── admin/         # Admin panel (statistiky, správa uživatelů)
│   ├── lessons/       # Komponenty pro lekce
│   └── layout/        # Layout komponenty (Header, Layout)
├── pages/             # Stránky aplikace
│   ├── Home.jsx
│   ├── Registration.jsx
│   ├── UserDashboard.jsx
│   ├── Admin.jsx
│   └── Lesson.jsx
├── store/             # Zustand stores
│   ├── useUserStore.js
│   └── useLessonStore.js
└── styles/            # Globální styly
```

## Spuštění aplikace

### Instalace závislostí

```bash
npm install
```

### Vývojový server

```bash
npm run dev
```

Aplikace bude dostupná na `http://localhost:5173`

### Build pro produkci

```bash
npm run build
```

### Preview produkčního buildu

```bash
npm run preview
```

## Použití

1. **Registrace** - Navštivte `/registration` a zadejte své údaje
2. **Lekce** - Po registraci se dostanete do dashboard s dostupnými lekcemi
3. **Učení** - Klikněte na lekci a postupujte podle instrukcí
4. **Admin** - Navštivte `/admin` pro přehled všech uživatelů a statistik

## Datové úložiště

Aplikace používá Zustand s persistencí do localStorage:
- Uživatelské údaje a pokrok jsou uloženy lokálně
- Data přetrvávají i po reloadu stránky
- Vhodné pro demo účely

Pro produkční nasazení doporučujeme připojit backend API pro ukládání dat na server.

## Licence

MIT
