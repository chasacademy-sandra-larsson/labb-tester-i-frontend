# 🌍 E2E-testning — Cypress och Playwright

## Vad är E2E-testning?

End-to-end (E2E) tester verifierar hela applikationen från en användares perspektiv. Till skillnad från enhetstester och komponenttester körs E2E-tester i en **riktig webbläsare** — appen startas, testet navigerar, klickar, fyller i formulär och kontrollerar att allt fungerar ihop.

```
Enhetstester       → Testar en funktion
Komponenttester    → Testar en komponent (simulerad DOM)
E2E-tester         → Testar hela appen (riktig webbläsare)
```

## Varför E2E?

E2E-tester hittar buggar som andra tester missar:

- Routing fungerar inte
- CSS döljer en knapp så användaren inte kan klicka
- Cookies eller localStorage beter sig oväntat
- API-anrop misslyckas i produktion
- Formulär submittar inte korrekt i riktig webbläsare

## Nackdelar med E2E

- **Långsamma** — sekunder per test istället för millisekunder
- **Flaky** — kan misslyckas slumpmässigt (nätverkslatens, animationer, timing)
- **Kräver att appen körs** — en riktig server måste vara igång

Därför skriver man **få** E2E-tester för de viktigaste flödena, inte för varje detalj.

---

## 🌲 Cypress

### Vad är Cypress?

Cypress är ett E2E-testverktyg med en visuell testrunner. Du ser testerna köras live i webbläsaren och kan "resa i tiden" genom varje steg.

### Installation

```bash
npm install -D cypress
npx cypress open
```

Första gången öppnas en guide där du väljer "E2E Testing" och en webbläsare.

### TypeScript-stöd

Skapa `cypress/tsconfig.json` så att TypeScript känner igen `cy`, `describe`, `it` etc:

```json
{
  "compilerOptions": {
    "target": "es2023",
    "lib": ["es2023", "dom"],
    "types": ["cypress"]
  },
  "include": ["**/*.ts"]
}
```

Utan denna fil blir allt rödmarkerat i editorn.

### Filstruktur

```
cypress/
├── e2e/
│   └── budget.cy.ts       # Dina testfiler
├── support/
│   └── commands.ts         # Egna kommandon (valfritt)
└── fixtures/               # Testdata (valfritt)
```

### Skriva ett test

```ts
// cypress/e2e/budget.cy.ts

describe('Budgetplaneraren', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173')
  })

  it('visar rubriken', () => {
    cy.contains('Budgetplaneraren')
  })

  it('kan lägga till en transaktion', () => {
    cy.get('#description').type('Gym')
    cy.get('#amount').type('299')
    cy.get('button[type="submit"]').click()

    cy.contains('Gym')
    cy.contains('-299.00 kr')
  })

  it('kan ta bort en transaktion', () => {
    cy.contains('Netflix').should('exist')
    cy.get('[aria-label="Ta bort Netflix"]').click()
    cy.contains('Netflix').should('not.exist')
  })

  it('kan filtrera transaktioner', () => {
    cy.get('#search').type('Hyra')
    cy.contains('Hyra').should('exist')
    cy.contains('Netflix').should('not.exist')
  })
})
```

### Köra tester

```bash
# Visuell testrunner (rekommenderat under utveckling)
npx cypress open

# Headless i terminalen (för CI)
npx cypress run
```

### Vanliga Cypress-kommandon

| Kommando | Vad det gör |
|---|---|
| `cy.visit(url)` | Navigera till en URL |
| `cy.get(selector)` | Hitta element med CSS-selektor |
| `cy.contains(text)` | Hitta element som innehåller text |
| `.type('text')` | Skriv text i ett fält |
| `.click()` | Klicka på ett element |
| `.should('exist')` | Verifiera att elementet finns |
| `.should('not.exist')` | Verifiera att elementet inte finns |
| `.should('have.text', 'X')` | Verifiera textinnehåll |
| `.should('have.value', 'X')` | Verifiera input-värde |
| `.select('option')` | Välja i dropdown |

### Cypress tips

- **Starta appen först** — Cypress besöker din körande app, den startar den inte åt dig
- **Använd `data-testid` sparsamt** — `cy.contains()` och `cy.get('[aria-label="..."]')` är mer läsbara
- **Undvik `cy.wait()`** — Cypress väntar automatiskt på element, använd `.should()` istället

---

## 🎭 Playwright

### Vad är Playwright?

Playwright är ett E2E-testverktyg från Microsoft. Det stödjer flera webbläsare (Chromium, Firefox, WebKit) och kan köra tester parallellt.

### Installation

```bash
npm install -D @playwright/test
npx playwright install
```

### Filstruktur

```
tests/
└── budget.spec.ts          # Dina testfiler
playwright.config.ts        # Konfiguration
```

### Konfiguration

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:5173',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },
})
```

Med `webServer` startar Playwright appen automatiskt innan testerna körs.

### Skriva ett test

```ts
// tests/budget.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Budgetplaneraren', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('visar rubriken', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Budgetplaneraren' })).toBeVisible()
  })

  test('kan lägga till en transaktion', async ({ page }) => {
    await page.getByLabel('Beskrivning').fill('Gym')
    await page.getByLabel('Belopp (kr)').fill('299')
    await page.getByRole('button', { name: 'Lägg till' }).click()

    await expect(page.getByText('Gym')).toBeVisible()
    await expect(page.getByText('-299.00 kr')).toBeVisible()
  })

  test('kan ta bort en transaktion', async ({ page }) => {
    await expect(page.getByText('Netflix')).toBeVisible()
    await page.getByRole('button', { name: 'Ta bort Netflix' }).click()
    await expect(page.getByText('Netflix')).not.toBeVisible()
  })

  test('kan filtrera transaktioner', async ({ page }) => {
    await page.getByLabel('Sök').fill('Hyra')
    await expect(page.getByText('Hyra')).toBeVisible()
    await expect(page.getByText('Netflix')).not.toBeVisible()
  })
})
```

### Köra tester

```bash
# Headless i terminalen
npx playwright test

# Med synlig webbläsare
npx playwright test --headed

# Visuell UI-mode (liknande Cypress)
npx playwright test --ui

# Visa rapport efter körning
npx playwright show-report
```

### Vanliga Playwright-kommandon

| Kommando | Vad det gör |
|---|---|
| `page.goto(url)` | Navigera till en URL |
| `page.getByRole('button', { name: 'X' })` | Hitta element via roll |
| `page.getByLabel('X')` | Hitta input via label |
| `page.getByText('X')` | Hitta element via text |
| `.fill('text')` | Skriv text i ett fält (rensar först) |
| `.click()` | Klicka på ett element |
| `expect(locator).toBeVisible()` | Verifiera att elementet syns |
| `expect(locator).not.toBeVisible()` | Verifiera att elementet inte syns |
| `expect(locator).toHaveText('X')` | Verifiera textinnehåll |
| `.selectOption('value')` | Välja i dropdown |

### Playwright tips

- **`webServer`-config** startar appen automatiskt — du slipper göra det manuellt
- **Playwright auto-väntar** på element precis som Cypress
- **`getByRole` och `getByLabel`** — samma filosofi som RTL, testa som en användare

---

## 🔍 Cypress vs Playwright — jämförelse

| | Cypress | Playwright |
|---|---|---|
| **Skapad av** | Cypress.io | Microsoft |
| **Webbläsare** | Chromium (+ Firefox, WebKit experimentellt) | Chromium, Firefox, WebKit (fullt stöd) |
| **Syntax** | Kedjad: `cy.get().type().click()` | Async/await: `await page.fill()` |
| **Auto-start av app** | Nej (starta manuellt) | Ja (via `webServer`-config) |
| **Parallella tester** | Betalt (Cypress Cloud) | Gratis och inbyggt |
| **Visuell testrunner** | Ja (inbyggd, stark) | Ja (UI-mode) |
| **Tidsresefunktion** | Ja (steg-för-steg i GUI) | Ja (trace viewer) |
| **API-stil** | Egen kedjad syntax | Liknar RTL (`getByRole`, `getByLabel`) |
| **Lärande kurva** | Lättare att komma igång | Lite mer setup, mer kraftfullt |
| **Populäritet** | Mycket populärt, stort community | Växer snabbt, används alltmer |

### Vilken ska man välja?

- **Cypress** — Enklare att komma igång. Bra visuell upplevelse. Populärt i React-ekosystemet.
- **Playwright** — Stödjer fler webbläsare. Gratis parallellkörning. Syntaxen liknar RTL (`getByRole`, `getByLabel`) vilket gör övergången smidigare.

Båda är bra val. I denna kurs är det utforskande — prova den som intresserar dig mest.

---

## 🔄 RTL vs E2E — sammanfattning

| | RTL (Vitest) | Cypress / Playwright |
|---|---|---|
| **Miljö** | jsdom (simulerad) | Riktig webbläsare |
| **Hastighet** | Snabb (millisekunder) | Långsam (sekunder) |
| **Vad testas** | Komponent-logik | Hela appen end-to-end |
| **Kräver** | Inget — körs i terminalen | Appen måste köras |
| **Bäst för** | Formulärvalidering, callbacks, rendering | Navigering, hela flöden, visuella buggar |
| **Antal tester** | Många | Få (viktigaste flödena) |
