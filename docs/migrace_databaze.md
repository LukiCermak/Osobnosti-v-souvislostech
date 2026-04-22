# Migrace databáze

## Účel

Tento dokument popisuje zásady verzování a migrací lokální databáze založené na IndexedDB a Dexie.

## Proč je migrační politika nutná

Aplikace ukládá:

- stav znalostí
- historii záměn
- stav relace
- snapshoty pokroku
- technická metadata

To znamená, že změna schématu nesmí být tichá ani improvizovaná.

## Zásady migrací

Každá změna schématu musí mít:

- číslo verze
- migrační krok
- test migrace
- fallback pro poškozenou nebo starou databázi

## Doporučený postup

### 1. Navýšit verzi databáze
Změnu dělat jen v centrálním místě databázové konfigurace.

### 2. Přidat migrační krok
Migrační krok musí být idempotentní v rámci daného upgrade běhu a nesmí tiše zahazovat data bez výslovného důvodu.

### 3. Přidat test migrace
Každá změna schématu musí být pokrytá testem, který ověří:
- otevření staré verze
- migraci do nové verze
- čitelnost klíčových dat po migraci

### 4. Zachovat čitelnou část dat
Pokud selže migrace, aplikace má:
1. zálohovat čitelnou část dat
2. nabídnout bezpečné obnovení
3. neztratit obsah aplikace
4. uživatele jasně informovat o obnově úložiště

## Co musí být po migraci zachováno

- profil uživatele
- stav znalostí, pokud je čitelný
- důležité záznamy záměn
- rozpracovaná relace, pokud je konzistentní
- snapshoty, pokud nejsou v rozporu s novým schématem

## Kdy je přípustný reset

Úplný reset lokální databáze je krajní varianta a smí být použit jen tehdy, když:

- data nejde bezpečně přečíst
- migrace by vedla ke zjevně nekonzistentnímu stavu
- je uživateli nabídnut export záchranné části dat, pokud to jde
- rozhraní jasně vysvětlí, co se stalo

## Vztah k exportu a importu

Export progresu není náhradou migrace, ale záchranný a servisní mechanismus. Import musí:
- validovat verzi balíčku
- validovat strukturu dat
- odmítnout nekompatibilní nebo poškozený vstup

## Doporučená kontrola v CI

- spustit integrační test migračního toku
- spustit test obnovy po neúspěšné migraci, pokud se mění kritická část schématu
