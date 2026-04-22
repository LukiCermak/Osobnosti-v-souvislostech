# Obsahový model

## Účel

Tento dokument popisuje autorskou a runtime vrstvu obsahu aplikace **Osobnosti v souvislostech**.

Cílem není spravovat seznam izolovaných hesel. Obsahový model je navržený jako síť entit a vazeb, aby nad jedním zdrojem bylo možné stavět Atlas souvislostí, Detektivní spisy i Laboratoř rozlišení.

## Základní zásada

Existují dvě obsahové vrstvy:

- **autorská vrstva** v `content/source/`
- **runtime vrstva** v `content/built/`

Autorská vrstva je určena pro lidsky čitelnou editaci. Runtime vrstva vzniká build skriptem a slouží přímo aplikaci.

## Obsahové jednotky

Projekt pracuje minimálně s těmito entitami:

- osobnost
- pojem
- metoda
- test nebo škála
- instituce
- dílo
- systém komunikace
- historické období
- disciplína
- studijní linie
- detektivní případ
- kontrastní sada

## Hlavní soubory autorské vrstvy

### `content/source/metadata/disciplines.yaml`
Řízený seznam disciplín.

### `content/source/metadata/eras.yaml`
Řízený seznam historických období.

### `content/source/metadata/tags.yaml`
Řízený seznam štítků používaných pro filtraci, kontrasty a vyhledávání.

### `content/source/mini-wikipedie-osobnosti/persons.yaml`
Primární autorský záznam osobností.

### `content/source/mini-wikipedie-osobnosti/concepts.yaml`
Pojmy, instituce, testy, metody, díla a další neosobnostní entity.

### `content/source/mini-wikipedie-osobnosti/relations.yaml`
Nejdůležitější obsahový soubor pro učební logiku. Zde vznikají vazby, nad nimiž se plánuje učení, kontrasty i návrat k chybám.

### `content/source/mini-wikipedie-osobnosti/paths.yaml`
Kurátorské studijní trasy pro Atlas.

### `content/source/mini-wikipedie-osobnosti/cases.yaml`
Samostatně vedené detektivní spisy.

### `content/source/mini-wikipedie-osobnosti/contrast_sets.yaml`
Přesně definovaný kontrastní materiál pro Laboratoř rozlišení.

## Minimální metadata osobnosti

Každá osobnost má mít alespoň:

- stabilní interní identifikátor
- zobrazované jméno
- alternativní jména
- období
- národní okruh
- disciplíny
- stručný odborný význam
- hlavní kotvy
- vztahy k dalším entitám
- studijní prioritu
- zdrojovou referenci

## Vazba jako studijní jednotka

Aplikace neplánuje jen „osobnost obecně“. Důležitou jednotkou je i konkrétní vazba, například:

- osobnost → instituce
- osobnost → metoda
- osobnost → test
- osobnost → historická návaznost
- osobnost → jiná osobnost
- osobnost → proměna pojetí oboru

To umožňuje lépe rozlišit, zda student zvládá jméno, nebo skutečně rozumí souvislostem.

## Runtime vrstva

Build skript vytváří:

- `content/built/people.json`
- `content/built/concepts.json`
- `content/built/relations.json`
- `content/built/paths.json`
- `content/built/cases.json`
- `content/built/contrast-sets.json`
- `content/built/content-version.json`

Runtime vrstva musí vznikat výhradně ze schválené autorské vrstvy.

## Validační pravidla

Každá změna obsahu musí projít:

- kontrolou schématu
- kontrolou duplicitních identifikátorů
- kontrolou odkazů na neexistující entity
- kontrolou osamocených uzlů
- kontrolou povinných polí
- kontrolou povinných osobností
- kontrolou kritických historických linií

## Editační zásady

- nepřidávat odborný obsah mimo schválený zdroj bez jasného označení
- při nejistotě označit místo k doplnění, ne jako hotový fakt
- interní identifikátory držet stabilní
- viditelné texty rozhraní nepsat do obsahových YAML souborů, pokud nejde o autorský obsah
