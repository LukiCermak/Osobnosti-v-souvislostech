# FÁZE 4 – KOMPLETNÍ TECHNICKÁ ARCHITEKTURA APLIKACE

## 1. Účel tohoto dokumentu

Tento dokument je technická architektura jedné ucelené vzdělávací aplikace pro osobnosti speciální pedagogiky. Je určen jako realizační podklad pro další fáze projektu. Nejde o marketingové shrnutí ani o obecný technologický přehled. Cílem je stanovit takovou architekturu, aby na ni šlo přímo navázat návrhem repozitáře, souborů a následnou implementací.

Aplikace má plnit tři režimy, které sdílejí stejný obsah, stejnou znalostní vrstvu i stejný uživatelský progres.

- Atlas vazeb a studijních tras
- Detektivní spisy oboru
- Laboratoř rozlišení a slabých míst

Obsahovým základem není katalog osobností, ale síť vztahů mezi osobnostmi, disciplínami, institucemi, metodami, testy, díly a historickými liniemi. To odpovídá i zdrojovému dokumentu, který opakovaně propojuje osobnosti s konkrétními institucionálními, diagnostickými a historickými vazbami, například Howe s Perkins School for the Blind a Laurou Bridgmanovou, Brailla s přepracováním Barbierova systému nebo Bineta, Simona a Termana s vývojem inteligenčních škál. fileciteturn10file0 fileciteturn10file4

---

## 2. Architektonické cíle

Architektura musí splnit následující cíle:

1. **Jedna aplikace, tři odlišné režimy**
   Všechny režimy musí běžet nad jedním obsahem a jedním profilem znalostí uživatele.

2. **Offline použitelnost**
   Student musí být schopen učit se i bez připojení, alespoň po prvním načtení aplikace.

3. **Lokální a bezpečný progres**
   Základní verze nesmí být závislá na účtu ani backendu. Progres se ukládá lokálně.

4. **Veřejný GitHub repozitář**
   Projekt musí být čitelný, auditovatelný, bez skrytých závislostí na neveřejných službách.

5. **Obsahová rozšiřitelnost**
   Musí být snadné doplňovat další osobnosti, vazby, testy, instituce a nové typy úloh.

6. **Jasné oddělení prezentační a technické vrstvy**
   Uživatel nikdy nesmí vidět interní identifikátory, anglické názvy stavů ani technické termíny určené pro kód.

7. **Bezpečnost a soukromí**
   Žádné hardcoded secrets. Žádné zbytečné osobní údaje. Žádné neřízené vkládání HTML do rozhraní.

---

## 3. Klíčové závěry z obsahového zdroje

Zdrojový dokument není vhodný pro plochý model „osobnost = karta“. Obsah je síťový a mnoho položek je studijně významných právě skrze vztah.

To je patrné například u těchto typů vazeb:

- osobnost → instituce
- osobnost → test nebo škála
- osobnost → metoda nebo systém
- osobnost → jiná navazující osobnost
- osobnost → historický mezník
- osobnost → širší proměna pojetí oboru

Dokument vedle sebe obsahuje starší kategoriální pojetí speciální pedagogiky i novější funkční a inkluzivní pojetí, což je důležité i pro architekturu učebních tras a kontrastních úloh. Karel Dvořák reprezentuje starší užší a kategoriální vymezení, zatímco Fischer, Škoda a Slowík reprezentují širší a funkčně orientované pojetí podpory a socializace. fileciteturn11file0

Technická architektura proto musí být postavena na:

- grafu vztahů, ne na seznamu
- adaptivní práci s jednotlivými vazbami, ne jen s položkami
- oddělení obsahových dat od učební logiky
- možnosti generovat různé typy úloh nad stejnými daty

---

## 4. Posouzení architektonických variant

### Varianta A – čistě klientská PWA ve Vite + React + TypeScript

Tato varianta znamená:

- statickou aplikaci bez povinného backendu
- data ve verzovaných JSON souborech
- lokální ukládání progresu v IndexedDB
- PWA vrstvu pro offline režim a instalaci do zařízení

**Výhody**

- nejjednodušší provoz a nejmenší provozní riziko
- výborná kompatibilita s GitHub Pages a běžným statickým hostingem
- nízká komplexita
- vhodné pro otevřený repozitář
- snadné auditování
- není nutné řešit účty, autentizaci a serverové relace

**Nevýhody**

- bez doplňkové serverové vrstvy není synchronizace napříč zařízeními
- veškerá učební logika běží v prohlížeči
- je potřeba pečlivě navrhnout migrace lokální databáze

### Varianta B – Next.js se statickým exportem

Tato varianta by fungovala také, ale přináší více rámcové režie, než projekt v první verzi potřebuje.

**Výhody**

- robustní ekosystém
- možnost pozdějšího rozšíření o serverové funkce

**Nevýhody**

- pro statickou vzdělávací PWA bez backendu je to zbytečně těžký rámec
- vyšší konfigurační složitost
- větší riziko, že bude architektura „větší než problém“

### Varianta C – klientská aplikace + lehký backend od začátku

Tato varianta by dávala smysl jen tehdy, kdyby bylo od počátku zásadní:

- přihlašování
- synchronizace mezi zařízeními
- učitel/administrátor
- centrální analytics
- editace obsahu přes administrační rozhraní

V zadání však nic z toho není nutné pro první verzi.

**Výhody**

- připravenost na více zařízení a centrální správu

**Nevýhody**

- podstatně vyšší bezpečnostní i provozní náročnost
- nutnost řešit API, CSRF, rate limiting, autentizaci, monitoring a hosting backendu
- vyšší složitost projektu ještě před prvním reálným ověřením produktu

---

## 5. Doporučená architektura

### Doporučení

Pro první implementační fázi doporučuji:

**React + TypeScript + Vite + React Router + Zustand + Dexie + vite-plugin-pwa**

To znamená:

- **React** pro komponentové UI
- **TypeScript** pro typovou bezpečnost
- **Vite** pro rychlý vývoj, jednoduchý build a čisté statické nasazení
- **React Router** pro přehledné režimy a návrat do rozehraného místa
- **Zustand** pro jednoduchý a čitelný stav aplikace
- **Dexie** jako tenká vrstva nad IndexedDB
- **vite-plugin-pwa** pro service worker, manifest a offline cache

### Proč právě toto řešení

Tato aplikace nepotřebuje v první verzi server‑side rendering, SEO optimalizaci pro stovky veřejných landing pages ani serverové akce. Potřebuje hlavně:

- čisté klientské chování
- svižné rozhraní
- silnou lokální perzistenci
- jednoduché nasazení
- nízkou provozní závislost
- snadné rozšíření

Jde tedy o produkt, kterému více vyhovuje lehká, přesně cílená klientská architektura než plnohodnotný hybridní rámec.

---

## 6. Cílový systémový obraz

### 6.1 Přehled běhu aplikace

Při prvním spuštění aplikace proběhne:

1. načtení statických obsahových balíčků
2. kontrola verze lokální databáze
3. inicializace uživatelského profilu
4. výpočet doporučeného vstupního studijního bloku
5. zobrazení domovské obrazovky

Při dalším spuštění:

1. načte se obsahová verze aplikace
2. obnoví se lokální progres
3. spočítají se položky k opakování
4. obnoví se poslední rozpracovaný režim
5. nabídne se doporučené pokračování

### 6.2 Hlavní běhové vrstvy

Architektura má pět hlavních vrstev:

- prezentační vrstva
- aplikační vrstva
- učební logika
- obsahová datová vrstva
- lokální perzistence

Každá z nich má jiné odpovědnosti a nesmí se míchat.

---

## 7. Prezentační vrstva

Prezentační vrstva je vše, co uživatel vidí a ovládá.

Patří sem:

- domovská obrazovka
- režim Atlas
- režim Detektivní spisy
- režim Laboratoř
- přehled pokroku
- přehled slabých míst
- nastavení aplikace
- onboarding
- obrazovka návratu k poslednímu studiu

### 7.1 Jazyková a obsahová pravidla prezentační vrstvy

Toto je závazné pravidlo pro celou aplikaci:

- uživatel nikdy neuvidí interní názvy stavů
- uživatel nikdy neuvidí interní názvy polí
- uživatel nikdy neuvidí interní technické identifikátory
- všechny popisy stavů budou formulovány česky a studijně srozumitelně

Například vnitřní stav může nést technický název, ale v rozhraní se zobrazí jen smysluplný český text.

Správně v rozhraní:

- „Pokračovat v rozpracovaném studiu“
- „Dnes k opakování“
- „Nejčastější záměny“
- „Znalost se upevňuje“
- „Potřebuješ zopakovat tuto vazbu“

Nevhodné v rozhraní:

- názvy proměnných
- technické stavy
- anglické názvy atributů
- diagnostické výpisy pro vývojáře

### 7.2 Lokalizační politika

Všechny viditelné texty budou vedeny v samostatném českém textovém registru.

To má dva důvody:

1. technická čistota
2. jistota, že se do rozhraní nepropíší interní texty

První verze bude jen v češtině. Architektura ale musí počítat s tím, že lokalizační vrstva existuje od začátku.

---

## 8. Aplikační vrstva

Aplikační vrstva propojuje UI s učební logikou a s daty.

Obsahuje:

- směrování mezi režimy
- obnovu relace
- výběr aktivního studijního režimu
- orchestraci načtení dat
- práci s nastavením
- předání odpovědí do učebního jádra
- přenos výsledků zpět do UI

Tato vrstva nesmí sama obsahovat doménovou logiku učení. Má řídit tok aplikace, ne rozhodovat, které vazby jsou zralé k opakování.

---

## 9. Učební jádro

Učební jádro je nejdůležitější technická část celé aplikace. Tvoří skutečný motor produktu.

Bude rozděleno do šesti modulů.

### 9.1 Graf obsahu

Tento modul reprezentuje síť entit a vztahů.

Umí:

- načíst osoby, pojmy, instituce, testy, metody a díla
- vytvořit vztahový graf
- filtrovat vazby podle typu
- vytvářet studijní skupiny a historické linie
- vracet kandidáty pro generování úloh

### 9.2 Generátor úloh pro Atlas

Tento modul vytváří úlohy pro budování mapy oboru.

Typické výstupy:

- přiřaď osobnost k instituci
- doplň historickou návaznost
- spoj osobnost s metodou nebo testem
- zařaď osobnost do disciplíny
- urč chybějící článek v řetězci

### 9.3 Generátor úloh pro Detektivní spisy

Tento modul skládá vícevrstvé případy.

Každý případ má:

- cíl
- sadu indicií
- sekvenci odhalování
- navazující otázky
- závěrečnou syntézu

Tento modul musí umět řídit obtížnost. Začíná obecnými stopami a postupně přechází ke konkrétním vazbám.

### 9.4 Generátor úloh pro Laboratoř

Tento modul vytváří rychlé kontrastní úlohy nad častými záměnami.

Příklad typů:

- dvě jména, jeden atribut
- jedna instituce, dvě osobnosti
- jedna škála, tři autoři
- podobná historická linie
- odhalení chybného spojení

Zdrojem pro tento modul nejsou jen obsahová data, ale i historie chyb konkrétního uživatele.

### 9.5 Adaptivní plánovač opakování

Tento modul rozhoduje:

- co vrátit dnes
- co odložit
- co je stabilní
- co je rizikové
- do kterého režimu položku poslat

Neplánuje se „osobnost“, ale konkrétní vazba nebo konkrétní typ znalostního problému.

To je kritické například tam, kde se student neplete v oblasti obecně, ale konkrétně si zaměňuje původní Binet-Simonovu škálu s pozdější revizí Stanford-Binet. Zdrojový dokument na tuto síťovou a navazující povahu látky přímo ukazuje. fileciteturn10file4

### 9.6 Diagnostika chyb

Tento modul klasifikuje chybu, například jako:

- chyba oborového zařazení
- chyba instituce
- chyba testu
- chyba historické návaznosti
- záměna podobné osobnosti
- nedostatečné aktivní vybavení
- správně až po nápovědě

Na základě typu chyby rozhodne, zda má student dostat:

- rychlý kontrastní blok
- hlubší detektivní případ
- návrat do Atlasu
- odložené opakování

---

## 10. Obsahová architektura

### 10.1 Zásada

Obsah nebude udržován jako volný text uvnitř komponent. Obsah musí být uložen ve strukturované podobě a musí být validovatelný.

### 10.2 Doporučený formát

Doporučuji dvouvrstvý model:

- **autorská vrstva** – ručně čitelný normalizovaný formát
- **runtime vrstva** – sestavené JSON balíčky pro aplikaci

Autorská vrstva může být vedená buď v YAML, nebo v dobře členěném JSON. Pro otevřený repozitář je přehlednější YAML, pro runtime je vhodnější JSON.

### 10.3 Obsahové jednotky

Obsah se dělí na tyto jednotky:

- osobnost
- disciplína
- historické období
- pojem
- metoda
- test nebo škála
- instituce
- dílo nebo publikace
- komunikační systém
- studijní linie
- kontrastní sada
- detektivní případ

### 10.4 Povinná metadata každé osobnosti

Každá osobnost musí mít minimálně:

- stabilní interní identifikátor
- zobrazované jméno
- alternativní jména
- období
- národní okruh
- disciplíny
- stručný odborný význam
- hlavní kotvy
- vztahy k dalším entitám
- úroveň studijní priority
- odkaz na zdrojovou větu nebo výsek

### 10.5 Proč to nestačí držet jako prostý seznam

U položek jako Howe, Laura Bridgmanová a Helen Keller nejde o izolované encyklopedické medailony. Studijní hodnota vzniká hlavně vazbou mezi osobností, institucí a historickou návazností vzdělávání hluchoslepých. Stejně tak u Bineta, Simona a Termana je nosná vazba mezi původní škálou, spoluautorstvím a revizí. fileciteturn10file0 fileciteturn10file4

---

## 11. Datový model obsahu

Níže je technický návrh datových struktur. Jde o interní architekturu. Tyto názvy jsou určeny pro kód, nikoli pro uživatelské rozhraní.

### 11.1 Osobnost

Obsahuje:

- identifikátor
- jméno
- alternativní jména
- narození
- úmrtí
- popisek období
- národnostní okruh
- seznam disciplín
- shrnutí významu
- studijní prioritu
- seznam klíčových vazeb
- značky pro záměny
- zdrojové reference

### 11.2 Pojmová entita

Patří sem:

- test
- metoda
- instituce
- dílo
- systém
- termín

Obsahuje:

- identifikátor
- typ entity
- název
- stručný význam
- oborové štítky
- případné alternativní názvy

### 11.3 Vazba

Obsahuje:

- odkud
- kam
- typ vazby
- sílu vazby
- směr vazby
- prioritu pro učení
- příznak vhodnosti pro kontrastní úlohy

### 11.4 Studijní linie

Příklad:

- vývoj surdopedických přístupů
- vývoj inteligenční diagnostiky
- české vymezování speciální pedagogiky
- dějiny edukace nevidomých

Každá linie obsahuje:

- identifikátor
- název
- didaktický cíl
- seznam kroků
- povinné uzly
- kontrastní momenty
- doporučenou obtížnost

### 11.5 Detektivní případ

Obsahuje:

- cílovou osobnost nebo vazbu
- sadu indicií
- logiku odemykání dalších indicií
- doplňující otázky
- pravidla vyhodnocení
- navazující vysvětlení

### 11.6 Kontrastní sada

Obsahuje:

- seznam podobných osobností
- důvod záměny
- klíčový rozlišující znak
- typ vhodných mikroúloh

---

## 12. Datový model uživatelského progresu

Tato část je zásadní, protože celá aplikace je adaptivní a návratová.

### 12.1 Uživatelský profil

Obsahuje:

- pseudonym nebo anonymní identifikátor
- datum vytvoření
- preferované disciplíny
- preferovanou intenzitu
- informaci o prvním použití
- poslední aktivitu

### 12.2 Stav znalostí

Ukládá se ne pro osobnost obecně, ale pro konkrétní studijní jednotku.

Studijní jednotka může být:

- jedna vazba
- jedna kontrastní dvojice
- jedna historická mini-linie
- jedna otázka typu jméno → test
- jedna otázka typu instituce → osobnost

U každé jednotky se ukládá:

- skóre zvládnutí
- stabilita znalosti
- počet úspěchů
- počet chyb
- datum posledního pokusu
- datum doporučeného dalšího opakování
- průměrná rychlost
- míra jistoty
- aktivní problémový typ

### 12.3 Záznam záměn

Samostatně je nutné držet historii záměn.

Například:

- Binet zaměněn za Termana
- de l’Épée zaměněn za Sicarda
- Gallaudet zaměněn za Clerca
- Braille zaměněn s Barbierem

To je klíčové pro Laboratoř.

### 12.4 Stav relace

Musí umožnit obnovit:

- poslední režim
- poslední rozpracovaný případ
- poslední otevřenou trasu
- poslední blok k opakování
- naposledy nedokončenou sérii

### 12.5 Přehledové snapshoty

Pro rychlé načtení přehledů se průběžně ukládají agregované přehledy:

- zvládnutí podle disciplín
- zvládnutí podle režimů
- nejrizikovější záměny
- položky čekající na opakování
- týdenní trend

---

## 13. Perzistence dat

### 13.1 Proč IndexedDB

Progres této aplikace není jednoduchý seznam několika nastavení. Jde o:

- stovky až tisíce záznamů o vazbách
- historii chyb
- plán budoucích opakování
- snapshoty přehledů
- metadata relace

Proto je vhodná IndexedDB, nikoli localStorage. LocalStorage je vhodná spíše pro malé množství jednoduchých řetězcových hodnot, zatímco zde potřebujeme strukturované, indexovatelné a transakčně zapisované záznamy. IndexedDB je také vhodná pro klientské aplikace s většími a komplexními daty. 

### 13.2 Návrh lokální databáze

Doporučené objektové úložiště:

- uživatel
- stav znalostí
- záznamy záměn
- stav relace
- snapshoty pokroku
- technická metadata databáze

### 13.3 Migrační politika

Každá změna schématu databáze musí mít:

- číslo verze
- migrační krok
- test migrace
- fallback pro poškozenou nebo starou databázi

V případě neúspěšné migrace musí aplikace:

1. zálohovat čitelnou část dat
2. nabídnout bezpečné obnovení
3. neztratit obsah aplikace
4. jasně informovat, že došlo k obnově studijního úložiště

---

## 14. Offline architektura

### 14.1 Co musí fungovat offline

Po prvním načtení musí offline fungovat:

- spuštění aplikace
- domovská obrazovka
- všechny tři studijní režimy
- zobrazení lokálního pokroku
- opakování již známého obsahu
- záznam výsledků do lokální databáze

### 14.2 Co může vyžadovat online připojení

Pouze:

- načtení nové verze obsahu
- případná budoucí synchronizace mezi zařízeními
- stažení aktualizací aplikace

### 14.3 Strategie cache

Service worker bude cachovat:

- HTML shell
- JS bundle
- CSS
- obrázky a ikony
- manifest
- veřejné obsahové JSON balíčky

Obsahové balíčky budou aktualizovány opatrně, aby uživatel nepřišel o konzistenci mezi verzí obsahu a verzí progresu.

### 14.4 Aktualizační politika

Aplikace musí umět rozlišit:

- malou aktualizaci textů
- aktualizaci obsahových vazeb
- změnu struktury dat
- změnu logiky plánovače

Pokud se změní obsahové entity nebo vazby, musí se zkontrolovat, zda se nedotýkají lokálních záznamů progresu.

---

## 15. Architektura jednotlivých režimů

## 15.1 Atlas vazeb a studijních tras

### Účel

Budovat celkovou mapu oboru a učit studenta orientaci v síti vztahů.

### Potřebuje

- grafový přístup k datům
- filtrování podle disciplíny, období a typu vazby
- generátor tras
- vizuální přehled stavu zvládnutí uzlů a linií

### Technické požadavky

- efektivní načítání grafu
- memoizace odvozených struktur
- možnost postupného renderování větších map
- oddělení dat uzlu od prezentačního popisu

### Tok odpovědi

1. uživatel otevře trasu
2. modul vytvoří sadu úloh nad vazbami v trase
3. odpovědi se vyhodnotí
4. aktualizuje se stav vazeb
5. případně se vygeneruje doplňková Laboratoř

## 15.2 Detektivní spisy oboru

### Účel

Vést uživatele k hlubšímu vybavování a rekonstrukci souvislostí.

### Potřebuje

- sekvenční logiku indicií
- model obtížnosti
- pravidla pro odemykání nápověd
- závěrečnou syntézu případu

### Technické požadavky

- případ není jen text, ale strukturovaná sekvence
- stav rozehraného případu musí jít obnovit
- systém musí umět reagovat na chybný krok jinou navazující otázkou

## 15.3 Laboratoř rozlišení a slabých míst

### Účel

Opravovat konkrétní záměny a upevňovat jemné rozdíly.

### Potřebuje

- historii chyb uživatele
- kontrastní sady
- velmi rychlý cyklus vykreslení a vyhodnocení
- vysokou míru adaptivity

### Technické požadavky

- rychlé generování položek bez těžkých výpočtů při každém kliknutí
- prioritizace častých záměn
- krátké bloky vhodné pro mobil

---

## 16. Toky dat

## 16.1 Start aplikace

1. načtení shellu
2. registrace service workeru
3. načtení obsahové verze
4. otevření lokální databáze
5. obnova relace
6. výpočet doporučeného dnešního bloku
7. zobrazení domovské obrazovky

## 16.2 Vyřešení jedné úlohy

1. UI odešle odpověď do aplikační vrstvy
2. aplikační vrstva předá odpověď učebnímu jádru
3. jádro určí správnost a typ chyby
4. plánovač přepočítá další opakování
5. aktualizuje se lokální databáze
6. UI dostane české vysvětlení a další krok

## 16.3 Návrat po zavření aplikace

1. obnoví se relace
2. obnoví se poslední režim
3. načte se fronta dnešního opakování
4. uživatel dostane nabídku „pokračovat“ nebo „začít dnešní blok“

---

## 17. Stavová architektura

### 17.1 Co má být v globálním stavu

- aktivní uživatel
- načtený obsah
- aktivní režim
- aktuální relace
- přehled doporučeného dne
- výběry filtrů
- lehké UI preference

### 17.2 Co nemá být v globálním stavu

- velké historické záznamy odpovědí
- kompletní databázové záznamy
- odvozené datové struktury, které lze spočítat lokálně
- těžké dočasné výpočty

### 17.3 Zásada

Globální stav musí být malý a čitelný. Persistovaná pravda o progresu je v IndexedDB, nikoli v paměťovém store.

---

## 18. Bezpečnostní architektura

### 18.1 Hlavní hrozby

- XSS přes nebezpečné vykreslení textu
- nechtěné promítnutí interních dat do rozhraní
- poškození lokální databáze
- chybné zacházení s volitelnou synchronizací
- únik konfigurace při pozdějším doplnění serverové vrstvy

### 18.2 Obrana proti XSS

Závazná pravidla:

- žádné nekontrolované vkládání HTML
- žádné používání nebezpečných API pro vykreslení textu bez čištění
- všechny obsahové texty se vykreslují jako text
- pokud bude někdy nutné formátované HTML, projde nejprve sanitizací
- přísná Content Security Policy
- zákaz inline skriptů
- audit externích závislostí

### 18.3 Bezpečnost lokální perzistence

Ukládat se bude jen:

- pseudonymní identifikátor
- progres
- stav relace
- preference

Nebudou se ukládat:

- hesla
- osobní údaje
- tokeny třetích stran
- citlivá zdravotní nebo identifikační data

### 18.4 Integrita obsahu

Obsahové balíčky by měly být při buildu validovány:

- kontrola schématu
- kontrola duplicitních identifikátorů
- kontrola neplatných vazeb
- kontrola osamocených uzlů
- kontrola povinných polí

### 18.5 Bezpečnost při budoucí synchronizaci

Pokud se později doplní backend, platí:

- synchronizace až jako druhá fáze, ne nyní
- žádné session cookies bez jasného důvodu
- pokud cookies, tak jen bezpečně nastavené
- pokud token, tak krátce žijící a minimálně privilegovaný
- CSRF ochrana
- rate limiting
- audit log změn
- oddělení veřejné a neveřejné konfigurace

---

## 19. Soukromí a etika dat

Aplikace je určena studentům. Není důvod sbírat nadbytečná data.

### 19.1 Výchozí režim

Výchozí režim má být anonymní.

Student může:

- otevřít aplikaci
- učit se
- uložit si progres lokálně
- vracet se bez registrace

### 19.2 Pseudonymní režim

Volitelně lze zavést přezdívku, ale jen lokálně.

### 19.3 Co se nemá měřit

V první verzi neukládat:

- přesné osobní identifikátory
- reklamní profilování
- sledovací analytiku třetích stran
- chování mimo samotné studium

---

## 20. Provozní a build architektura

### 20.1 Build pipeline

Každý build musí obsahovat:

1. kontrolu typů
2. lint
3. validaci obsahových dat
4. jednotkové testy
5. sestavení produkčního balíčku
6. ověření PWA assetů

### 20.2 CI/CD

GitHub Actions doporučeně rozdělí workflow na:

- kontrolu pull requestu
- build hlavní větve
- nasazení produkce
- volitelně audit závislostí

### 20.3 Hosting

Pro první verzi doporučuji statický hosting:

- GitHub Pages
- Netlify
- Cloudflare Pages
- případně jiný statický hosting

Architektura nesmí být závislá na serveru.

---

## 21. Testovací architektura

## 21.1 Jednotkové testy

Testovat:

- plánovač opakování
- diagnostiku chyb
- generátory úloh
- migrace databáze
- validaci dat

## 21.2 Integrační testy

Testovat:

- tok odpovědi od UI po záznam progresu
- obnovu relace
- přechod mezi režimy
- chování při změně verze obsahu

## 21.3 End-to-end testy

Testovat:

- první spuštění
- návrat uživatele
- offline režim
- rozpracovaný detektivní případ
- Laboratoř po chybě v Atlasu

## 21.4 Obsahové testy

Každý obsahový balíček musí projít:

- kontrolou povinných vazeb
- kontrolou odkazů na neexistující entity
- kontrolou, že povinné osobnosti v aplikaci skutečně existují
- kontrolou, že kritické historické linie nejsou přerušené

To je důležité i proto, že zadání výslovně požaduje přítomnost jmen jako Braidwood, Sicard, Gallaudet, Clerc, Howe, Laura Bridgmanová, Helen Keller, Théodore Simon, Terman a Heller, která zdroj skutečně obsahuje v návazných historických a oborových souvislostech. fileciteturn10file0 fileciteturn11file0 fileciteturn10file4

---

## 22. Rozšiřitelnost

Architektura musí počítat s tím, že později může přibýt:

- další sada osobností
- další disciplíny
- nové režimy úloh
- tematické balíčky podle zkoušek
- režim pro vyučující
- export pokroku
- dobrovolná synchronizace mezi zařízeními

Rozšiřování musí probíhat tak, aby:

- nebylo nutné přepisovat prezentační vrstvu
- nebylo nutné měnit základní strukturu progresu
- bylo možné doplnit nové typy vazeb bez rozbití starých dat

---

## 23. Rizika a mitigace

### Riziko 1 – příliš obecný nebo volný obsahový model

**Důsledek**  
Nepůjde generovat přesné úlohy.

**Řešení**  
Přísná schémata dat, validace, povinné typy vazeb.

### Riziko 2 – příliš těžká architektura na první verzi

**Důsledek**  
Zpomalení projektu a zbytečné technické dluhy.

**Řešení**  
Bez backendu v první verzi. Bez administrace v první verzi. Bez synchronizace v první verzi.

### Riziko 3 – přelití interní terminologie do rozhraní

**Důsledek**  
Rušivý a nevhodný studijní zážitek.

**Řešení**  
Striktní oddělení textového registru rozhraní od interních názvů.

### Riziko 4 – špatně navržené migrace databáze

**Důsledek**  
Ztráta progresu.

**Řešení**  
Verzování schématu, migrační testy, bezpečný fallback.

### Riziko 5 – XSS přes dynamické texty

**Důsledek**  
Útok na lokální data nebo rozhraní.

**Řešení**  
Žádné neřízené HTML, sanitizace, CSP, audit renderovacích cest.

---

## 24. Architektonické rozhodnutí pro fázi realizace

### Finální rozhodnutí pro první implementaci

**Primární architektura**

- React
- TypeScript
- Vite
- React Router
- Zustand
- Dexie
- vite-plugin-pwa
- statické obsahové JSON balíčky
- žádný povinný backend

### Proč je to nejlepší volba pro tento projekt

Protože přesně odpovídá tomu, co aplikace skutečně potřebuje:

- jeden klient
- silnou lokální práci s daty
- adaptivní učení
- offline režim
- veřejný repozitář
- jednoduchý deploy
- rozšiřitelný, ale nepřekombinovaný základ

### Co se záměrně odkládá

Do první implementace nezařazovat:

- backend
- registraci účtů
- synchronizaci mezi zařízeními
- editaci obsahu přes webové rozhraní
- učitelský dashboard
- centrální analytiku třetích stran

To všechno lze doplnit později, ale není rozumné tím zatěžovat jádro první verze.

---

## 25. Výstup této fáze

Po této fázi je rozhodnuto:

- jaký stack se použije
- jaké budou běhové vrstvy
- jak se budou ukládat data
- jak bude fungovat adaptivní jádro
- jak se oddělí obsah, logika a rozhraní
- jak bude řešena offline vrstva
- jak bude řešena bezpečnost
- jaké jsou hranice první verze

Tento dokument je tedy určen jako přímý podklad pro **FÁZI 5 – struktura repozitáře a souborů**.

Do FÁZE 5 už nepůjdeme znovu rozhodovat, zda Vite nebo Next, zda backend nebo ne, ani zda localStorage nebo IndexedDB. To je touto architekturou uzavřeno.
