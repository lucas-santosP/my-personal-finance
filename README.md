<p align="center">
  <img src="public/logo.png" width="96" alt="p-finance logo" />
</p>

<h1 align="center">My Finances</h1>

<p align="center">
  A personal finance tracker to manage monthly income and expenses,<br/>
  with real-time cloud sync and multi-device access.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-12-FFCA28?style=flat&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat&logo=tailwindcss&logoColor=white" />
</p>

---

## Goals

- Track **income and expenses** per month with categories, due dates, and paid status
- See a **yearly dashboard** with charts and spending insights
- Access data from **any device** via Firebase cloud sync
- Keep everything **private** — data is locked to the authenticated user

## Features

- **Monthly view** — add, edit, delete income and expense entries; toggle paid/received status; track spending rate
- **Dashboard** — yearly overview with income vs. expense bar chart, top expense categories, and monthly summaries
- **Authentication** — email/password or Google sign-in via Firebase Auth
- **Cloud storage** — Firestore stores each month as an isolated document per user
- **Import / Export** — back up and restore all data as a JSON file
- **Copy month** — duplicate a month's entries to another period with paid status reset
- **Responsive** — desktop table layout and mobile card list; modal becomes a bottom sheet on small screens

## Stack

| Layer           | Technology                                                                     |
| --------------- | ------------------------------------------------------------------------------ |
| Framework       | [React 18](https://react.dev) + [TypeScript 5](https://www.typescriptlang.org) |
| Bundler         | [Vite 5](https://vitejs.dev)                                                   |
| Styling         | [Tailwind CSS 3](https://tailwindcss.com)                                      |
| Charts          | [Recharts 2](https://recharts.org)                                             |
| Icons           | [Tabler Icons](https://tabler.io/icons)                                        |
| Date picker     | [react-day-picker 8](https://react-day-picker.js.org)                          |
| Auth & DB       | [Firebase 12](https://firebase.google.com) — Auth + Firestore                  |
| Security        | Firebase App Check + reCAPTCHA v3                                              |
| Package manager | [Bun](https://bun.sh)                                                          |
| Linting         | ESLint + typescript-eslint                                                     |
| Formatting      | Prettier                                                                       |

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd p-finance
bun install
```

### 2. Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and create a project
2. Enable **Authentication** → Sign-in providers → **Email/Password** and **Google**
3. Enable **Firestore Database** in production mode
4. Register a **Web app** and copy the config
5. Go to **App Check** → register your web app with **reCAPTCHA v3** (get a site key from [g.co/recaptcha/admin](https://g.co/recaptcha/admin))

### 3. Configure environment

Copy `.env.example` to `.env.local` and fill in your Firebase credentials:

```bash
cp .env.example .env.local
```

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_RECAPTCHA_SITE_KEY=
```

### 4. Run

```bash
bun dev
```

## Scripts

| Command                | Description                          |
| ---------------------- | ------------------------------------ |
| `bun dev`              | Start dev server                     |
| `bun run build`        | Type-check and build for production  |
| `bun run preview`      | Preview the production build locally |
| `bun run lint`         | Run ESLint                           |
| `bun run lint:fix`     | Run ESLint and auto-fix              |
| `bun run format`       | Format all files with Prettier       |
| `bun run format:check` | Check formatting without writing     |
