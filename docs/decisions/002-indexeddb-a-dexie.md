# ADR 002 — IndexedDB a Dexie

## Stav

Schváleno

## Kontext

Aplikace neukládá jen několik nastavení. Potřebuje držet:

- stav znalostí
- historii záměn
- stav relace
- snapshoty pokroku
- metadata databáze
- budoucí opakovací plán

Tento rozsah neodpovídá jednoduchému použití `localStorage`.

## Rozhodnutí

Pro lokální persistenci bude použitá IndexedDB a nad ní Dexie.

## Důvody

- IndexedDB je vhodná pro strukturovaná a větší klientská data
- podporuje indexaci a transakční zápisy
- Dexie zjednodušuje práci s otevřením databáze, verzemi a migracemi
- architektura počítá s více úložišti a migrační politikou

## Zamítnuté varianty

### localStorage
Není vhodná pro větší množství strukturovaných a indexovaných dat.

### Vlastní tenká vrstva přímo nad IndexedDB
Byla by zbytečně drahá na údržbu, testování a migrace.

## Důsledky

- zdroj pravdy pro progres je v IndexedDB
- globální store zůstává malý a neobsahuje historická data
- změny schématu musí mít verzi, migrační krok a test
- export a import progresu zůstávají samostatnou servisní vrstvou
