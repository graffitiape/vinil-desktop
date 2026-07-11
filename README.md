# Vinil Desktop

A personal music streaming desktop application built with Tauri and React.

## Features

- Browse and play your music collection
- Beautiful vinyl-inspired interface
- Upload and organize your music library
- Create and manage playlists
- Search functionality
- Now Playing view with album artwork

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Desktop**: Tauri (Rust)
- **UI Components**: Radix UI, shadcn/ui
- **Icons**: Lucide React

## Running the code

Install the dependencies:
```bash
npm i
```

Point the desktop app at the backend API. For local backend development this is optional because the app defaults to `http://localhost:3333/api`.
```bash
cp .env.example .env.local
```

Start the development server:
```bash
npm run dev
```
The Vite dev server runs at `http://127.0.0.1:5175`.

Build the Tauri desktop app:
```bash
npm run tauri:build
```
