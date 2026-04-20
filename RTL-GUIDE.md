# React Testing Library (RTL) — Guide och Referens

## Vad är React Testing Library?

React Testing Library är ett **bibliotek för att rendera och interagera med React-komponenter** i tester. Det är *inte* en test runner — det fungerar tillsammans med Vitest eller Jest.

**Filosofin:** *"The more your tests resemble the way your software is used, the more confidence they can give you."*

Det betyder: testa som en användare, inte som en utvecklare. Hitta element som användaren ser dem (text, labels, roller) — inte genom CSS-klasser eller interna state-variabler.

## De tre byggstenarna

| Verktyg | Vad det gör | Kommer från |
|---|---|---|
| `render` | Renderar en React-komponent i en simulerad DOM | `@testing-library/react` |
| `screen` | Ger tillgång till den renderade DOM:en för att hitta element | `@testing-library/react` |
| `userEvent` | Simulerar användarinteraktioner (klick, skriva text, etc.) | `@testing-library/user-event` |

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
```

---

## render — rendera en komponent

`render()` tar en React-komponent och renderar den i en simulerad DOM (jsdom). Efter render kan du använda `screen` för att hitta element.

```tsx
render(<Balance transactions={[]} />)
// Nu finns komponentens HTML i en virtuell DOM
```

Varje `render()` skapar en ny DOM. Du behöver inte rensa mellan tester — det görs automatiskt.

### Rendera med props

```tsx
// Skicka in testdata som props
render(<TransactionList transactions={testData} onDeleteTransaction={vi.fn()} />)

// Skicka in en mock-funktion för att testa callbacks
const mockAdd = vi.fn()
render(<TransactionForm onAddTransaction={mockAdd} />)
```

---

## screen — hitta element

`screen` ger dig tillgång till den renderade DOM:en. Du använder **queries** för att hitta element.

### Query-prioritering

RTL har en tydlig prioriteringsordning — **försök alltid högsta först:**

| Prioritet | Query | Hittar via | Exempel |
|---|---|---|---|
| 1 | `getByRole` | ARIA-roll (button, heading, list, etc.) | `screen.getByRole('button', { name: 'Lägg till' })` |
| 2 | `getByLabelText` | Label kopplad till input | `screen.getByLabelText('Beskrivning')` |
| 3 | `getByText` | Synlig text | `screen.getByText('Inga transaktioner att visa')` |
| 4 | `getByDisplayValue` | Inputens nuvarande value | `screen.getByDisplayValue('Lunch')` |
| 5 | `getByTestId` | `data-testid`-attribut | `screen.getByTestId('total')` |

> **Tumregel:** Om du inte kan hitta elementet med `getByRole` — fundera på om komponenten har tillgänglighetsproblem.

---

### Queries som används i labben

#### getByRole — hitta via ARIA-roll

Hittar element baserat på deras semantiska roll. Det bästa sättet att hitta interaktiva element.

```tsx
// Hitta en knapp via dess synliga text
screen.getByRole('button', { name: 'Lägg till' })

// Hitta en knapp via aria-label
// <button aria-label="Ta bort Hyra">Ta bort</button>
screen.getByRole('button', { name: 'Ta bort Hyra' })

// Hitta ett element med role="alert"
screen.getByRole('alert')

// Hitta en lista
screen.getByRole('list')
```

**Vanliga roller:**

| Roll | HTML-element |
|---|---|
| `button` | `<button>` |
| `textbox` | `<input type="text">`, `<textarea>` |
| `combobox` | `<select>` |
| `list` | `<ul>`, `<ol>` |
| `listitem` | `<li>` |
| `heading` | `<h1>`–`<h6>` |
| `alert` | Element med `role="alert"` |
| `search` | Element med `role="search"` |

#### getByLabelText — hitta via label

Hittar inputs och selects som är kopplade till en `<label>`. Perfekt för formulärfält.

```tsx
// <label htmlFor="description">Beskrivning</label>
// <input id="description" />
screen.getByLabelText('Beskrivning')

// <label htmlFor="amount">Belopp (kr)</label>
// <input id="amount" type="number" />
screen.getByLabelText('Belopp (kr)')

// <label htmlFor="type">Typ</label>
// <select id="type">...</select>
screen.getByLabelText('Typ')
```

#### getByText — hitta via synlig text

Hittar element baserat på deras textinnehåll.

```tsx
screen.getByText('Inga transaktioner att visa')
screen.getByText('16550.00 kr')
screen.getByText('+25000.00 kr')
screen.getByText('Hyra')
```

#### getAllByText — hitta flera element med samma text

När samma text förekommer flera gånger i DOM:en. `getByText` kastar fel om den hittar fler än ett element — `getAllByText` returnerar en array.

```tsx
// "0.00 kr" visas tre gånger i Balance (balans, inkomster, utgifter)
const zeros = screen.getAllByText('0.00 kr')
expect(zeros).toHaveLength(3)
```

#### queryByText — hitta eller returnera null

`getByText` kastar ett fel om elementet inte finns. `queryByText` returnerar `null` istället — perfekt för att verifiera att något **inte** visas.

```tsx
// Verifiera att ett element INTE finns i DOM:en
expect(screen.queryByText('Netflix')).not.toBeInTheDocument()

// getByText hade kastat ett fel här:
// screen.getByText('Netflix') // ERROR om Netflix inte finns!
```

**Regel:**
- `getByText` — "jag förväntar mig att detta finns"
- `queryByText` — "jag vill kolla om detta finns eller inte"

---

### within — begränsa sökningen

När samma text förekommer på flera ställen i DOM:en kan du begränsa sökningen till en del av sidan med `within()`.

```tsx
import { render, screen, within } from '@testing-library/react'

render(<App />)

// "Lön" finns som option i formuläret OCH som text i transaktionslistan
// Begränsa sökningen till bara listan:
const list = screen.getByRole('list')
expect(within(list).getByText('Hyra')).toBeInTheDocument()
expect(within(list).queryByText('Netflix')).not.toBeInTheDocument()
```

---

## userEvent — simulera interaktioner

`userEvent` simulerar riktiga användarinteraktioner. Det beter sig som en riktig användare — till skillnad från `fireEvent` som bara triggar ett enskilt DOM-event.

```tsx
import userEvent from '@testing-library/user-event'
```

**Alla userEvent-anrop är asynkrona — använd `await`.**

### userEvent.click — klicka

```tsx
// Klicka på en knapp
await userEvent.click(screen.getByRole('button', { name: 'Lägg till' }))

// Klicka på en specifik ta-bort-knapp
await userEvent.click(screen.getByRole('button', { name: 'Ta bort Hyra' }))
```

### userEvent.type — skriva text

Simulerar att användaren skriver tecken för tecken. Triggar `onChange` för varje tecken.

```tsx
// Skriv "Lunch" i beskrivningsfältet
await userEvent.type(screen.getByLabelText('Beskrivning'), 'Lunch')

// Skriv "85" i beloppsfältet
await userEvent.type(screen.getByLabelText('Belopp (kr)'), '85')
```

**Viktigt:** `type` triggar `onChange` per tecken. Om du har en mock som lyssnar på varje ändring:

```tsx
await userEvent.type(input, 'abc')
// onChange anropas 3 gånger: 'a', 'ab', 'abc'
```

### userEvent.selectOptions — välja i dropdown

```tsx
// Välj "income" i typ-dropdown
await userEvent.selectOptions(screen.getByLabelText('Typ'), 'income')

// Välj "food" i kategori-dropdown
await userEvent.selectOptions(screen.getByLabelText('Kategori'), 'food')
```

### userEvent.clear — rensa ett fält

```tsx
const input = screen.getByLabelText('Beskrivning')
await userEvent.clear(input)
```

---

## Jest-DOM matchers

`@testing-library/jest-dom` lägger till extra matchers för DOM-element. Dessa aktiveras via setup-filen (`import '@testing-library/jest-dom/vitest'`).

### Matchers som används i labben

#### .toBeInTheDocument()

Verifierar att elementet finns i DOM:en.

```tsx
expect(screen.getByText('Budgetplaneraren')).toBeInTheDocument()
```

#### .toHaveTextContent()

Verifierar textinnehållet i ett element.

```tsx
expect(screen.getByRole('alert')).toHaveTextContent('Beskrivning krävs')
```

#### .toHaveValue()

Verifierar värdet i ett input-fält.

```tsx
// Textfält — tomt efter submit
expect(screen.getByLabelText('Beskrivning')).toHaveValue('')

// Nummerfält — null när det är tomt
expect(screen.getByLabelText('Belopp (kr)')).toHaveValue(null)
```

### Andra användbara matchers

```tsx
// Synlighet
expect(element).toBeVisible()
expect(element).toBeDisabled()
expect(element).toBeEnabled()

// CSS-klasser
expect(element).toHaveClass('active')

// Attribut
expect(element).toHaveAttribute('href', '/home')

// Formulär
expect(input).toBeRequired()
expect(checkbox).toBeChecked()
```

---

## Sammanfattning — allt som används i labben

### Imports

```tsx
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
```

### Rendera

| Funktion | Syfte |
|---|---|
| `render(<Komponent />)` | Renderar komponenten i en simulerad DOM |

### Hitta element (queries)

| Query | Returnerar | Om inte hittat |
|---|---|---|
| `screen.getByRole('button', { name: 'X' })` | Element | Kastar fel |
| `screen.getByLabelText('X')` | Element | Kastar fel |
| `screen.getByText('X')` | Element | Kastar fel |
| `screen.getAllByText('X')` | Array av element | Kastar fel |
| `screen.queryByText('X')` | Element eller `null` | Returnerar `null` |
| `within(element).getByText('X')` | Element inom avgränsning | Kastar fel |
| `within(element).queryByText('X')` | Element eller `null` | Returnerar `null` |

### Interagera

| Funktion | Simulerar |
|---|---|
| `await userEvent.click(element)` | Musklick |
| `await userEvent.type(element, 'text')` | Tangentbordsinmatning |
| `await userEvent.selectOptions(element, 'value')` | Val i dropdown |
| `await userEvent.clear(element)` | Rensa ett fält |

### Verifiera (jest-dom matchers)

| Matcher | Verifierar |
|---|---|
| `.toBeInTheDocument()` | Elementet finns i DOM:en |
| `.toHaveTextContent('text')` | Elementet innehåller texten |
| `.toHaveValue('value')` | Input-fältets värde |
| `.not.toBeInTheDocument()` | Elementet finns INTE (används med `queryByText`) |

### Flödet i ett typiskt test

```tsx
it('kan lägga till en transaktion', async () => {
  // 1. Rendera
  const mockAdd = vi.fn()
  render(<TransactionForm onAddTransaction={mockAdd} />)

  // 2. Hitta element via screen
  // 3. Interagera via userEvent
  await userEvent.type(screen.getByLabelText('Beskrivning'), 'Lunch')
  await userEvent.type(screen.getByLabelText('Belopp (kr)'), '85')
  await userEvent.click(screen.getByRole('button', { name: 'Lägg till' }))

  // 4. Verifiera med expect
  expect(mockAdd).toHaveBeenCalledWith(
    expect.objectContaining({ description: 'Lunch', amount: 85 })
  )
})
```

> **render** skapar DOM:en, **screen** läser den, **userEvent** interagerar med den, **expect** verifierar den.
