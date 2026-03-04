# TachoCheck – Projektkontext

## Überblick

- **TachoCheck** ist ein neues Modul innerhalb der bestehenden Webapplikation **Jazz**.
- **Ziel:** Ablösung der alten Windows-Software **EttcoScan**.
- Es werden nur **Weboberfläche und Logik** gebaut; **Hardware** (Fahrerkarten, Kartenleser) bleibt unverändert.

## Kernfunktionen

- Anzeige von **Fahrerkartendaten** pro Fahrer:in und Zeitraum (Tag / Woche / Monat):
  - Lenkzeit
  - Arbeitszeit
  - Bereitschaftszeit
  - Ruhezeit
- **Stempel** für die Zeiterfassung generieren
- **ARV-Reports** generieren

## Zielnutzer:innen

- **Disponent:innen** – tägliche Datenprüfung
- **ARV-Verantwortliche** – Daten prüfen, Verstöße bearbeiten

## Technischer Kontext

- Bestehende App: **Jazz** (Integration von TachoCheck als Modul)
- Dieses Repo: Next.js-Frontend/Logik für das Modul TachoCheck
