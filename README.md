# cmfsurgeon.com

Digitale Visitenkarte von Onur Dogru, MD, DMD – für den Austausch mit Kolleg:innen auf internationalen Kongressen.
Statische Seite ohne Build-Schritt, ohne Cookies, ohne externe Anfragen (Schrift Inter selbst gehostet).

## Aufbau

```
site/                    → wird 1:1 veröffentlicht
  index.html             Startseite (Hero, Schwerpunkte, About, Kontakt)
  legal.html             Impressum + Datenschutz (österreichisches Recht)
  404.html
  onur-dogru.vcf         „Save contact“-Datei (vCard 3.0)
  assets/styles.css      gesamtes Design (Farben als CSS-Variablen in :root)
  assets/stage.js        scroll-animierter Hintergrund (OP-Szenen zeichnen sich beim Scrollen)
  assets/scenes/*.svg    Strichzeichnungen: OP-Leuchte, Instrumente, Chirurg mit Lupenbrille
  assets/img/            Porträtfotos (Hero, Kontakt)
  assets/fonts/          Inter (SIL OFL)
  favicon.svg, apple-touch-icon.png, og-image.png (Vorschaubild für LinkedIn/WhatsApp)
print/                   QR-Code für Visitenkarte/Badge (SVG für die Druckerei, PNG 2000 px)
.github/workflows/pages.yml   automatisches Deployment
```

## Automatisches Deployment

Jeder Push auf `main` veröffentlicht den Ordner `site/` über GitHub Pages. Dauer ca. 1 Minute.

### Einmalige Einrichtung auf GitHub

1. **Repository öffentlich machen** (Settings → General → Danger Zone → Change visibility → Public).
   GitHub Pages ist mit GitHub Free nur für öffentliche Repositories verfügbar. Alternative: GitHub Pro.
   Im Repository liegt nur Website-Inhalt, der ohnehin öffentlich ist.
2. **Settings → Pages → Build and deployment → Source: „GitHub Actions“** wählen.
3. Branch nach `main` mergen → Actions-Tab zeigt den Lauf „Deploy to GitHub Pages“.
4. **Settings → Pages → Custom domain:** `cmfsurgeon.com` eintragen → Save.
   Sobald der DNS-Check grün ist: **„Enforce HTTPS“** aktivieren (das Zertifikat kann bis zu 24 h dauern).
5. Empfohlen: Domain verifizieren (Profil-Settings → Pages → Add a domain) – GitHub zeigt dafür einen TXT-Eintrag,
   den du bei GoDaddy anlegst. Das verhindert, dass jemand anderes die Domain auf GitHub übernimmt.

### DNS bei GoDaddy (Domain → DNS verwalten)

Vorher löschen: den bestehenden `A`-Eintrag `@` („Parked“) und den `CNAME` `www` → `@`. Eine aktive Domain-Weiterleitung („Forwarding“) ausschalten.

| Typ   | Name | Wert                    |
|-------|------|-------------------------|
| A     | @    | 185.199.108.153         |
| A     | @    | 185.199.109.153         |
| A     | @    | 185.199.110.153         |
| A     | @    | 185.199.111.153         |
| AAAA  | @    | 2606:50c0:8000::153     |
| AAAA  | @    | 2606:50c0:8001::153     |
| AAAA  | @    | 2606:50c0:8002::153     |
| AAAA  | @    | 2606:50c0:8003::153     |
| CNAME | www  | naiko86.github.io       |

Quelle: GitHub Docs, „Managing a custom domain for your GitHub Pages site“.
MX-Einträge für E-Mail werden davon nicht berührt.

## E-Mail `contact@cmfsurgeon.com`

Die Adresse existiert erst, wenn bei GoDaddy ein Postfach oder eine Weiterleitung eingerichtet ist
(z. B. Microsoft 365 über GoDaddy, oder kostenlose Weiterleitung über einen Dienst wie ImprovMX per MX-Eintrag).
Adresse ändern: `grep -rl "contact@cmfsurgeon.com" site` zeigt alle Stellen (Startseite, Impressum, vCard).

## Animierter Hintergrund

Jeder Abschnitt nennt seine Szene per `data-scene` (`orlight`, `instruments`, `surgeon`). `stage.js` lädt die SVGs,
blendet beim Scrollen zwischen ihnen über, zeichnet alle Pfade mit `class="draw" pathLength="1"` nach und bewegt
Gruppen `<g class="layer" data-depth="0.1–1">` mit Parallaxe. Bei „Bewegung reduzieren“ (Betriebssystem-Einstellung)
erscheinen die Szenen fertig gezeichnet und werden nur ruhig überblendet; im Datensparmodus und ohne JavaScript
bleibt der Hintergrund einfach dunkel.

## Pflege

- **Porträtfotos:** `site/assets/img/onur-dogru.jpg` (Hero) und `onur-dogru-2.jpg` (Kontakt) – freigestellt, kühl gegradet, Navy-Hintergrund eingebrannt (4:5, 900 × 1125 px).
- **Stylesheet geändert?** Versionsparameter `styles.css?v=JJJJMMTT` in allen HTML-Dateien hochzählen.
- **QR-Code** zeigt auf `https://cmfsurgeon.com` und bleibt gültig, solange die Domain läuft.
