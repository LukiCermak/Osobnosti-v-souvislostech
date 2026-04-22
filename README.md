# Osobnosti v souvislostech

Interaktivní studijní aplikace pro speciální pedagogiku.

Projekt je navržen jako jedna klientská PWA aplikace bez povinného backendu. Stojí na Reactu, TypeScriptu, Vite, React Routeru, Zustandu, Dexie a PWA vrstvě. Obsah je oddělený do autorské YAML vrstvy a sestavené runtime vrstvy. Progres se ukládá lokálně do IndexedDB. 

## Cíl aplikace

Aplikace podporuje:
- aktivní vybavování
- učení v souvislostech
- rozlišování podobných osobností
- návrat k častým záměnám
- dlouhodobé opakování
- pokračování v rozpracovaném studiu

Jedna aplikace sdílí tři režimy:
- Atlas souvislostí
- Detektivní spisy
- Laboratoř rozlišení

## Technologický základ

- React
- TypeScript
- Vite
- React Router
- Zustand
- Dexie
- vite-plugin-pwa
- Vitest
- Playwright

## Struktura repozitáře

Klíčové bloky repozitáře:

- `content/source/` autorská obsahová vrstva
- `content/built/` runtime data pro aplikaci
- `content/schemas/` validační schémata
- `scripts/` build a validační skripty
- `src/core/` učební jádro a práce s grafem obsahu
- `src/db/` lokální persistence a migrace
- `src/state/` lehký aplikační stav
- `src/features/` jednotlivé uživatelské režimy
- `src/locale/` české texty rozhraní
- `tests/` testovací vrstva
- `.github/workflows/` automatické kontroly a nasazení

## Požadavky

- Node.js podle `.nvmrc`
- npm 10 nebo novější

## První spuštění

```bash
npm install
npm run content:build
npm run dev
```

Aplikace poběží ve vývojovém režimu na lokální Vite adrese.

## Ověření projektu

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Obsahový workflow

Autorský obsah se upravuje v:

- `content/source/metadata/*.yaml`
- `content/source/mini-wikipedie-osobnosti/*.yaml`

Po změně obsahu se spouští:

```bash
npm run content:validate
npm run content:check-required
npm run content:build
npm run content:search-index
```

Doporučený postup po obsahové změně:

1. upravit autorský YAML soubor
2. spustit validaci
3. zkontrolovat povinné osobnosti a vazby
4. sestavit runtime data
5. spustit testy
6. odevzdat změnu přes pull request

## Testy

### Jednotkové a integrační testy

```bash
npm run test
```

### End-to-end testy

```bash
npm run test:e2e
```

## Nasazení

Pro GitHub Pages stačí nahrát obsah repozitáře a ponechat workflow běžet přes GitHub Actions. Lokální příkazy níže jsou potřeba jen pro vývoj, kontrolu nebo vlastní úpravy projektu.


Projekt je připravený pro statické nasazení. Přiložený workflow `deploy.yml` cílí na GitHub Pages. Stejný build je možné nasadit i na jiný statický hosting.

Doporučený produkční postup:

```bash
npm ci
npm run content:validate
npm run content:build
npm run build
```

## Ochrana soukromí

První verze nepoužívá povinný backend, registraci ani synchronizaci mezi zařízeními. Do lokální persistence se ukládá jen pseudonymní identifikátor, progres, stav relace a preference.

## Dokumentace

Další dokumenty:

- `docs/obsahovy_model.md`
- `docs/bezpecnostni_zasady.md`
- `docs/migrace_databaze.md`
- `docs/decisions/001-volba-stacku.md`
- `docs/decisions/002-indexeddb-a-dexie.md`
- `docs/decisions/003-bez-backendu-v1.md`

## Licence

Licenci zvolte podle pravidel cílového repozitáře. Pokud bude projekt veřejný, doporučuje se doplnit samostatný soubor `LICENSE`.
