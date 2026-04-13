# 🧠 DER ULTIMATIVE TRAINER

> Ein retro-inspirierter Lerntrainer im DOS-Stil – komplett per Tastatur steuerbar.

© 2026 Jörn Priebe. All rights reserved.


![Status](https://img.shields.io/badge/status-in%20development-blue)
![Tech](https://img.shields.io/badge/tech-React%20%2B%20TypeScript-blue)
![UI](https://img.shields.io/badge/UI-Retro%20DOS-yellow)
![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg)

---

## ✨ Features

* 🎮 **Komplett per Tastatur steuerbar**

  * `↑ ↓` Navigation
  * `Enter` auswählen / prüfen
  * `ESC` zurück

* 🧠 **Adaptive Lernlogik**

  * Schwierige Fragen kommen häufiger
  * basierend auf Fehlerquote & Historie

* 📊 **Detaillierte Statistik**

  * gesehen / richtig / falsch
  * Erfolgsquote pro Frage
  * Top schwierigste Fragen

* 🎨 **Retro DOS UI**

  * Monospace Font
  * ASCII-Rahmen
  * Blau / Weiß / Gelb Farbpalette

* ⚡ **Offline-fähig**

  * läuft komplett im Browser
  * ideal für Raspberry Pi

---

## 🧱 Tech Stack

* React
* TypeScript
* Vite
* LocalStorage (für Persistenz)

---

## 📂 Projektstruktur

```text
src/
  components/
  hooks/
  lib/
  types/
  data/
    sbf-see.json
```

---

## 📚 Datenformat

```json
{
  "id": "sbf-see",
  "title": "SBF See",
  "mode": "multiple-choice",
  "questions": [
    {
      "id": "q1",
      "question": "...",
      "options": [
        { "id": "a", "text": "..." }
      ],
      "correctOptionIds": ["a"]
    }
  ]
}
```

---

## 🧠 Lernlogik

Fragen werden dynamisch priorisiert basierend auf:

* ❌ Fehlerquote
* 🔁 Anzahl falscher Antworten
* 👁️ Häufigkeit

👉 Ziel: Fokus auf schwache Themen

---

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Dann im Browser öffnen:

```
http://localhost:5173
```

---

## ⌨️ Steuerung

| Taste | Funktion         |
| ----- | ---------------- |
| ↑ ↓   | Navigation       |
| Enter | Auswahl / prüfen |
| ESC   | zurück           |

---

## 🛠 Roadmap

* [ ] „Nur schwache Fragen“-Modus
* [ ] Vokabeltrainer
* [ ] Bildfragen
* [ ] Fortschritt zurücksetzen
* [ ] Spaced Repetition (Anki-Style)

---

## 📦 Deployment

Build:

```bash
npm run build
```

Danach statisch hostbar (z. B. Raspberry Pi, Nginx, GitHub Pages).

---

## 🧑‍💻 Autor

**Jörn Priebe**
*(c) 2026*

---

## ⚡ Idee

Minimalistisch.
Schnell.
Fokussiert.

👉 Lernen ohne Ablenkung.

---

## 🧪 Status

🚧 Aktive Entwicklung – Feedback willkommen


## License

The application source code in this repository is licensed under the MIT License.
See [LICENSE](./LICENSE).

Official SBF See question text, derived question data, and extracted media assets
are **not** covered by the MIT License.
See [NOTICE.md](./NOTICE.md) for details.