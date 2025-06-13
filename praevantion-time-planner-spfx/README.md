# Prävention Terminplaner - SharePoint Framework WebPart

Ein intelligentes Terminplanungstool für Schulbesuche in Basel-Stadt, entwickelt als SharePoint Framework (SPFx) WebPart.

## Features

- **Team-Management**: Verwaltung von 5 Teammitgliedern mit gemischtgeschlechtlichen Paarungen
- **Schul-Datenbank**: 56+ Schulen in Basel-Stadt erfasst
- **Intelligente Terminplanung**: Automatische Suche nach 5er-Terminserien mit 2-4 Wochen Abstand
- **Verfügbarkeitsprüfung**: Berücksichtigung der Teammitglieder-Verfügbarkeiten
- **Responsive Design**: Optimiert für Desktop und Mobile
- **SharePoint Integration**: Vollständig integriert in SharePoint 2019 und Microsoft 365

## Kompatibilität

- ✅ SharePoint 2019 On-Premises
- ✅ SharePoint Online (Microsoft 365)
- ✅ SharePoint 2016 (mit Feature Pack 2)

## Technische Details

- **Framework**: SharePoint Framework (SPFx) 1.15.2
- **Frontend**: React 16.13.1 mit TypeScript
- **UI Components**: Office UI Fabric React 7.x
- **Styling**: Sass mit SharePoint Design Tokens
- **Target**: ES5 für maximale Browserkompatibilität

## Installation

### Voraussetzungen
```bash
npm install -g @microsoft/generator-sharepoint@1.15.2
npm install -g yo gulp
```

### Entwicklung
```bash
# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
gulp serve

# Build erstellen
gulp build

# Lösung paketieren
gulp bundle --ship
gulp package-solution --ship
```

### Deployment

1. **Lösung erstellen**:
   ```bash
   gulp bundle --ship
   gulp package-solution --ship
   ```

2. **SharePoint App Catalog**:
   - Hochladen der `.sppkg` Datei aus dem `sharepoint/solution` Ordner
   - App im Tenant/Site Collection genehmigen

3. **WebPart hinzufügen**:
   - Zu einer SharePoint-Seite hinzufügen
   - Konfiguration über die Property Pane

## Architektur

### Komponenten
- `PraeventionTimePlanner.tsx` - Haupt-React-Komponente
- `SchedulingService.ts` - Terminplanungslogik
- `types.ts` - TypeScript-Interfaces
- `sampleData.ts` - Beispieldaten für Teams und Schulen

### Datenstruktur
```typescript
interface TeamMember {
  id: string;
  name: string;
  gender: 'male' | 'female';
  email?: string;
  availability?: TimeSlot[];
}

interface ScheduledAppointment {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  teamMembers: [TeamMember, TeamMember];
  school: School;
  teacherName: string;
  sessionNumber: number;
  series: string;
}
```

## Konfiguration

### Property Pane
- **Beschreibung**: Anpassbare Beschreibung des WebParts

### Anpassungen
- Team-Mitglieder können in `sampleData.ts` angepasst werden
- Schulen können in `sampleData.ts` erweitert werden
- Verfügbarkeiten können pro Teammitglied konfiguriert werden

## Funktionalitäten

### 1. Team-Übersicht
- Anzeige aller verfügbaren Teammitglieder
- Statistiken zu möglichen Teampaaren
- Geschlechterverteilung

### 2. Terminanfrage
- Schulauswahl aus Dropdown
- Eingabe von Lehrperson-Details
- Auswahl bevorzugter Wochentage
- Zeitfenster-Definition

### 3. Terminfindung
- Intelligente Suche nach verfügbaren Terminen
- Berücksichtigung aller Verfügbarkeiten
- Automatische 5er-Serien-Generierung
- Konfliktprüfung

### 4. Ergebnisanzeige
- Übersichtliche Darstellung der Terminoptionen
- Details zu jedem Termin
- Team-Zuordnungen
- Buchungsmöglichkeit

## Erweiterungen

### Geplante Features
- [ ] SharePoint Listen-Integration für persistente Datenspeicherung
- [ ] Outlook-Kalender-Integration
- [ ] Email-Benachrichtigungen
- [ ] Konfliktmanagement
- [ ] Reporting und Analytics
- [ ] Multi-Language Support

### Integration Möglichkeiten
- **SharePoint Listen**: Speicherung von Terminen und Teams
- **Microsoft Graph**: Outlook-Kalender-Zugriff
- **Power Automate**: Workflow-Automatisierung
- **Power BI**: Reporting und Dashboards

## Entwicklung

### Lokale Entwicklung
```bash
gulp serve --nobrowser
```
Öffne dann die SharePoint Workbench: `https://localhost:4321/temp/workbench.html`

### Debugging
- Verwende Browser-Entwicklertools
- Source Maps sind aktiviert
- TypeScript-Unterstützung in VS Code

### Testing
```bash
gulp test
```

## Support

Für Fragen und Support:
- GitHub Issues
- Dokumentation in `/docs`
- SharePoint Community

## Lizenz

Dieses Projekt ist für interne Nutzung der Präventionsabteilung Basel-Stadt entwickelt.
