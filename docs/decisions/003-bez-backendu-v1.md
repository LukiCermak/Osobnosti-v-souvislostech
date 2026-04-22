# ADR 003 — Bez backendu v první verzi

## Stav

Schváleno

## Kontext

Zadání první verze nevyžaduje:

- registraci
- přihlašování
- synchronizaci mezi zařízeními
- administraci obsahu
- učitelský dashboard
- centrální analytiku

Hlavním cílem je ověřit funkční učební nástroj nad jedním obsahem, lokální persistencí a třemi režimy studia.

## Rozhodnutí

První verze nebude mít povinný backend.

## Důvody

- nižší bezpečnostní a provozní náročnost
- rychlejší dodání a jednodušší nasazení
- vhodnost pro otevřený repozitář
- žádná nutnost řešit účty, tokeny, API a serverové relace
- možnost provozu na statickém hostingu

## Důsledky

- progres se ukládá lokálně
- mezi zařízeními se data automaticky nesynchronizují
- export a import progresu mají vyšší význam
- pozdější doplnění backendu je možné, ale není součástí prvního release

## Podmínka pro budoucí změnu

Backend má smysl teprve tehdy, když vznikne skutečný požadavek na:
- více zařízení
- sdílený účet
- centrální správu obsahu
- učitelské rozhraní
- centrální analytiku
