# 💻 Laboration: Tester i frontend

## 🎯 Kursmål

Testa med Jest och React Testing Library.

## 📖 Introduktion

I denna laboration ska du skriva automatiserade tester för en befintlig React-applikation — **Budgetplaneraren**. Appen låter användaren lägga till inkomster och utgifter, se sin balans, och filtrera transaktioner.

Du ska skriva **enhetstester** och **integrationstester** med Vitest och React Testing Library (RTL). Koden är redan skriven — din uppgift är att testa den.

## 🚀 Kom igång

### 1. Klona repot och gå till starter-mappen

```bash
cd starter
```

### 2. Installera beroenden

```bash
npm install
```

### 3. Verifiera att allt fungerar

```bash
# Starta appen (för att utforska den)
npm run dev

# Kör tester en gång
npm run test:run
```

Det finns redan ETT exempeltest i `src/utils/__tests__/formatCurrency.test.ts`. Kör `npm run test:run` och verifiera att det passerar innan du går vidare.

Utforska appen i webbläsaren innan du börjar skriva tester. Förstå vad den gör ur en användares perspektiv.

> Vitest, React Testing Library och alla konfigurationsfiler är redan uppsatta åt dig. Vill du förstå vad som konfigurerades, se `SETUP.md`.

## 📂 Befintliga filer du ska testa

```
src/
├── utils/
│   ├── formatCurrency.ts         # Formaterar belopp till "X.XX kr"
│   ├── calculations.ts           # calculateTotal, calculateTotalByType, calculateByCategory
│   └── filterTransactions.ts     # filterTransactions — filtrerar på typ, kategori, sökterm
├── components/
│   ├── TransactionForm.tsx       # Formulär för att lägga till transaktion
│   ├── TransactionList.tsx       # Visar lista med transaktioner
│   ├── TransactionFilter.tsx     # Sök och filtreringskontroller
│   └── Balance.tsx               # Visar balans, inkomster, utgifter
```

## 📁 Var ska testfilerna ligga?

Placera dina testfiler enligt detta mönster:

- Util-tester: `src/utils/__tests__/filnamn.test.ts`
- Komponenttester: `src/components/__tests__/Komponent.test.tsx`

---


## ✅ Del 1 — Enhetstester

Skriv enhetstester för de tre util-filerna. Dessa är rena funktioner utan React-beroenden.

### 1.1 formatCurrency

Fil: `src/utils/__tests__/formatCurrency.test.ts` (utöka det befintliga testet)

Testa att funktionen:

- Formaterar heltal korrekt (t.ex. `100` → `"100.00 kr"`)
- Formaterar decimaltal korrekt (t.ex. `49.9` → `"49.90 kr"`)
- Hanterar `0`
- Hanterar negativa tal

### 1.2 calculations

Fil: `src/utils/__tests__/calculations.test.ts`

Du behöver skapa testdata — en array med `Transaction`-objekt. Se `src/types.ts` för typdefinitionen.

**Tips:** Skapa en `const` med testdata högst upp i filen, t.ex:

```ts
const testTransactions: Transaction[] = [
  {
    id: '1',
    description: 'Lön',
    amount: 25000,
    type: 'income',
    category: 'salary',
    date: '2025-04-01',
  },
  {
    id: '2',
    description: 'Hyra',
    amount: 8000,
    type: 'expense',
    category: 'housing',
    date: '2025-04-01',
  },
  // Lägg till fler...
]
```

Testa:

**calculateTotal**
- Returnerar korrekt balans (inkomster minus utgifter)
- Returnerar `0` för en tom array
- Hanterar enbart inkomster
- Hanterar enbart utgifter

**calculateTotalByType**
- Summerar korrekt för `'income'`
- Summerar korrekt för `'expense'`
- Returnerar `0` om inga transaktioner matchar typen

**calculateByCategory**
- Returnerar ett objekt med rätt summor per kategori
- Räknar bara utgifter (inte inkomster)
- Returnerar `0` för kategorier utan transaktioner

### 1.3 filterTransactions ⭐ Bonusuppgift

Fil: `src/utils/__tests__/filterTransactions.test.ts`

Testa:

- Returnerar alla transaktioner om inga filter är satta (`{}`)
- Filtrerar på `type` (`'income'` / `'expense'`)
- Filtrerar på `category`
- Filtrerar på `searchTerm` (ska vara case-insensitive)
- Kombinerar flera filter samtidigt
- Returnerar tom array om inget matchar

---

## ⚛️ Del 2 — Komponenttester med RTL

Nu testar du React-komponenter. Här använder du `render`, `screen`, och `userEvent` från Testing Library.

**Viktiga imports:**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
```

### 2.1 Balance

Fil: `src/components/__tests__/Balance.test.tsx`

Testa att komponenten:

- Visar korrekt balans baserat på transaktioner
- Visar total inkomst
- Visar total utgift
- Visar `"0.00 kr"` för alla värden om transaktionslistan är tom

**Tips:** Rendera med `render(<Balance transactions={testTransactions} />)` och använd `screen.getByText()` för att hitta de renderade värdena.

### 2.2 TransactionList ⭐ Bonusuppgift

Fil: `src/components/__tests__/TransactionList.test.tsx`

Testa att komponenten:

- Visar meddelandet `"Inga transaktioner att visa"` när listan är tom
- Renderar alla transaktioner i listan
- Visar beskrivning, belopp och kategori för varje transaktion
- Anropar `onDeleteTransaction` med rätt `id` när man klickar "Ta bort"

**Tips för delete-testet:**

```tsx
const mockDelete = vi.fn()
render(<TransactionList transactions={data} onDeleteTransaction={mockDelete} />)

await userEvent.click(screen.getByRole('button', { name: 'Ta bort Hyra' }))
expect(mockDelete).toHaveBeenCalledWith('2')
```

### 2.3 TransactionForm ⭐ Bonusuppgift

Fil: `src/components/__tests__/TransactionForm.test.tsx`

Testa att komponenten:

- Renderar alla formulärfält (beskrivning, belopp, typ, kategori)
- Visar felmeddelande `"Beskrivning krävs"` vid tom beskrivning
- Visar felmeddelande `"Ange ett giltigt belopp större än 0"` vid ogiltigt belopp
- Anropar `onAddTransaction` med korrekt data vid giltig input
- Rensar formuläret efter lyckad submit

**Tips för formulärinteraktion:**

```tsx
const mockAdd = vi.fn()
render(<TransactionForm onAddTransaction={mockAdd} />)

await userEvent.type(screen.getByLabelText('Beskrivning'), 'Lunch')
await userEvent.type(screen.getByLabelText('Belopp (kr)'), '85')
await userEvent.click(screen.getByRole('button', { name: 'Lägg till' }))

expect(mockAdd).toHaveBeenCalledTimes(1)
expect(mockAdd).toHaveBeenCalledWith(
  expect.objectContaining({
    description: 'Lunch',
    amount: 85,
    type: 'expense',
    category: 'other',
  })
)
```

### 2.4 TransactionFilter ⭐ Bonusuppgift

Fil: `src/components/__tests__/TransactionFilter.test.tsx`

Testa att komponenten:

- Sökfältet anropar `onFilterChange` med rätt `searchTerm`
- Typ-dropdown anropar `onFilterChange` med rätt `type`
- Kategori-dropdown anropar `onFilterChange` med rätt `category`

### 2.5 App-komponenten — integrationstest ⭐ Bonusuppgift

Fil: `src/__tests__/App.test.tsx`

Skriv tester som renderar hela `App`-komponenten och verifierar att:

- De fördefinierade transaktionerna visas
- Man kan lägga till en ny transaktion via formuläret och se den i listan
- Man kan ta bort en transaktion och se att den försvinner
- Filtrering fungerar (sök på text och se att listan uppdateras)

**Obs:** Dessa tester är mer komplexa eftersom flera komponenter samverkar. Du behöver inte mocka något — rendera bara `<App />`.

**Tips:** Om `getByText` hittar flera element (t.ex. "Lön" finns som både beskrivning och kategori-label) kan du använda `within()` för att begränsa sökningen:

```tsx
import { within } from '@testing-library/react'

const list = screen.getByRole('list')
expect(within(list).getByText('Hyra')).toBeInTheDocument()
```

---

## 🌍 Del 3 — Utforskande uppgift ⭐ Bonusuppgift

### Utforska Cypress eller Playwright

Installera Cypress **eller** Playwright och skriv **ett** E2E-test som:

1. Startar appen
2. Lägger till en transaktion via formuläret
3. Verifierar att transaktionen syns i listan
4. Verifierar att balansen har uppdaterats

**Cypress:**

```bash
npm install -D cypress
npx cypress open
```

**Playwright:**

```bash
npm install -D @playwright/test
npx playwright install
```

Dokumentera kortfattat i en kommentar i testfilen: vad är skillnaden mellan detta E2E-test och dina RTL-tester?

---

## 🎓 Examination

Examinationen består av två delar:

### Del A — Visa upp din kod

- Alla tester i Del 1 (1.1, 1.2) och Del 2 (2.1) är skrivna och passerar vid `npm run test:run`

### Del B — Muntlig redovisning

Du ska kunna redogöra för följande frågor för din lärare:

1. Varför vill man skriva tester?
2. När är det bra att skriva tester, och när är det inte bra?
3. Vad är skillnaden mellan enhetstester, integrationstester och end-to-end tester?
4. Vad menas med testdriven utveckling (TDD)?


## 📚 Resurser

- [Vitest dokumentation](https://vitest.dev/)
- [React Testing Library dokumentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Queries](https://testing-library.com/docs/queries/about#priority)
- [Common mistakes with RTL](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Cypress dokumentation](https://docs.cypress.io/)
- [Playwright dokumentation](https://playwright.dev/docs/intro)


