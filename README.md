# Prävention Terminplaner

Eine SharePoint Framework (SPFx) Lösung für die intelligente Terminplanung von Präventions-Angeboten an Schulen in Basel-Stadt.

## Überblick

Das Präventionsteam in Basel-Stadt führt jährlich ca. 400 Termine an 56 Schulen durch. Diese Anwendung unterstützt die komplexe Terminplanung mit folgenden Anforderungen:

- **5 Termine pro Angebot** (jeweils 1,5 Stunden)
- **Abstand zwischen Terminen**: 2-4 Wochen
- **Teamzusammensetzung**: Immer zu zweit, immer Mann/Frau gemischt
- **Zeitfenster**: Nur zu den von der Lehrperson angegebenen Zeiten möglich

## Hauptfunktionen

### 1. Angebotserstellung
- Auswahl aus 30+ Schulen in Basel-Stadt (repräsentativ für die 56 Schulen)
- Eingabe von Klassenname und Lehrperson
- Definition flexibler Zeitfenster (Wochentag + Uhrzeit)
- Automatische Terminplanung basierend auf Team-Verfügbarkeit

### 2. Intelligente Terminplanung
- **Automatische Team-Zuordnung**: Das System findet verfügbare Mann/Frau Paare
- **Verfügbarkeitsprüfung**: Integration mit Outlook-Kalendern (Platzhalter implementiert)
- **Optimaler Abstand**: Termine werden im 2-4 Wochen Rhythmus geplant
- **Zeitfenster-Matching**: Nur zu den bevorzugten Zeiten der Lehrperson

### 3. Dashboard und Übersicht
- Live-Statistiken (Angebote gesamt, geplante Angebote, Termine)
- Jahres-Zieltracking (400 Termine)
- Status-Übersicht aller Angebote
- Detailansicht geplanter Termine

## Installation und Setup

### Building the code

```bash
git clone the repo
npm i
npm i -g gulp
gulp
```

### CDN-Konfiguration
Die Lösung ist für das CDN unter `https://spi-u.intranet.bs.ch/JSD/QMServices/Roadmap/SiteAssets` konfiguriert.

This package produces the following:

* lib/* - intermediate-stage commonjs build artifacts
* dist/* - the bundled script, along with other resources
* deploy/* - all resources which should be uploaded to a CDN.

### Build options

gulp clean - TODO
gulp test - TODO
gulp serve - TODO
gulp bundle - TODO
gulp package-solution - TODO
