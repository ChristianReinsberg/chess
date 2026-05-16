# ♟️ Custom TypeScript Chess Engine & AI

Ein von Grund auf in purem TypeScript geschriebenes Schachspiel, das komplett ohne externe Frameworks oder UI-Bibliotheken auskommt. Das Projekt demonstriert die Implementierung komplexer Spiel-Logiken, Zustandsvalidierungen und einer mathematisch optimierten KI-Verhaltenssteuerung für das Browser-Frontend.

## 🚀 Features

- **Pure TypeScript Architecture:** Volle Kontrolle über das DOM und die Rendering-Pipeline ohne den Overhead von Frameworks wie React oder Angular.
- **Vollständiges Schach-Regelwerk:** Korrekte Validierung aller legalen Züge, inklusive Sonderregeln wie *En Passant*, *Rochade (Castling)* und *Bauernumwandlung*.
- **Echtzeit-Zustandsmaschine:** Präzise Erkennung von Schach, Schachmatt, Patt (Stalemate) und Spielende-Szenarien.
- **Hybride Spielmodi:** Lokales PvP (Pass-and-Play) sowie ein integrierter PvE-Modus gegen eine strategische KI.
- **Benutzerdefinierte KI-Heuristiken:** Eine performante KI, die auf einer Tiefensuche (2 Halbzüge) operiert und mittels *Piece-Square Tables* positionelle Eröffnungssysteme und Zentrumskontrolle simuliert.

---

## 🛠️ Technische Architektur & Deep Dive

### 1. Das Domain Model & State Management
Die Engine trennt strikt zwischen dem visuellen DOM und dem internen Board-Zustand. Das Spielfeld wird als zweidimensionales Array abgebildet. Jede Figur besitzt ein stark typisiertes Interface, das ihre Bewegungsmuster definiert.

Der Spielzustand (`GameState`) kapselt alle flüchtigen Informationen:
- Wer ist am Zug?
- Gibt es aktive En-Passant-Ziele?
- Welche Figuren wurden geschlagen? (Historie für Materialbewertung)

### 2. Move-Validation & Angriffs-Matrizen
Eine der größten Herausforderungen war die Performance der Legalitätsprüfung (`getLegalMoves`). Um unendliche Rekursionen zu vermeiden (z. B. "Darf eine Figur ziehen, wenn sie dadurch den eigenen König fesselt?"), nutzt die Engine ein zweistufiges Validierungssystem:
1. **Pseudo-Legal Moves:** Berechnung aller rein geometrisch möglichen Züge einer Figur.
2. **Königs-Sicherheits-Check:** Simulation des Zuges und Abfrage via `isSquareAttacked`, ob der eigene König im Folgezustand bedroht wäre. Erst bei negativem Befund ist der Zug legal.

---

## 🤖 Die KI-Engine: Pragmatismus über Over-Engineering

Während der Entwicklung wurde mit komplexen Minimax- und Alpha-Beta-Pruning-Algorithmen auf höheren Tiefen experimentiert. Im Sinne von **Performance, User Experience und pragmatischem Software-Design** wurde sich bewusst für eine optimierte **Look-Ahead-Tiefe von 2 Halbzügen** entschieden.

### Warum dieser Ansatz?
Höhere Tiefen (3+) erforderten bei der vorliegenden DOM-nahen Architektur zu viele rekursive Simulationszyklen, was die Hauptschleife des Browsers blockierte. Die optimierte Tiefe von 2 Halbzügen berechnet Züge in Millisekunden und sorgt für ein flüssiges Gameplay.

### Das Heuristik-Tuning (Piece-Square Tables)
Um der KI strategisches Verhalten einzuhauchen, wurde eine statische Stellungsbewertung (`evaluateBoard`) implementiert. Jede Figur besitzt eine positionsabhängige Bewertungsmatrix. 

Beispiel für das aggressive Zentrum-Tuning der Bauern (`blackPawnTable`):
```typescript
// Auszug aus der Positionsbewertung für Schwarz (KI)
// Bauern werden massiv belohnt, wenn sie das Zentrum besetzen (+15)
const BLACK_PAWN_TABLE = [
    [ 0,  0,  0,  0,  0,  0,  0,  0],
    [ 5,  5,  2, -5, -5,  2,  5,  5], // Bestrafung für blockierte D- und E-Bauern
    [ 3,  4,  6,  8,  8,  6,  4,  3],
    [ 2,  3,  8, 15, 15,  8,  3,  2], // Unwiderstehlicher Anreiz für Zentrumskontrolle
    // ...
];
```
Resultat: Die KI verhält sich nicht wie eine sterile Rechenmaschine, sondern agiert wie ein dynamischer, leicht chaotischer Kneipen-Schachspieler – sie besetzt das Zentrum, entwickelt Springer und Läufer koordiniert und bestraft taktische Fehler des menschlichen Spielers sofort.

---

## 💻 Tech Stack
Sprache: TypeScript (Strict Mode)

Bundler/Build-Tool: Webpack

Styling: CSS3 / SCSS / TailwindCSS 4

---

## 🔧 Installation & Lokaler Start
1. Repository klonen:

```Bash
- git clone https://github.com/ChristianReinsberg/chess.git
```

2. In das Verzeichnis wechseln:

```Bash
cd chess
```
3. Abhängigkeiten installieren:

```Bash
docker compose build
```

4. Entwicklungsserver starten:
```bash
docker compose up
```

---

## 💡 Lessons Learned & Refactoring
- Vorzeichen-Kompensation im Minimax: Die mathematische Herausforderung, Werte für Weiß (maximieren) und Schwarz (minimieren) sauber zu trennen, zeigte, wie fehleranfällig klassische Minimax-Implementierungen ohne Negamax-Refactoring in ungeraden Tiefen sind (Horizont-Effekt).

- Zustandssicherheit vor DOM-Manipulation: Erst die strikte Trennung von Logik-Array und HTML-Rendering brachte die Stabilität, um komplexe Features wie En Passant fehlerfrei zu implementieren.
