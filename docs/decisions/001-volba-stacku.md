# ADR 001 — Volba stacku

## Stav

Schváleno

## Kontext

První verze aplikace má být:

- klientská
- nasaditelná na statický hosting
- bez povinného backendu
- rozšiřitelná o další obsah a režimy
- vhodná pro veřejný GitHub repozitář

Současně musí podporovat:

- lokální progres
- offline provoz po prvním načtení
- adaptivní studijní logiku
- čisté oddělení UI, obsahu, jádra a persistence

## Rozhodnutí

Použitý stack:

- React
- TypeScript
- Vite
- React Router
- Zustand
- Dexie
- vite-plugin-pwa

## Důvody

### React
Komponentový model pro členitou uživatelskou vrstvu.

### TypeScript
Typová bezpečnost napříč obsahem, jádrem, databází i UI.

### Vite
Rychlý vývoj, jednoduchý build a vhodnost pro čisté statické nasazení.

### React Router
Jasné oddělení režimů a návrat do rozehraného místa.

### Zustand
Lehký a čitelný globální stav bez zbytečné režie.

### Dexie
Tenká a dobře čitelná vrstva nad IndexedDB.

### vite-plugin-pwa
Instalovatelná PWA vrstva a offline cache.

## Zamítnuté varianty

### Next.js se statickým exportem
Přináší víc režie, než první verze potřebuje.

### Klient + backend od začátku
Zvyšuje bezpečnostní, provozní i implementační složitost bez nutnosti pro první verzi.

## Důsledky

- aplikace zůstává bez povinného backendu
- provoz i hosting zůstávají jednoduché
- synchronizace mezi zařízeními není součástí první verze
- učební logika běží v prohlížeči
