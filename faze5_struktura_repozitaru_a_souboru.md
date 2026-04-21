# FÁZE 5 – STRUKTURA REPOZITÁŘE A SOUBORŮ

## 1. Účel této fáze

Tento dokument navazuje na schválenou technickou architekturu a převádí ji do konkrétní struktury repozitáře. Cílem není jen vyjmenovat složky, ale rozdělit odpovědnosti tak, aby šlo v další fázi generovat soubory po logických blocích bez chaosu, bez monolitů a bez promíchání obsahu, logiky a rozhraní.

Tato struktura je navržena pro první implementační verzi aplikace postavené na:

- React
- TypeScript
- Vite
- React Router
- Zustand
- Dexie
- PWA vrstvě
- lokálním ukládání progresu v IndexedDB

Repozitář je navržen pro jednu ucelenou aplikaci se třemi režimy:

- Atlas vazeb a studijních tras
- Detektivní spisy oboru
- Laboratoř rozlišení a slabých míst

---

## 2. Hlavní zásady struktury repozitáře

### 2.1 Oddělení vrstev

Repozitář musí striktně oddělovat:

- zdrojový obsah
- sestavená aplikační data
- učební logiku
- perzistenci
- prezentační vrstvu
- testy
- build a validační skripty
- dokumentaci

### 2.2 Žádné „všechno v src“

Do složky `src` nepůjde všechno. Obsahová data, validační skripty, dokumentace a build utility musí mít vlastní jasné místo.

### 2.3 Jeden zdroj pravdy pro obsah

Obsah osobností a vazeb nesmí být duplikován napříč komponentami. Musí existovat jedna autorská vrstva a jedna sestavená runtime vrstva.

### 2.4 Prezentační čeština oddělená od interních názvů

Texty viditelné pro uživatele se nesmí skládat přímo v logických modulech. Musí být drženy odděleně, aby se do rozhraní nepropsaly interní technické názvy.

---

## 3. Doporučený strom repozitáře

```text
specialni-pedagogika-osobnosti-app/
├─ .github/
│  └─ workflows/
│     ├─ ci.yml
│     ├─ deploy.yml
│     └─ content-check.yml
├─ docs/
│  ├─ faze4_technicka_architektura_specialni_pedagogika.md
│  ├─ faze5_struktura_repozitaru_a_souboru.md
│  ├─ obsahovy_model.md
│  ├─ bezpecnostni_zasady.md
│  ├─ migrace_databaze.md
│  └─ decisions/
│     ├─ 001-volba-stacku.md
│     ├─ 002-indexeddb-a-dexie.md
│     └─ 003-bez-backendu-v1.md
├─ public/
│  ├─ manifest.webmanifest
│  ├─ icons/
│  │  ├─ icon-192.png
│  │  ├─ icon-512.png
│  │  └─ maskable-512.png
│  ├─ images/
│  │  ├─ app/
│  │  └─ learning/
│  └─ offline/
│     └─ offline-fallback.html
├─ content/
│  ├─ source/
│  │  ├─ mini-wikipedie-osobnosti/
│  │  │  ├─ persons.yaml
│  │  │  ├─ concepts.yaml
│  │  │  ├─ relations.yaml
│  │  │  ├─ paths.yaml
│  │  │  ├─ cases.yaml
│  │  │  └─ contrast_sets.yaml
│  │  └─ metadata/
│  │     ├─ disciplines.yaml
│  │     ├─ eras.yaml
│  │     └─ tags.yaml
│  ├─ built/
│  │  ├─ people.json
│  │  ├─ concepts.json
│  │  ├─ relations.json
│  │  ├─ paths.json
│  │  ├─ cases.json
│  │  ├─ contrast-sets.json
│  │  └─ content-version.json
│  └─ schemas/
│     ├─ person.schema.json
│     ├─ concept.schema.json
│     ├─ relation.schema.json
│     ├─ path.schema.json
│     ├─ case.schema.json
│     └─ contrast-set.schema.json
├─ scripts/
│  ├─ build-content.ts
│  ├─ validate-content.ts
│  ├─ check-required-figures.ts
│  ├─ generate-search-index.ts
│  └─ sync-docs.ts
├─ src/
│  ├─ app/
│  │  ├─ App.tsx
│  │  ├─ main.tsx
│  │  ├─ routes.tsx
│  │  ├─ providers/
│  │  │  ├─ AppProviders.tsx
│  │  │  ├─ RouterProvider.tsx
│  │  │  └─ ThemeProvider.tsx
│  │  └─ guards/
│  │     └─ contentReadyGuard.ts
│  ├─ assets/
│  │  ├─ styles/
│  │  │  ├─ globals.css
│  │  │  ├─ tokens.css
│  │  │  ├─ layout.css
│  │  │  └─ utilities.css
│  │  └─ illustrations/
│  ├─ components/
│  │  ├─ layout/
│  │  │  ├─ AppShell.tsx
│  │  │  ├─ Header.tsx
│  │  │  ├─ BottomNav.tsx
│  │  │  ├─ Sidebar.tsx
│  │  │  └─ ContentFrame.tsx
│  │  ├─ shared/
│  │  │  ├─ Button.tsx
│  │  │  ├─ Card.tsx
│  │  │  ├─ ProgressBadge.tsx
│  │  │  ├─ EmptyState.tsx
│  │  │  ├─ ErrorState.tsx
│  │  │  ├─ SectionTitle.tsx
│  │  │  └─ FilterChip.tsx
│  │  ├─ study/
│  │  │  ├─ AnswerFeedback.tsx
│  │  │  ├─ StudySessionHeader.tsx
│  │  │  ├─ NextStepCard.tsx
│  │  │  └─ ResumeCard.tsx
│  │  └─ charts/
│  │     ├─ ProgressRing.tsx
│  │     ├─ DisciplineBars.tsx
│  │     └─ WeaknessHeatmap.tsx
│  ├─ features/
│  │  ├─ home/
│  │  │  ├─ HomePage.tsx
│  │  │  ├─ home.selectors.ts
│  │  │  └─ home.presenter.ts
│  │  ├─ atlas/
│  │  │  ├─ AtlasPage.tsx
│  │  │  ├─ AtlasMap.tsx
│  │  │  ├─ AtlasFilters.tsx
│  │  │  ├─ AtlasPathPanel.tsx
│  │  │  ├─ atlas.selectors.ts
│  │  │  └─ atlas.presenter.ts
│  │  ├─ cases/
│  │  │  ├─ CasesPage.tsx
│  │  │  ├─ CaseBoard.tsx
│  │  │  ├─ CaseClueList.tsx
│  │  │  ├─ CaseSummary.tsx
│  │  │  ├─ cases.selectors.ts
│  │  │  └─ cases.presenter.ts
│  │  ├─ lab/
│  │  │  ├─ LabPage.tsx
│  │  │  ├─ ContrastDrill.tsx
│  │  │  ├─ QuickChoice.tsx
│  │  │  ├─ DifferenceHint.tsx
│  │  │  ├─ lab.selectors.ts
│  │  │  └─ lab.presenter.ts
│  │  ├─ progress/
│  │  │  ├─ ProgressPage.tsx
│  │  │  ├─ ProgressOverview.tsx
│  │  │  ├─ DisciplineProgress.tsx
│  │  │  ├─ WeaknessList.tsx
│  │  │  ├─ progress.selectors.ts
│  │  │  └─ progress.presenter.ts
│  │  ├─ review/
│  │  │  ├─ ReviewQueuePage.tsx
│  │  │  ├─ DueTodayList.tsx
│  │  │  └─ review.presenter.ts
│  │  ├─ onboarding/
│  │  │  ├─ OnboardingPage.tsx
│  │  │  ├─ ModeIntro.tsx
│  │  │  ├─ DisciplinePicker.tsx
│  │  │  └─ onboarding.presenter.ts
│  │  └─ settings/
│  │     ├─ SettingsPage.tsx
│  │     ├─ StorageSettings.tsx
│  │     ├─ PrivacySettings.tsx
│  │     └─ settings.presenter.ts
│  ├─ core/
│  │  ├─ content/
│  │  │  ├─ contentLoader.ts
│  │  │  ├─ contentIndex.ts
│  │  │  ├─ contentNormalizer.ts
│  │  │  └─ contentVersion.ts
│  │  ├─ graph/
│  │  │  ├─ graphBuilder.ts
│  │  │  ├─ graphQueries.ts
│  │  │  ├─ pathResolver.ts
│  │  │  └─ contrastResolver.ts
│  │  ├─ generators/
│  │  │  ├─ atlasTaskGenerator.ts
│  │  │  ├─ caseGenerator.ts
│  │  │  ├─ labTaskGenerator.ts
│  │  │  └─ explanationBuilder.ts
│  │  ├─ learning/
│  │  │  ├─ masteryEngine.ts
│  │  │  ├─ repetitionScheduler.ts
│  │  │  ├─ errorClassifier.ts
│  │  │  ├─ sessionPlanner.ts
│  │  │  └─ learningPolicy.ts
│  │  ├─ progress/
│  │  │  ├─ progressAggregator.ts
│  │  │  ├─ weaknessAnalyzer.ts
│  │  │  ├─ dailyPlanBuilder.ts
│  │  │  └─ snapshotBuilder.ts
│  │  └─ validation/
│  │     ├─ contentAssertions.ts
│  │     ├─ runtimeGuards.ts
│  │     └─ invariant.ts
│  ├─ db/
│  │  ├─ database.ts
│  │  ├─ migrations.ts
│  │  ├─ tables/
│  │  │  ├─ userProfileTable.ts
│  │  │  ├─ knowledgeStateTable.ts
│  │  │  ├─ confusionTable.ts
│  │  │  ├─ sessionStateTable.ts
│  │  │  ├─ progressSnapshotTable.ts
│  │  │  └─ metaTable.ts
│  │  ├─ repositories/
│  │  │  ├─ userProfileRepository.ts
│  │  │  ├─ knowledgeRepository.ts
│  │  │  ├─ confusionRepository.ts
│  │  │  ├─ sessionRepository.ts
│  │  │  └─ snapshotRepository.ts
│  │  └─ backup/
│  │     ├─ exportProgress.ts
│  │     └─ importProgress.ts
│  ├─ state/
│  │  ├─ appStore.ts
│  │  ├─ uiStore.ts
│  │  ├─ studyStore.ts
│  │  └─ selectors/
│  │     ├─ appSelectors.ts
│  │     ├─ studySelectors.ts
│  │     └─ progressSelectors.ts
│  ├─ services/
│  │  ├─ pwa/
│  │  │  ├─ registerServiceWorker.ts
│  │  │  └─ updateNotifier.ts
│  │  ├─ storage/
│  │  │  ├─ storageHealth.ts
│  │  │  └─ quotaMonitor.ts
│  │  └─ analytics/
│  │     └─ learningEvents.ts
│  ├─ locale/
│  │  ├─ cs/
│  │  │  ├─ common.json
│  │  │  ├─ home.json
│  │  │  ├─ atlas.json
│  │  │  ├─ cases.json
│  │  │  ├─ lab.json
│  │  │  ├─ progress.json
│  │  │  ├─ review.json
│  │  │  ├─ onboarding.json
│  │  │  └─ settings.json
│  │  ├─ i18n.ts
│  │  └─ messageResolver.ts
│  ├─ types/
│  │  ├─ content.ts
│  │  ├─ study.ts
│  │  ├─ progress.ts
│  │  ├─ database.ts
│  │  └─ ui.ts
│  ├─ utils/
│  │  ├─ dates.ts
│  │  ├─ arrays.ts
│  │  ├─ ids.ts
│  │  ├─ text.ts
│  │  ├─ numbers.ts
│  │  └─ assertions.ts
│  └─ vite-env.d.ts
├─ tests/
│  ├─ unit/
│  │  ├─ masteryEngine.test.ts
│  │  ├─ repetitionScheduler.test.ts
│  │  ├─ errorClassifier.test.ts
│  │  ├─ atlasTaskGenerator.test.ts
│  │  ├─ caseGenerator.test.ts
│  │  └─ labTaskGenerator.test.ts
│  ├─ integration/
│  │  ├─ atlas-flow.test.ts
│  │  ├─ cases-flow.test.ts
│  │  ├─ lab-flow.test.ts
│  │  ├─ progress-persistence.test.ts
│  │  └─ migration-flow.test.ts
│  ├─ e2e/
│  │  ├─ first-run.spec.ts
│  │  ├─ resume-session.spec.ts
│  │  ├─ offline-mode.spec.ts
│  │  └─ daily-review.spec.ts
│  └─ fixtures/
│     ├─ sample-content.ts
│     ├─ sample-progress.ts
│     └─ required-figures.ts
├─ .env.example
├─ .gitignore
├─ .nvmrc
├─ eslint.config.js
├─ index.html
├─ package.json
├─ tsconfig.json
├─ tsconfig.node.json
├─ vite.config.ts
├─ README.md
├─ SECURITY.md
└─ LICENSE
```

---

## 4. Odpovědnost jednotlivých částí repozitáře

## 4.1 `.github/`

### `.github/workflows/ci.yml`
Spouští lint, kontrolu typů, validaci obsahu a testy při každém pull requestu.

### `.github/workflows/deploy.yml`
Provádí build a nasazení produkční verze na vybraný statický hosting.

### `.github/workflows/content-check.yml`
Samostatný workflow pro validaci obsahových dat, aby šlo odhalit chyby i bez plného buildu UI.

---

## 4.2 `docs/`

Tato složka drží rozhodovací a architektonickou dokumentaci. Nemá obsahovat runtime data ani vývojové poznámky rozházené po repozitáři.

### `docs/faze4_technicka_architektura_specialni_pedagogika.md`
Schválená technická architektura, na kterou tato struktura přímo navazuje.

### `docs/faze5_struktura_repozitaru_a_souboru.md`
Tento dokument. Slouží jako přímý podklad pro další generování souborů.

### `docs/obsahovy_model.md`
Popis autorské datové vrstvy, obsahových entit, vazeb a validačních pravidel.

### `docs/bezpecnostni_zasady.md`
Praktická pravidla pro XSS ochranu, práci s lokálním uložištěm, konfigurací a budoucí synchronizací.

### `docs/migrace_databaze.md`
Zásady verzování a migrací IndexedDB, včetně způsobu obnovy při poškození dat.

### `docs/decisions/*`
Architektonické rozhodovací záznamy. Krátké dokumenty vysvětlující jednotlivá zásadní rozhodnutí, aby nebylo nutné je znovu otevírat ve chvíli, kdy projekt poroste.

---

## 4.3 `public/`

Veřejná statická část aplikace.

### `public/manifest.webmanifest`
Manifest PWA. Definuje název aplikace, ikony, chování po instalaci a barvy motivu.

### `public/icons/*`
Ikony pro instalaci aplikace a různé velikosti zařízení.

### `public/images/*`
Statické ilustrační obrázky, pokud budou součástí aplikace.

### `public/offline/offline-fallback.html`
Nouzová offline obrazovka pro situace, kdy se nenačte shell aplikace.

---

## 4.4 `content/`

Nejdůležitější netechnická vrstva projektu. Zde se odděluje autorský obsah od aplikačních dat.

### `content/source/`
Ručně spravovaná autorská vrstva.

#### `content/source/mini-wikipedie-osobnosti/persons.yaml`
Základní osobnosti. Každý záznam obsahuje jméno, období, oborové zařazení, stručný význam a kotvy pro další vazby.

#### `content/source/mini-wikipedie-osobnosti/concepts.yaml`
Pojmy, metody, testy, instituce, díla a systémy, které nejsou samostatnými osobnostmi, ale musí být samostatně modelovány.

#### `content/source/mini-wikipedie-osobnosti/relations.yaml`
Vztahy mezi osobnostmi a ostatními entitami. Klíčový soubor celé aplikace.

#### `content/source/mini-wikipedie-osobnosti/paths.yaml`
Kurátorské studijní trasy pro Atlas. Například historické linie nebo oborové osy.

#### `content/source/mini-wikipedie-osobnosti/cases.yaml`
Definice detektivních spisů.

#### `content/source/mini-wikipedie-osobnosti/contrast_sets.yaml`
Kontrastní a konfuzní sady pro Laboratoř.

#### `content/source/metadata/disciplines.yaml`
Definice disciplín, jejich pořadí, zobrazovaných názvů a popisů.

#### `content/source/metadata/eras.yaml`
Historická období a jejich zobrazení v aplikaci.

#### `content/source/metadata/tags.yaml`
Sdílené štítky pro třídění a filtrování.

### `content/built/`
Sestavená runtime data. Tuto vrstvu čte přímo aplikace.

#### `content/built/people.json`
Normalizovaný seznam osobností.

#### `content/built/concepts.json`
Normalizované pojmové entity.

#### `content/built/relations.json`
Runtime reprezentace vazeb.

#### `content/built/paths.json`
Studijní trasy.

#### `content/built/cases.json`
Sestavené detektivní spisy.

#### `content/built/contrast-sets.json`
Sady pro Laboratoř.

#### `content/built/content-version.json`
Verze obsahového balíčku. Používá se pro kontrolu kompatibility a cache.

### `content/schemas/`
Formální schémata dat. Každý obsahový typ má mít vlastní schéma.

---

## 4.5 `scripts/`

Skripty nejsou součást UI. Slouží k údržbě a přípravě dat.

### `scripts/build-content.ts`
Převede autorskou vrstvu do runtime JSON souborů.

### `scripts/validate-content.ts`
Ověří schémata, povinná pole, platnost vazeb a duplicity.

### `scripts/check-required-figures.ts`
Zkontroluje, že povinné osobnosti požadované zadáním jsou v datech skutečně přítomné.

### `scripts/generate-search-index.ts`
Volitelný skript pro generování lehkého indexu pro lokální vyhledávání.

### `scripts/sync-docs.ts`
Pomocný skript pro synchronizaci nebo kopírování vybraných dokumentů do složky `docs/`, pokud to bude potřeba v CI.

---

## 4.6 `src/app/`

Nejvyšší aplikační vrstva.

### `src/app/App.tsx`
Kořen aplikace. Skládá hlavní shell a aplikační poskytovatele.

### `src/app/main.tsx`
Vstupní bod klientské aplikace.

### `src/app/routes.tsx`
Centrální definice cest aplikace.

### `src/app/providers/*`
Centralizované zabalení routeru, tématu a dalších poskytovatelů, aby se nevkládali roztříštěně přímo do kořene.

### `src/app/guards/contentReadyGuard.ts`
Kontrola, že aplikace nespustí studijní režimy bez načtených dat.

---

## 4.7 `src/assets/`

Statické zdroje používané uvnitř aplikace.

### `src/assets/styles/*`
Globální styly, design tokeny, layoutová pravidla a pomocné utility.

Zásada je jednoduchá:
- globální pravidla zde
- specifické styly komponent co nejblíže komponentě, pokud bude projekt používat CSS moduly či podobný přístup

---

## 4.8 `src/components/`

Sdílené UI komponenty. Nesmí sem padat doménová logika.

### `layout/`
Konstrukční prvky rozhraní.

### `shared/`
Malé opakovaně použitelné komponenty.

### `study/`
Obecné studijní komponenty, které se používají napříč režimy.

### `charts/`
Vizualizace pokroku a slabých míst.

---

## 4.9 `src/features/`

Toto je hlavní vrstva obrazovek a režimů. Každá feature má své UI a tenkou prezentační logiku, ale neobsahuje jádro učebního systému.

### `src/features/home/`
Domovská obrazovka, doporučený dnešní blok, návrat do rozpracovaného studia.

### `src/features/atlas/`
Režim Atlas.

### `src/features/cases/`
Režim Detektivní spisy.

### `src/features/lab/`
Režim Laboratoř.

### `src/features/progress/`
Přehled pokroku.

### `src/features/review/`
Fronta opakování a dnešní plán.

### `src/features/onboarding/`
Úvodní nastavení a první průchod aplikací.

### `src/features/settings/`
Nastavení úložiště, soukromí a uživatelských preferencí.

Každá feature má doporučeně:
- stránku
- vnitřní komponenty
- selektory
- prezentační vrstvu

To pomůže oddělit vykreslení od skládání dat.

---

## 4.10 `src/core/`

Nejdůležitější technická část projektu. Zde žije učební a datová logika.

### `src/core/content/`
Načtení, indexace, normalizace a verze obsahových dat.

### `src/core/graph/`
Práce s grafem vztahů.

### `src/core/generators/`
Generátory úloh pro jednotlivé režimy a generátor vysvětlení.

### `src/core/learning/`
Adaptivní plánovač, klasifikace chyb, pravidla učební politiky a logika relací.

### `src/core/progress/`
Agregace pokroku a výpočet slabých míst.

### `src/core/validation/`
Runtime kontroly a invarianty.

Tato složka je technické jádro aplikace a musí zůstat přísně oddělená od UI.

---

## 4.11 `src/db/`

Vrstva lokální persistence.

### `src/db/database.ts`
Inicializace a otevření IndexedDB přes Dexie.

### `src/db/migrations.ts`
Migrace databázového schématu.

### `src/db/tables/*`
Definice jednotlivých úložišť.

### `src/db/repositories/*`
Repository vrstva pro čtení a zápis, aby Dexie neprotékala do celé aplikace.

### `src/db/backup/*`
Export a import progresu. Praktické i pro pozdější zálohy.

---

## 4.12 `src/state/`

Lehký globální stav aplikace.

### `src/state/appStore.ts`
Aplikační stav.

### `src/state/uiStore.ts`
Čistě rozhraní, například otevřené panely a filtry.

### `src/state/studyStore.ts`
Aktivní studijní relace v paměti.

### `src/state/selectors/*`
Selektory nad storem. Pomáhají udržet komponenty čisté.

---

## 4.13 `src/services/`

Technické služby, které nejsou doménovým jádrem.

### `src/services/pwa/*`
Registrace service workeru a hlášení nové verze aplikace.

### `src/services/storage/*`
Kontrola zdraví lokálního úložiště a hlídání kapacity.

### `src/services/analytics/learningEvents.ts`
Interní události aplikace. V první verzi bez třetích stran. Jen volitelná interní vrstva, aby bylo možné později analytiku rozumně doplnit.

---

## 4.14 `src/locale/`

Viditelné texty aplikace.

### `src/locale/cs/*.json`
Rozdělené české texty podle jednotlivých částí aplikace.

### `src/locale/i18n.ts`
Inicializace lokalizační vrstvy.

### `src/locale/messageResolver.ts`
Pomocná vrstva pro práci s texty.

Tato složka je zásadní pro to, aby se interní technické názvy nepropsaly do rozhraní.

---

## 4.15 `src/types/`

Sdílené TypeScript typy.

Rozdělení:
- obsah
- studijní logika
- progres
- databáze
- UI

---

## 4.16 `src/utils/`

Malé čisté utility bez doménové závislosti.

Sem nepatří učební logika ani logika progresu.

---

## 4.17 `tests/`

Samostatná testovací vrstva.

### `tests/unit/`
Čisté logické testy.

### `tests/integration/`
Testy toků mezi vrstvami.

### `tests/e2e/`
End-to-end scénáře uživatele.

### `tests/fixtures/`
Ukázková data a testovací sady.

---

## 4.18 Kořenové soubory

### `.env.example`
Příklad konfiguračních proměnných bez tajných údajů.

### `.gitignore`
Ignorované soubory.

### `.nvmrc`
Doporučená verze Node.js.

### `eslint.config.js`
Linting pravidla.

### `index.html`
HTML shell aplikace.

### `package.json`
Závislosti a skripty.

### `tsconfig.json`
TypeScript konfigurace.

### `vite.config.ts`
Konfigurace Vite a PWA pluginu.

### `README.md`
Základní popis projektu, spuštění, build, obsahové workflow.

### `SECURITY.md`
Bezpečnostní zásady a hlášení zranitelností.

### `LICENSE`
Licence repozitáře.

---

## 5. Návrh odpovědností jednotlivých souborů v klíčových blocích

Níže jsou nejdůležitější soubory, které budou mít přímý dopad na implementaci.

## 5.1 Obsahový model

### `content/source/mini-wikipedie-osobnosti/persons.yaml`
Autorský záznam osobností. Je to primární místo pro lidsky editovatelný obsah.

### `content/source/mini-wikipedie-osobnosti/relations.yaml`
Nejdůležitější obsahový soubor pro učební logiku, protože právě vazby umožní generovat trasy, spisy i kontrastní úlohy.

### `content/source/mini-wikipedie-osobnosti/cases.yaml`
Samostatný soubor proto, aby detektivní spisy nebyly „vytahovány“ z komponent nebo míchány do obecných tras.

### `content/source/mini-wikipedie-osobnosti/contrast_sets.yaml`
Samostatný soubor proto, aby Laboratoř mohla mít svůj přesný kontrastní materiál.

## 5.2 Učební jádro

### `src/core/graph/graphBuilder.ts`
Staví vnitřní graf vztahů z runtime dat.

### `src/core/generators/atlasTaskGenerator.ts`
Generuje úlohy pro Atlas.

### `src/core/generators/caseGenerator.ts`
Skládá detektivní spisy.

### `src/core/generators/labTaskGenerator.ts`
Generuje rychlé kontrastní bloky.

### `src/core/learning/repetitionScheduler.ts`
Rozhoduje, co se vrací k opakování a kdy.

### `src/core/learning/errorClassifier.ts`
Určuje typ chyby a umožňuje rozlišit, zda jde o chybu disciplíny, vazby, chronologie nebo záměny podobných osobností.

### `src/core/progress/weaknessAnalyzer.ts`
Překládá surové výsledky do přehledu slabých míst.

## 5.3 Perzistence

### `src/db/database.ts`
Jednotný vstup do lokální databáze.

### `src/db/migrations.ts`
Jednotné místo pro změny schématu.

### `src/db/repositories/knowledgeRepository.ts`
Čte a zapisuje stav znalostí.

### `src/db/repositories/confusionRepository.ts`
Spravuje historii záměn.

### `src/db/repositories/sessionRepository.ts`
Umožňuje návrat do přesného místa studia.

## 5.4 Rozhraní

### `src/features/home/HomePage.tsx`
Klíčová návratová obrazovka.

### `src/features/atlas/AtlasPage.tsx`
Vstup do hlavního mapového režimu.

### `src/features/cases/CasesPage.tsx`
Vstup do hlubšího vybavovacího režimu.

### `src/features/lab/LabPage.tsx`
Vstup do rychlého adaptivního režimu.

### `src/features/progress/ProgressPage.tsx`
Přehled pokroku a slabých míst.

---

## 6. Pořadí, v jakém se mají soubory generovat

Tato část je zásadní. Nejde generovat vše naráz. Níže je doporučené pořadí pro FÁZI 6.

## Blok 1 – základ projektu

Nejprve vytvořit:

1. `package.json`
2. `tsconfig.json`
3. `vite.config.ts`
4. `index.html`
5. `.gitignore`
6. `.env.example`
7. `src/app/main.tsx`
8. `src/app/App.tsx`
9. `src/app/routes.tsx`
10. `src/assets/styles/globals.css`

Důvod:
nejdřív musí vzniknout spustitelný základ a kostra routingu.

## Blok 2 – typy a obsahové schéma

Pak vytvořit:

1. `src/types/content.ts`
2. `src/types/study.ts`
3. `src/types/progress.ts`
4. `content/schemas/*`
5. `content/source/metadata/*`
6. `content/source/mini-wikipedie-osobnosti/persons.yaml`
7. `content/source/mini-wikipedie-osobnosti/concepts.yaml`
8. `content/source/mini-wikipedie-osobnosti/relations.yaml`

Důvod:
bez přesných typů a datové vrstvy nelze bezpečně stavět učební logiku.

## Blok 3 – build a validace obsahu

Pak vytvořit:

1. `scripts/validate-content.ts`
2. `scripts/build-content.ts`
3. `scripts/check-required-figures.ts`
4. `content/built/*`

Důvod:
nejdřív je nutné mít pipeline, která umí autorský obsah převést do provozní podoby.

## Blok 4 – lokální databáze a perzistence

Pak vytvořit:

1. `src/db/database.ts`
2. `src/db/migrations.ts`
3. `src/db/tables/*`
4. `src/db/repositories/*`
5. `src/types/database.ts`

Důvod:
adaptivní aplikace bez persistence nedává smysl.

## Blok 5 – učební jádro

Pak vytvořit:

1. `src/core/content/contentLoader.ts`
2. `src/core/graph/graphBuilder.ts`
3. `src/core/graph/graphQueries.ts`
4. `src/core/generators/atlasTaskGenerator.ts`
5. `src/core/generators/caseGenerator.ts`
6. `src/core/generators/labTaskGenerator.ts`
7. `src/core/learning/errorClassifier.ts`
8. `src/core/learning/repetitionScheduler.ts`
9. `src/core/learning/sessionPlanner.ts`
10. `src/core/progress/weaknessAnalyzer.ts`

Důvod:
teprve teď lze začít skládat reálnou učební logiku.

## Blok 6 – stav a aplikační orchestraci

Pak vytvořit:

1. `src/state/appStore.ts`
2. `src/state/uiStore.ts`
3. `src/state/studyStore.ts`
4. `src/app/providers/*`

Důvod:
až když existují data, databáze a jádro, lze rozumně navrhnout globální stav.

## Blok 7 – domovská obrazovka a společné komponenty

Pak vytvořit:

1. `src/components/layout/*`
2. `src/components/shared/*`
3. `src/components/study/*`
4. `src/features/home/*`
5. `src/locale/cs/common.json`
6. `src/locale/cs/home.json`

Důvod:
nejprve musí existovat stabilní sdílená vrstva rozhraní.

## Blok 8 – režim Atlas

Pak vytvořit:

1. `src/features/atlas/*`
2. `src/locale/cs/atlas.json`

Důvod:
Atlas je hlavní režim a bude nejvíc provázaný s grafem a trasami.

## Blok 9 – režim Detektivní spisy

Pak vytvořit:

1. `src/features/cases/*`
2. `src/locale/cs/cases.json`

## Blok 10 – režim Laboratoř

Pak vytvořit:

1. `src/features/lab/*`
2. `src/locale/cs/lab.json`

## Blok 11 – přehled pokroku a opakování

Pak vytvořit:

1. `src/features/progress/*`
2. `src/features/review/*`
3. `src/components/charts/*`
4. `src/locale/cs/progress.json`
5. `src/locale/cs/review.json`

## Blok 12 – onboarding a nastavení

Pak vytvořit:

1. `src/features/onboarding/*`
2. `src/features/settings/*`
3. `src/locale/cs/onboarding.json`
4. `src/locale/cs/settings.json`

## Blok 13 – PWA vrstva a provozní služby

Pak vytvořit:

1. `public/manifest.webmanifest`
2. `public/icons/*`
3. `src/services/pwa/*`
4. `public/offline/offline-fallback.html`

## Blok 14 – testy

Pak vytvořit:

1. `tests/fixtures/*`
2. `tests/unit/*`
3. `tests/integration/*`
4. `tests/e2e/*`

## Blok 15 – dokumentace repozitáře

Nakonec vytvořit:

1. `README.md`
2. `SECURITY.md`
3. `docs/obsahovy_model.md`
4. `docs/bezpecnostni_zasady.md`
5. `docs/migrace_databaze.md`

---

## 7. Co do první verze repozitáře záměrně nezařazovat

Aby struktura neztratila disciplínu, do první verze nezařazovat:

- `server/`
- `api/`
- `admin/`
- `cms/`
- `auth/`
- `teacher-dashboard/`
- externí analytické SDK
- synchronizaci mezi zařízeními
- generování obsahu přímo z komponent

Pokud některá z těchto oblastí vznikne později, má dostat vlastní samostatnou vrstvu, ne se „přilepit“ ke stávající struktuře.

---

## 8. Doporučení pro GitHub repozitář

Repozitář by měl obsahovat minimálně tyto standardy:

- srozumitelný `README.md`
- `SECURITY.md`
- `LICENSE`
- workflow pro kontrolu kvality
- dokumentaci architektonických rozhodnutí
- jasné oddělení autorského obsahu a runtime dat
- zákaz ukládání tajných údajů do repozitáře

Doporučené názvy větví:

- `main`
- `develop`
- krátkodobé feature větve

Doporučené commit oblasti:

- `content`
- `core`
- `db`
- `ui`
- `tests`
- `docs`

---

## 9. Shrnutí FÁZE 5

Tato struktura repozitáře je navržena tak, aby:

- odpovídala schválené technické architektuře
- umožnila bezpečnou a postupnou implementaci
- držela odděleně obsah, logiku, perzistenci a UI
- podporovala tři různé režimy jedné aplikace
- zabránila tomu, aby se technické názvy dostaly do uživatelské vrstvy
- umožnila v další fázi generovat soubory po blocích, ne chaoticky

Tento dokument je připraven jako přímý podklad pro FÁZI 6.
