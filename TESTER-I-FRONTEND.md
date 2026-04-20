## Bakgrund

Kursmål: "Testa med Jest och React Testing Library"
Stack: React + Vite
Verktyg: Vitest + React Testing Library (men studenterna ska veta skillnaden med Jest)
Koncept: Enhetstester, integrationstester, E2E-tester
Utforskande del: Cypress / Playwright


---

## Del 1: Teori

### Testpyramiden — de tre nivåerna

```
        /  E2E  \          Få, långsamma, testar hela flödet
       /----------\
      / Integration \      Mellanmånga, testar samspel
     /----------------\
    /   Enhetstester    \  Många, snabba, testar isolerade delar
   /____________________\
```

### 1. Enhetstester (Unit tests)

**Vad:** Testar en enskild funktion eller komponent i isolation. Inga beroenden till andra delar.

**Exempel:** En funktion `formatPrice(100)` ska returnera `"100 kr"`. Eller: en `<Button>` renderar rätt text.

```ts
// Ren funktion — enklaste enhetstest
test('formatPrice lägger till kr', () => {
  expect(formatPrice(100)).toBe('100 kr')
})
```

```tsx
// Komponent i isolation
test('Button visar rätt text', () => {
  render(<Button>Klicka</Button>)
  expect(screen.getByText('Klicka')).toBeInTheDocument()
})
```

**Kännetecken:**
- Supersnabba (millisekunder)
- Ingen nätverksaccess, ingen databas, inget DOM-beroende utöver JSDOM
- Om testet felar vet du exakt *var* felet är

### 2. Integrationstester

**Vad:** Testar att flera delar fungerar *tillsammans*. I React-världen handlar det oftast om att en komponent renderas med sina barn, hanterar state, anropar callbacks, och kanske mockar ett API-anrop.

**Exempel:** Ett `<LoginForm>` som validerar input, visar felmeddelanden, och anropar en submit-funktion.

```tsx
test('LoginForm visar felmeddelande vid tomt lösenord', async () => {
  const handleSubmit = vi.fn()
  render(<LoginForm onSubmit={handleSubmit} />)

  await userEvent.type(screen.getByLabelText('Email'), 'test@test.se')
  await userEvent.click(screen.getByRole('button', { name: 'Logga in' }))

  expect(screen.getByText('Lösenord krävs')).toBeInTheDocument()
  expect(handleSubmit).not.toHaveBeenCalled()
})
```

**Kännetecken:**
- Testar *samspelet* mellan komponenter/funktioner
- Fortfarande snabba (körs i JSDOM, inte en riktig webbläsare)
- Vanligast med React Testing Library — det är dess sweet spot
- Kan mocka API-anrop med t.ex. MSW (Mock Service Worker)

**Gränsen enhet vs integration** är flytande i React. Kent C. Dodds (skaparen av RTL) argumenterar att de flesta RTL-tester egentligen är integrationstester, och att det är bra — det ger mest "bang for the buck".

### 3. E2E-tester (End-to-end)

**Vad:** Testar hela applikationen från användarens perspektiv i en *riktig webbläsare*. Appen körs, backend körs (eller mockas), och testet klickar runt som en riktig användare.

**Verktyg:** Cypress eller Playwright.

```ts
// Cypress-exempel
it('användare kan logga in', () => {
  cy.visit('/login')
  cy.get('[data-testid="email"]').type('test@test.se')
  cy.get('[data-testid="password"]').type('hemligt123')
  cy.get('button[type="submit"]').click()
  cy.url().should('include', '/dashboard')
  cy.contains('Välkommen')
})
```

**Kännetecken:**
- Långsamma (sekunder per test)
- Kräver att appen körs
- Hittar buggar som inget annat hittar (routing, cookies, nätverksfel, CSS som döljer en knapp)
- Kan vara flaky (instabila) om man inte är noga

---

## Del 2: Jest vs Vitest — skillnaden

| | Jest | Vitest |
|---|---|---|
| **Skapad av** | Facebook/Meta | Evan You (Vite-teamet) |
| **Bundlare** | Egen transform (Babel) | Använder Vites transform (esbuild) |
| **Hastighet** | Bra, men långsammare startup | Snabbare, speciellt i Vite-projekt |
| **API** | `jest.fn()`, `jest.mock()` | `vi.fn()`, `vi.mock()` — nästan identiskt |
| **Konfiguration** | `jest.config.js` | `vitest.config.ts` (eller i `vite.config.ts`) |
| **ESM-stöd** | Krångligt, kräver Babel-config | Inbyggt, fungerar direkt |
| **HMR** | Nej | Ja — watch-mode kör bara ändrade tester |

**Nyckelinsikt:** Vitest är API-kompatibelt med Jest. Om man kan Vitest kan man Jest — det är i princip att byta `vi.fn()` till `jest.fn()`. Vitest valdes för att det fungerar sömlöst med Vite-setup.

---

## Del 3: React Testing Library (RTL) — filosofin

RTL är *inte* ett alternativ till Jest/Vitest. Det är ett **bibliotek för att rendera och interagera med React-komponenter** i tester. Det fungerar med både Jest och Vitest.

**Grundprincip:** *"The more your tests resemble the way your software is used, the more confidence they can give you."*

Det betyder:
- Välj element som användaren ser: `getByText`, `getByRole`, `getByLabelText`
- **Undvik** att välja på implementation: inte `getByClassName`, inte testa interna state-variabler
- Simulera riktiga interaktioner: `userEvent.click()`, `userEvent.type()`

### RTL Query-prioritering

| Prioritet | Query | När |
|---|---|---|
| 1 | `getByRole` | Knappar, inputs, headings — **alltid försök denna först** |
| 2 | `getByLabelText` | Formulärfält |
| 3 | `getByText` | Synlig text |
| 4 | `getByTestId` | Sista utvägen — kräver `data-testid` i JSX |

> "Om ni inte kan hitta elementet med `getByRole` — fundera på om er komponent har tillgänglighetsproblem."

### Sammanfattning — vad som testar vad

```
Vitest            = Test runner (kör tester, assertions, mocking)
RTL               = Renderar React-komponenter + ger queries
@testing-library/user-event = Simulerar användarinteraktion
jsdom             = Simulerad webbläsarmiljö (ingen riktig browser)
MSW               = Mockar nätverksanrop
Cypress/Playwright = Kör tester i riktig webbläsare (E2E)
```

---

## Del 4: Föreläsningsplan (~90 min)

### Del 1 — Varför testa? (10 min)

Öppna med ett scenario:
> "Ni har byggt en e-handel. Ni ändrar prisuträkningen. Allt ser bra ut. Ni pushar. Kunden ringer — alla priser visar 0 kr."

Visa testpyramiden. Förklara varje nivå kort.

### Del 2 — Enhetstester med Vitest (20 min)

Livekoda en util-funktion + test:

```ts
// utils/formatPrice.ts
export function formatPrice(price: number): string {
  return `${price.toFixed(2)} kr`
}
```

```ts
// utils/formatPrice.test.ts
import { describe, it, expect } from 'vitest'
import { formatPrice } from './formatPrice'

describe('formatPrice', () => {
  it('formaterar ett heltal', () => {
    expect(formatPrice(100)).toBe('100.00 kr')
  })

  it('formaterar decimaler', () => {
    expect(formatPrice(49.9)).toBe('49.90 kr')
  })

  it('hanterar 0', () => {
    expect(formatPrice(0)).toBe('0.00 kr')
  })
})
```

Koncept att peka ut:
- `describe` — grupperar relaterade tester
- `it` / `test` — ett enskilt testfall
- `expect(...).toBe(...)` — assertion (påstående)
- AAA-mönstret: **Arrange** (setup), **Act** (kör), **Assert** (verifiera)

Visa mocking:
```ts
import { vi } from 'vitest'

const mockFn = vi.fn()
mockFn('hello')
expect(mockFn).toHaveBeenCalledWith('hello')
```

Visa Jest-jämförelse sida vid sida:
```
Vitest              Jest
────────            ────────
vi.fn()             jest.fn()
vi.mock()           jest.mock()
vi.spyOn()          jest.spyOn()
vitest.config.ts    jest.config.js
import från vitest  Globalt (eller import)
```

### Del 3 — Integrationstester med RTL (30 min)

Huvuddelen. Börja med att förklara verktygen innan ni livekodar:

#### render, screen och userEvent — vad gör de?

**`render`** — Renderar en React-komponent i en simulerad DOM (jsdom). Utan detta finns ingen komponent att testa.

```tsx
render(<Balance transactions={[]} />)
// Nu finns komponentens HTML i en virtuell DOM
```

**`screen`** — Ger tillgång till den renderade DOM:en. Det är genom `screen` man hittar element — ungefär som `document.querySelector`, men med mer användarvänliga metoder.

```tsx
screen.getByText('Balans')        // Hitta element med texten "Balans"
screen.getByRole('button')        // Hitta en knapp
screen.getByLabelText('Email')    // Hitta input kopplad till en label
```

**`userEvent`** — Simulerar riktiga användarinteraktioner — klick, tangentbordsinmatning, etc. Beter sig som en riktig användare (till skillnad från `fireEvent` som bara triggar ett enskilt DOM-event).

```tsx
await userEvent.click(screen.getByRole('button'))            // Klicka
await userEvent.type(screen.getByLabelText('Namn'), 'Anna') // Skriva text
await userEvent.selectOptions(select, 'income')              // Välja i dropdown
```

**Hur de hänger ihop — visa flödet:**

```tsx
// 1. Rendera komponenten
render(<TransactionForm onAddTransaction={vi.fn()} />)

// 2. Hitta element via screen
const input = screen.getByLabelText('Beskrivning')

// 3. Interagera via userEvent
await userEvent.type(input, 'Lunch')

// 4. Verifiera resultatet via screen + expect
expect(screen.getByDisplayValue('Lunch')).toBeInTheDocument()
```

> "render skapar DOM:en, screen läser den, userEvent interagerar med den, expect verifierar den."

#### Livekoda Counter-komponent + tester:

```tsx
// components/Counter.tsx
import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)
  return (
    <div>
      <p>Antal: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Öka</button>
      <button onClick={() => setCount(0)}>Nollställ</button>
    </div>
  )
}
```

```tsx
// components/Counter.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { Counter } from './Counter'

describe('Counter', () => {
  it('visar 0 från start', () => {
    render(<Counter />)
    expect(screen.getByText('Antal: 0')).toBeInTheDocument()
  })

  it('ökar vid klick', async () => {
    render(<Counter />)
    await userEvent.click(screen.getByRole('button', { name: 'Öka' }))
    expect(screen.getByText('Antal: 1')).toBeInTheDocument()
  })

  it('nollställer räknaren', async () => {
    render(<Counter />)
    await userEvent.click(screen.getByRole('button', { name: 'Öka' }))
    await userEvent.click(screen.getByRole('button', { name: 'Öka' }))
    await userEvent.click(screen.getByRole('button', { name: 'Nollställ' }))
    expect(screen.getByText('Antal: 0')).toBeInTheDocument()
  })
})
```

Visa mer realistiskt integrationstest — formulär:
```tsx
test('skickar formuläret med giltig data', async () => {
  const onSubmit = vi.fn()
  render(<ContactForm onSubmit={onSubmit} />)

  await userEvent.type(screen.getByLabelText('Namn'), 'Anna')
  await userEvent.type(screen.getByLabelText('Email'), 'anna@test.se')
  await userEvent.click(screen.getByRole('button', { name: 'Skicka' }))

  expect(onSubmit).toHaveBeenCalledWith({
    name: 'Anna',
    email: 'anna@test.se'
  })
})
```

Förklara skillnaden enhets- vs integrationstest:
> "Counter-testet ovan — är det enhet eller integration? Det renderar EN komponent men testar samspelet mellan state, render och user events. Det lutar åt integration. Och det är okej — RTL uppmuntrar det."

### Del 4 — E2E med Cypress/Playwright (15 min)

Kort intro. Skillnaden mot RTL:

| | RTL (Vitest) | Cypress / Playwright |
|---|---|---|
| Miljö | jsdom (simulerad) | Riktig webbläsare |
| Hastighet | Snabb (ms) | Långsam (sekunder) |
| Vad testas | Komponent-logik | Hela appen end-to-end |
| Kräver | Inget | Appen måste köras |

Cypress-exempel:
```ts
describe('Produktsida', () => {
  it('lägger till en produkt i varukorgen', () => {
    cy.visit('/products')
    cy.contains('T-shirt').click()
    cy.get('[data-testid="add-to-cart"]').click()
    cy.get('[data-testid="cart-count"]').should('have.text', '1')
  })
})
```

### Del 5 — Setup & Verktygskedjan (10 min)

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event jsdom
```

```ts
// vite.config.ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
```

```ts
// src/test/setup.ts
import '@testing-library/jest-dom/vitest'
```

```json
// package.json
"scripts": {
  "test": "vitest",
  "test:run": "vitest run"
}
```

`npm test` startar watch mode, `npm run test:run` kör en gång.

### Del 6 — Sammanfattning & Frågor (5 min)

Nyckelbudskap:
1. Testa *beteende*, inte *implementation*
2. RTL-queries: `getByRole` först, `getByTestId` sist
3. Vitest ≈ Jest med bättre Vite-integration
4. De flesta React-tester hamnar mellan enhet och integration — det är rätt nivå
5. E2E kompletterar, men ersätter inte komponenttester

---

## Del 5: Kodbasen — Budgetplaneraren

### Varför budgetplanerare?

- **Rena util-funktioner** (beräkna summa, formatera valuta, kategorisera) → tydliga enhetstester
- **Formulär med validering** (lägg till transaktion) → integrationstester med RTL
- **Lista med filtrering/sortering** → integrationstester
- **State-hantering** (transaktioner, balans) → testar samspel mellan komponenter
- Konceptet är enkelt att förstå utan domänkunskap

### Projektstruktur

```
src/
├── types.ts                          # Transaction, Category, TransactionType
├── utils/
│   ├── formatCurrency.ts             # formatCurrency(amount) → "100.00 kr"
│   ├── calculations.ts               # calculateTotal, calculateTotalByType, calculateByCategory
│   ├── filterTransactions.ts         # filterTransactions(transactions, filters)
│   └── __tests__/
│       └── formatCurrency.test.ts    # ETT exempeltest (visar att setup fungerar)
├── components/
│   ├── TransactionForm.tsx           # Formulär med validering
│   ├── TransactionList.tsx           # Lista med ta-bort-knappar
│   ├── TransactionFilter.tsx         # Sök + filter (typ/kategori)
│   └── Balance.tsx                   # Visar balans, inkomster, utgifter
├── App.tsx                           # Sammansatt app med state
├── App.css                           # Styling
├── main.tsx                          # Entry point
└── test/
    └── setup.ts                      # Vitest + jest-dom setup
```

### Vad studenterna ska testa (3 nivåer)

| Nivå | Fil(er) | Typ av test |
|---|---|---|
| **Enhet** | `formatCurrency.ts`, `calculations.ts`, `filterTransactions.ts` | Rena funktioner, inga komponenter |
| **Integration** | `TransactionForm.tsx`, `TransactionList.tsx`, `Balance.tsx` | RTL — rendera, interagera, verifiera |
| **Integration+** | `TransactionFilter.tsx` + `TransactionList.tsx` via `App.tsx` | Filtrering påverkar listan |

---

## Del 6: Labbinstruktioner

Se filen `LABB.md` för fullständiga labbinstruktioner med:
- Steg-för-steg-uppgifter för Del 1 (enhetstester), Del 2 (integrationstester), Del 3 (VG-uppgifter)
- Kodtips och exempelkod
- Bedömningskriterier (G / VG)
- Resurslänkar
