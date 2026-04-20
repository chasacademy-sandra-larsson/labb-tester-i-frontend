# Vitest — Guide och Referens

## Vad är Vitest?

Vitest är en **test runner** för JavaScript och TypeScript. Den kör dina tester, rapporterar resultat, och ger dig verktyg för assertions (påståenden) och mocking (simulering).

Vitest är byggt ovanpå Vite och delar samma konfiguration — därför fungerar det sömlöst i Vite-projekt utan extra setup för t.ex. TypeScript eller ESM.

## Grundstrukturen i ett test

```ts
import { describe, it, expect } from 'vitest'

describe('Gruppnamn', () => {
  it('beskriver vad som förväntas hända', () => {
    // Arrange — förbered
    const input = 5

    // Act — kör
    const result = input * 2

    // Assert — verifiera
    expect(result).toBe(10)
  })
})
```

### describe, it och test

| Funktion | Syfte |
|---|---|
| `describe('namn', fn)` | Grupperar relaterade tester. Kan nästlas. |
| `it('beskrivning', fn)` | Ett enskilt testfall. |
| `test('beskrivning', fn)` | Samma sak som `it` — en alias. |

```ts
describe('calculateTotal', () => {
  it('returnerar 0 för en tom array', () => { ... })
  it('summerar inkomster och utgifter', () => { ... })
})
```

`describe` är valfritt — du kan skriva `it()` direkt i filen. Men det gör testerna mer organiserade och lättare att läsa i terminalen.

---

## Assertions — expect()

`expect(värde)` skapar ett påstående. Du kedjar på en **matcher** för att verifiera resultatet.

### Matchers för jämförelse

| Matcher | Jämför | Använd för |
|---|---|---|
| `.toBe(värde)` | `Object.is` (strikt referens) | Primitiva värden: strängar, tal, booleans, `null`, `undefined` |
| `.toEqual(värde)` | Rekursiv deep equality | Objekt och arrayer |
| `.toStrictEqual(värde)` | Som `toEqual` men kollar också `undefined`-properties och array-hål | När du vill vara extra strikt |

#### toBe vs toEqual — den viktigaste skillnaden

```ts
// toBe — jämför med Object.is
expect(5).toBe(5)                    // PASS — samma värde
expect('hello').toBe('hello')        // PASS — samma värde

const obj = { a: 1 }
expect(obj).toBe(obj)                // PASS — samma referens
expect({ a: 1 }).toBe({ a: 1 })     // FAIL — olika objekt i minnet!

// toEqual — jämför innehållet
expect({ a: 1 }).toEqual({ a: 1 })  // PASS — samma innehåll
expect([1, 2]).toEqual([1, 2])       // PASS — samma innehåll
```

**Tumregel:**
- `toBe` för tal, strängar, booleans
- `toEqual` för objekt och arrayer

### Matchers för sanningsvärden

```ts
expect(true).toBeTruthy()
expect(false).toBeFalsy()
expect(null).toBeNull()
expect(undefined).toBeUndefined()
expect('hello').toBeDefined()
```

### Matchers för tal

```ts
expect(10).toBeGreaterThan(5)
expect(10).toBeGreaterThanOrEqual(10)
expect(5).toBeLessThan(10)
expect(0.1 + 0.2).toBeCloseTo(0.3)     // Hanterar flyttalsprecision
```

### Matchers för strängar

```ts
expect('Budgetplaneraren').toContain('Budget')
expect('hello@test.se').toMatch(/.*@.*\.se/)   // Regex
```

### Matchers för arrayer och objekt

```ts
// Arrayer
expect([1, 2, 3]).toContain(2)
expect([1, 2, 3]).toHaveLength(3)

// Objekt — kolla att vissa properties finns
expect({ name: 'Anna', age: 25 }).toEqual(
  expect.objectContaining({ name: 'Anna' })
)

// Arrayer med objekt
expect(users).toEqual(
  expect.arrayContaining([
    expect.objectContaining({ name: 'Anna' })
  ])
)
```

### Negering med .not

```ts
expect(5).not.toBe(10)
expect([1, 2]).not.toContain(3)
expect(null).not.toBeDefined()
```

---

## Mocking — vi.fn() och vi.mock()

Mocking låter dig ersätta riktiga funktioner med kontrollerade kopior. Användbart när du vill:
- Testa att en callback anropades
- Undvika att anropa riktiga API:er
- Kontrollera vad en funktion returnerar

### vi.fn() — skapa en mock-funktion

```ts
import { vi } from 'vitest'

const mockFn = vi.fn()

// Anropa den
mockFn('hello')
mockFn('world')

// Verifiera
expect(mockFn).toHaveBeenCalled()
expect(mockFn).toHaveBeenCalledTimes(2)
expect(mockFn).toHaveBeenCalledWith('hello')
expect(mockFn).toHaveBeenLastCalledWith('world')
```

### vi.fn() med returvärde

```ts
const mockFn = vi.fn(() => 42)
expect(mockFn()).toBe(42)

// Eller med mockReturnValue
const mockFn2 = vi.fn()
mockFn2.mockReturnValue('hej')
expect(mockFn2()).toBe('hej')
```

### vi.spyOn() — spionera på befintliga funktioner

```ts
const calculator = {
  add: (a: number, b: number) => a + b,
}

const spy = vi.spyOn(calculator, 'add')
calculator.add(1, 2)

expect(spy).toHaveBeenCalledWith(1, 2)
```

### Vanliga mock-matchers

| Matcher | Verifierar |
|---|---|
| `.toHaveBeenCalled()` | Funktionen anropades minst en gång |
| `.toHaveBeenCalledTimes(n)` | Funktionen anropades exakt n gånger |
| `.toHaveBeenCalledWith(arg1, arg2)` | Funktionen anropades med dessa argument |
| `.toHaveBeenLastCalledWith(arg)` | Senaste anropet hade dessa argument |
| `.not.toHaveBeenCalled()` | Funktionen anropades aldrig |

---

## Lifecycle-hooks

Kör kod före/efter tester. Användbart för setup och cleanup.

```ts
import { describe, it, beforeEach, afterEach, beforeAll, afterAll } from 'vitest'

describe('mina tester', () => {
  beforeAll(() => {
    // Körs EN gång innan alla tester i detta describe-block
  })

  afterAll(() => {
    // Körs EN gång efter alla tester
  })

  beforeEach(() => {
    // Körs innan VARJE test
  })

  afterEach(() => {
    // Körs efter VARJE test
  })

  it('test 1', () => { ... })
  it('test 2', () => { ... })
})
```

**Vanligt mönster** — rensa mockar mellan tester:

```ts
afterEach(() => {
  vi.restoreAllMocks()
})
```

---

## Async-tester

Funktioner som returnerar Promises kan testas med `async/await`:

```ts
it('hämtar data', async () => {
  const result = await fetchData()
  expect(result).toEqual({ name: 'Anna' })
})
```

---

## Vitest CLI-kommandon

| Kommando | Vad det gör |
|---|---|
| `npx vitest` | Startar watch mode — kör om tester vid filändringar |
| `npx vitest run` | Kör alla tester en gång |
| `npx vitest run src/utils` | Kör bara tester i en specifik mapp |
| `npx vitest run -t "calculateTotal"` | Kör bara tester som matchar namnet |

---

## Vitest vs Jest — snabbreferens

| Vitest | Jest |
|---|---|
| `vi.fn()` | `jest.fn()` |
| `vi.mock('./modul')` | `jest.mock('./modul')` |
| `vi.spyOn(obj, 'metod')` | `jest.spyOn(obj, 'metod')` |
| `vi.restoreAllMocks()` | `jest.restoreAllMocks()` |
| `import { vi } from 'vitest'` | Globalt tillgängligt |
| Config i `vite.config.ts` | Config i `jest.config.js` |
| Inbyggt ESM-stöd | Kräver Babel för ESM |

API:et är nästan identiskt. Om du kan Vitest kan du Jest.
