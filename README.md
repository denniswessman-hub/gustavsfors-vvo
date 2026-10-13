# Gustavsfors VVO

En mobilanpassad guide till föreningens jaktregler, stadgar, årsmötesbeslut och jakttider.

**Publicerad sida:** https://denniswessman-hub.github.io/gustavsfors-vvo/

## Version 2.0.0 · 13 oktober 2026

- Ny startsida, tydlig mobilmeny och separat datornavigation.
- Sökning i alla aktiva dokument, med flera sökord och säker hantering av söktext.
- Bokmärken, mörkt läge och större dokumenttext sparas lokalt.
- Installerbar webbapp med lokalt sparade filer för läsning utan täckning.
- Versionssammanhållen offlinecache och användarstyrd uppdatering.
- Befintliga 73 innehållsavsnitt är bevarade. Utgående PM döljs enligt svensk kalenderdag.

## Filer och innehåll

Ingen byggprocess eller extern tjänst behövs för webbplatsen. GitHub Pages publicerar filerna i repots rot från `main`.

| Fil | Innehåll |
| --- | --- |
| `index.html` | Sidans struktur och komplett läsversion när JavaScript är avstängt |
| `data.js` | Föreningens befintliga innehåll, oförändrat från revision `35ae0bc` |
| `app.js` | Navigation, sökning, sparade avsnitt, datum och inställningar |
| `styles.css` | Responsiv form, ljust/mörkt tema och utskrift |
| `sw.js` | Offlinecache och uppdatering |
| `manifest.webmanifest` | Installation och appikoner |
| `tests/` | Webbläsarkontroller och test av versionsuppdatering |

Originalarkivet `gustavsfors-vvo-app.zip` är bevarat som historiskt underlag. Det är inte distributionspaketet för version 2.0.

Inga nya kontakt- eller betalningsuppgifter har lagts till. De som förekommer är bevarade från den befintliga publicerade sidan. Ingen inloggning, extern analyskod eller nya externa resurser har införts.

## När innehållet uppdateras

1. Kontrollera de nya uppgifterna mot föreningens beslut eller originalhandlingar. Version 2.0 ändrar design och funktion; den är ingen ny rättslig eller faktamässig granskning.
2. Ändra innehållet i `data.js` och motsvarande text i `index.html` under `noscript`. Behåll befintliga posternas ordning så att bokmärken och direktlänkar förblir stabila. Nya poster läggs sist, eller ges en uttrycklig ID-migrering i koden.
3. Om jaktens datum, samling eller avgift ändras, uppdatera även startsidans sammanfattning och datumhändelser i `app.js`.
4. Höj samma versionsnummer i HTML-resurserna, versionsmetadatan, sidfoten, `app.js` och `sw.js`. En innehållsändring behöver också en ny cacheversion.
5. Kör relevanta kontroller och publicera. Kontrollera sedan den faktiska livesidan och filernas innehåll.

Datummarkeringen för jakttider visar endast att dagens datum ingår i den befintliga tabellraden. Den säger inte att jakt är tillåten. Lokala beslut och aktuella myndighetsbeslut måste kontrolleras. PM:et visas till och med 26 oktober 2026 i tidszonen Europe/Stockholm; dokumentet finns kvar i källan därefter.

## Lokal granskning

Starta valfri statisk webbserver i repots rot på port 8765. Öppna `http://127.0.0.1:8765/`.

Webbläsartester kräver Node.js och Playwright. Installera utvecklingsberoendena och webbläsarna, och kör:

```sh
npm install
npx playwright install chromium webkit
npm test
npm run test:update
```

`TEST_URL` kan anges för en annan basadress. `TEST_OUTPUT` styr var testresultat och skärmbilder sparas. Tester ska köras med webbservern igång; uppdateringstestet startar en egen server på port 8766.

## Verifiering av version 2.0

- Alla 73 innehållsposter jämförda mot tidigare version: identiska.
- 25 webbläsarkontroller godkända i Chromium och WebKit: navigation, sökning, specialtecken, bokmärken, utfällbara avsnitt, direktlänkar, tema, större text, datumgränser och läsversion utan JavaScript.
- Alla 11 vyer granskade för sidledes överflöde vid 320, 360, 390, 430, 768, 1024 och 1440 pixlar, i båda motorerna.
- Offlineomladdning verifierad i Chromium. I WebKit på Windows verifierades cache, nätbortfall och fortsatt navigation; testmiljön ger ett internt fel vid själva offlineomladdningen. Ingen fysisk iPhone eller Samsung har använts.
- Uppdatering från cacheversion 2.0.0 till en testversion 2.0.1 verifierad, inklusive omladdning och borttagning av den gamla cachen.
- Inga JavaScript-fel i testerna. Startsida och dokument har även inspekterats visuellt.

Bokmärken och inställningar synkroniseras inte mellan enheter. Webbläsaren kan rensa sparade filer; öppna därför guiden med anslutning före jakten. Externa källänkar behöver internet.
