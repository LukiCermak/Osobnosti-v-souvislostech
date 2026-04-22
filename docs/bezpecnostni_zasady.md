# Bezpečnostní zásady

## Účel

Tento dokument převádí bezpečnostní architekturu projektu do provozních a vývojových pravidel.

## Hlavní hrozby

Projekt počítá hlavně s těmito riziky:

- XSS přes nebezpečné vykreslení textu
- nechtěné promítnutí interních dat do rozhraní
- poškození lokální databáze
- chybné zacházení s volitelnou budoucí synchronizací
- únik konfigurace při pozdějším rozšíření

## Povinná pravidla

### Vykreslování obsahu

- obsahové texty se vykreslují jako text
- nebezpečné API pro přímé vkládání HTML se nepoužívá bez sanitizace
- cizí HTML se nepovažuje za důvěryhodné
- všechny nové komponenty musí zachovat stejnou zásadu

### Prezentační vrstva

- do UI se nesmí propsat interní názvy stavů
- do UI se nesmí propsat interní identifikátory
- viditelné texty se vedou v lokalizační vrstvě
- technické diagnostické výpisy zůstávají mimo běžné rozhraní

### Konfigurace

- nepoužívat hardcoded secrets
- veřejné a neveřejné hodnoty držet odděleně
- neveřejné klíče a tokeny necommitovat
- `.env.example` držet aktuální a bezpečný

### Lokální úložiště

- ukládat jen pseudonymní identifikátor, progres, stav relace a preference
- neukládat hesla ani osobní údaje
- neukládat tokeny třetích stran
- importované zálohy validovat před zápisem

### Databázové migrace

- každá změna schématu musí mít verzi
- každá verze musí mít migrační krok
- změna musí mít test migrace
- při selhání migrace je nutné nabídnout bezpečné obnovení

### Závislosti

- nové knihovny přidávat jen s technickým zdůvodněním
- sledovat známé zranitelnosti
- externí závislosti auditovat průběžně
- omezovat rozšiřování attack surface

## Doporučené technické kontroly

- lint a typecheck v CI
- validace obsahu při každém pull requestu
- build runtime dat před buildem UI
- pravidelná kontrola zastaralých závislostí
- kontrola CSP a offline vrstvy po změnách PWA

## Budoucí rozšíření

Pokud někdy přibude synchronizace nebo backend, je nutné doplnit:

- autentizaci
- autorizaci
- ochranu proti CSRF
- rate limiting
- audit logiku
- oddělení veřejných a neveřejných rozhraní
