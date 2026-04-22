# Bezpečnostní zásady

## Rozsah

Tento projekt je klientská vzdělávací PWA aplikace bez povinného backendu. Bezpečnostní zásady se zaměřují hlavně na:

- bezpečné vykreslování obsahu
- ochranu lokální persistence
- odpovědné zacházení s konfigurací
- bezpečnou práci se závislostmi
- řízené hlášení zranitelností

## Hlášení zranitelností

Bezpečnostní problém neoznamujte veřejným issue, pokud by zveřejnění mohlo uživatele poškodit nebo usnadnit zneužití.

Doporučený postup:

1. připravit stručný popis problému
2. uvést dopad a podmínky zneužití
3. přiložit postup reprodukce
4. navrhnout, zda jde o chybu v aplikaci, obsahu nebo build pipeline
5. poslat hlášení neveřejným kanálem maintainerovi repozitáře

Maintainer by měl:
- potvrdit přijetí hlášení
- vyhodnotit závažnost
- připravit opravu
- po vydání opravy zveřejnit shrnutí

## Co se v první verzi neukládá

Aplikace nesmí ukládat:
- hesla
- osobní údaje
- tokeny třetích stran
- citlivá zdravotní data
- identifikační dokumenty

## Co se v první verzi ukládá

Aplikace může ukládat:
- pseudonymní identifikátor
- progres
- stav relace
- preference uživatele
- technická metadata lokálního úložiště

## Bezpečnostní pravidla pro vývoj

### 1. Ochrana proti XSS

- nevkládat neověřené HTML přímo do rozhraní
- nevykreslovat obsah přes nebezpečná API bez sanitizace
- obsahové texty defaultně vykreslovat jako text
- nepoužívat inline skripty
- držet přísnou Content Security Policy
- omezovat počet externích zdrojů

### 2. Lokální persistence

- IndexedDB je zdroj pravdy pro progres
- migrace musí mít verzi, migrační krok a fallback
- při chybě migrace je nutné nabídnout bezpečné obnovení
- export a import progresu musí validovat datový formát před zápisem

### 3. Konfigurace

- nepoužívat hardcoded secrets
- veřejná konfigurace musí být oddělená od neveřejné
- proměnné prostředí dokumentovat v `.env.example`
- citlivé hodnoty nikdy necommitovat do repozitáře

### 4. Závislosti

- pravidelně aktualizovat závislosti
- auditovat nové knihovny před přidáním
- omezovat počet závislostí na nutné minimum
- při vysoké závažnosti zranitelnosti opravit nebo dočasně odstavit rizikovou část

### 5. Obsahová integrita

- každá změna obsahu musí projít validací schémat
- nesmí existovat neplatné nebo osiřelé vazby
- povinné osobnosti a kritické historické linie musí být kontrolované samostatně
- runtime data musí vznikat pouze build skriptem z autorské vrstvy

## Doporučená reakce na incident

1. zastavit další nasazení
2. určit, zda jde o problém obsahu, klientské logiky nebo build pipeline
3. vyhodnotit dopad na lokální data uživatelů
4. připravit opravu
5. po opravě zveřejnit stručné vysvětlení změny
