# Setup: Vitest + React Testing Library i ett Vite-projekt

Denna guide visar hur man sätter upp testning från scratch i ett React + Vite-projekt. I labben är detta redan gjort åt dig — denna fil finns som referens om du vill förstå vad som konfigurerades eller sätta upp det i ett eget projekt.

## 1. Installera testbiblioteken

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

| Paket | Vad det gör |
|---|---|
| `vitest` | Test runner — kör tester, assertions, mocking |
| `@testing-library/react` | Renderar React-komponenter i tester (`render`, `screen`) |
| `@testing-library/jest-dom` | Extra matchers som `.toBeInTheDocument()` |
| `@testing-library/user-event` | Simulerar användarinteraktioner (`click`, `type`) |
| `jsdom` | Simulerad webbläsarmiljö (DOM utan riktig browser) |

## 2. Konfigurera Vitest

Öppna `vite.config.ts` och lägg till testkonfigurationen:

```ts
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

| Inställning | Vad det gör |
|---|---|
| `globals: true` | Gör `describe`, `it`, `expect` globalt tillgängliga (behöver inte importeras) |
| `environment: 'jsdom'` | Kör tester i en simulerad webbläsar-DOM |
| `setupFiles` | Fil som körs innan varje testfil |

## 3. Fixa TypeScript-stöd

Öppna `tsconfig.node.json` och lägg till `"vitest/config"` i `types`-arrayen:

```json
"types": ["node", "vitest/config"]
```

Utan detta klagar TypeScript på att `test` inte finns i `vite.config.ts`. Det beror på att TypeScript inte vet om Vitests tillägg till Vites config-typ förrän vi pekar ut det.

## 4. Skapa setup-filen

Skapa filen `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
```

Denna fil körs innan varje testfil och gör att matchers som `.toBeInTheDocument()`, `.toHaveTextContent()` och `.toHaveValue()` fungerar.

## 5. Lägg till test-scripts i package.json

```json
"scripts": {
  "test": "vitest",
  "test:run": "vitest run"
}
```

| Script | Vad det gör |
|---|---|
| `npm test` | Startar watch mode — kör om tester vid filändringar |
| `npm run test:run` | Kör alla tester en gång |

## 6. Verifiera

Skapa en enkel testfil och kör:

```bash
npm test
```

Om allt är rätt konfigurerat bör testet passera.
