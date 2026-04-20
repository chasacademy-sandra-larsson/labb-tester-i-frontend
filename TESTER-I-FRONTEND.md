# Testning i Frontend

## Varför testa?

> "Ni har byggt en e-handel. Ni ändrar prisuträkningen. Allt ser bra ut. Ni pushar. Kunden ringer — alla priser visar 0 kr."

Att klicka igenom appen manuellt fungerar när den är liten, men ju större projektet blir desto lättare är det att missa saker. Automatiserade tester körs på sekunder och upptäcker direkt om något som fungerade har gått sönder.

---

## Testpyramiden

```
                 ╱╲
                ╱  ╲
               ╱ E2E╲            ← Få, långsamma
              ╱      ╲              Riktig webbläsare
             ╱────────╲
            ╱          ╲
           ╱ Integration╲       ← Mellanmånga
          ╱              ╲        Komponenter som samverkar
         ╱────────────────╲
        ╱                  ╲
       ╱   Enhetstester     ╲   ← Många, snabba
      ╱                      ╲    Enskilda funktioner
     ╱════════════════════════╲
```

Basen är bred (många tester, snabba, billiga). Toppen är smal (få tester, långsamma, dyra).

---

## 1. Enhetstester (Unit tests)

**Vad:** Testar en enskild funktion eller komponent i isolation. Inga beroenden till andra delar.

**Exempel:** En funktion `formatPrice(100)` ska returnera `"100 kr"`. Eller: en `<Button>` renderar rätt text.

**Kännetecken:**
- Supersnabba (millisekunder)
- Ingen nätverksaccess, ingen databas
- Om testet felar vet du exakt *var* felet är
- Du skriver **många** enhetstester

**Vad testar man?**
- Rena funktioner (beräkningar, formattering, filtrering)
- Enskilda komponenter som renderar korrekt output givet viss input

---

## 2. Integrationstester

**Vad:** Testar att flera delar fungerar *tillsammans*. I React-världen handlar det oftast om att en komponent renderas med sina barn, hanterar state, anropar callbacks, och kanske mockar ett API-anrop.

**Exempel:** Ett formulär som validerar input, visar felmeddelanden, och anropar en submit-funktion.

**Kännetecken:**
- Testar *samspelet* mellan komponenter/funktioner
- Fortfarande snabba (körs i en simulerad DOM, inte en riktig webbläsare)
- Hittar buggar som enhetstester missar — t.ex. att state och UI inte synkar
- Detta är **sweet spot** i React — det ger mest nytta per test

**Gränsen enhet vs integration** är flytande i React. Kent C. Dodds (skaparen av React Testing Library) argumenterar att de flesta komponenttester egentligen är integrationstester, och att det är bra — det ger mest "bang for the buck".

---

## 3. E2E-tester (End-to-end)

**Vad:** Testar hela applikationen från användarens perspektiv i en *riktig webbläsare*. Appen körs, och testet navigerar, klickar och fyller i formulär som en riktig användare.

**Exempel:** Navigera till login-sidan, fyll i email och lösenord, klicka logga in, verifiera att dashboard visas.

**Kännetecken:**
- Långsamma (sekunder per test)
- Kräver att appen körs
- Hittar buggar som inget annat hittar (routing, cookies, nätverksfel, CSS som döljer en knapp)
- Kan vara flaky (instabila) pga. timing och nätverkslatens
- Du skriver **få** E2E-tester — bara de viktigaste användarflödena

---

## Sammanfattning

| | Enhetstester | Integrationstester | E2E-tester |
|---|---|---|---|
| **Testar** | En funktion/komponent | Flera delar tillsammans | Hela appen |
| **Miljö** | Simulerad | Simulerad | Riktig webbläsare |
| **Hastighet** | Millisekunder | Millisekunder | Sekunder |
| **Antal** | Många | Mellanmånga | Få |
| **Hittar** | Logikfel i isolation | Samspelsfel | Flödesfel, visuella buggar |
| **Kostar** | Billigt | Billigt | Dyrt |

---

## Testdriven utveckling (TDD)

TDD (Test-Driven Development) är en metod där du skriver testet **innan** du skriver koden.

### Cykeln: Röd → Grön → Refaktorera

1. **Röd** — Skriv ett test som felar (koden finns inte ännu)
2. **Grön** — Skriv minsta möjliga kod för att testet ska passera
3. **Refaktorera** — Förbättra koden utan att testerna slutar passera

```
  ┌──────────┐
  │  1. RÖD  │ ← Skriv test (felar)
  └────┬─────┘
       │
  ┌────▼─────┐
  │ 2. GRÖN  │ ← Skriv kod (passerar)
  └────┬─────┘
       │
  ┌────▼──────────┐
  │ 3. REFAKTORERA│ ← Förbättra koden
  └────┬──────────┘
       │
       └──→ Upprepa
```

### Fördelar med TDD
- Tvingar dig att tänka på *vad* koden ska göra innan du skriver den
- Du får tester "gratis" — de finns redan när koden är klar
- Enklare att refaktorera — testerna skyddar dig

### När är TDD bra?
- Rena funktioner med tydlig input/output
- Affärslogik och beräkningar
- Buggfixar — skriv ett test som reproducerar buggen, fixa sedan

### När är TDD mindre lämpligt?
- Utforskande prototyper där du inte vet vad du bygger ännu
- UI-layout och design (svårt att testa visuellt utseende)
- Integrationer med externa tjänster som ändras ofta
