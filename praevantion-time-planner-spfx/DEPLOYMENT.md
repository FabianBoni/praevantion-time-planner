# Deployment Anleitung - Prävention Terminplaner SPFx WebPart

## Übersicht

Das Prävention Terminplaner WebPart ist erfolgreich in ein SharePoint Framework (SPFx) WebPart konvertiert worden. Es ist kompatibel mit:

- ✅ **SharePoint 2019 On-Premises**
- ✅ **SharePoint Online (Microsoft 365)**
- ✅ **SharePoint 2016 (mit Feature Pack 2)**

## Was wurde konvertiert

### Originale React-Anwendung → SPFx WebPart

1. **Projektstruktur**: 
   - Vollständige SPFx-Projektstruktur erstellt
   - TypeScript-Konfiguration für SharePoint 2019 optimiert
   - Office UI Fabric React-Integration

2. **Komponenten übertragen**:
   - `PraeventionTimePlanner.tsx` - Haupt-React-Komponente
   - `SchedulingService.ts` - Terminplanungslogik (ES5-kompatibel)
   - `types.ts` - TypeScript-Interfaces
   - `sampleData.ts` - Basel-Stadt Schulen und Team-Daten

3. **SharePoint-spezifische Anpassungen**:
   - WebPart-Properties-Integration
   - SharePoint-Context-Zugriff
   - Office UI Fabric-Komponenten statt custom CSS
   - Responsive Design für SharePoint-Seiten

## Funktionalitäten

### ✅ Implementierte Features

1. **Team-Management**
   - 5 Teammitglieder mit Geschlechter-Paarung
   - Verfügbarkeitsmanagement
   - Team-Statistiken

2. **Schuldatenbank**
   - 20+ Basel-Stadt Schulen vorkonfiguriert
   - Dropdown-Auswahl
   - Kontaktinformationen

3. **Intelligente Terminplanung**
   - 5er-Terminserien-Suche
   - 2-4 Wochen Abstände
   - Verfügbarkeitsprüfung
   - Konfliktmanagement

4. **Benutzeroberfläche**
   - Responsive Design
   - Office UI Fabric-Komponenten
   - SharePoint-Theme-Integration
   - Mobile-optimiert

## Installation & Deployment

### Voraussetzungen

```bash
# Node.js Version 16 oder höher
node --version

# SPFx Developer Tools
npm install -g @microsoft/generator-sharepoint
npm install -g yo gulp-cli
```

### Schritt 1: Projekt builden

```bash
cd praevantion-time-planner-spfx

# Dependencies installieren
npm install

# Projekt builden
gulp build

# Production Bundle erstellen
gulp bundle --ship

# SharePoint Package erstellen
gulp package-solution --ship
```

### Schritt 2: SharePoint Deployment

1. **App Catalog hochladen**:
   ```
   Datei: sharepoint/solution/praevantion-time-planner.sppkg
   → SharePoint Admin Center → App Catalog → Apps for SharePoint
   ```

2. **App genehmigen** (nur für M365):
   ```
   SharePoint Admin Center → API Access → Pending Requests
   → Alle Requests genehmigen
   ```

3. **App zu Site hinzufügen**:
   ```
   Site Contents → New → App → "Prävention Terminplaner"
   ```

### Schritt 3: WebPart zu Seite hinzufügen

1. **Moderne SharePoint-Seite**:
   - Seite bearbeiten
   - "+" klicken → "Prävention Terminplaner" auswählen
   - WebPart konfigurieren

2. **Klassische SharePoint-Seite**:
   - App Part hinzufügen
   - "Prävention Terminplaner" aus Galerie wählen

## Konfiguration

### WebPart-Properties

```typescript
// Verfügbare Konfigurationen:
interface IPraeventionTimePlannerWebPartProps {
  description: string; // Beschreibung des WebParts
}
```

### Anpassungen

1. **Team-Mitglieder ändern**:
   ```typescript
   // src/webparts/praeventionTimePlanner/components/sampleData.ts
   export const sampleTeamMembers: TeamMember[] = [
     // Team-Daten hier anpassen
   ];
   ```

2. **Schulen hinzufügen**:
   ```typescript
   // src/webparts/praeventionTimePlanner/components/sampleData.ts
   export const baselSchools: School[] = [
     // Schuldaten hier erweitern
   ];
   ```

3. **Verfügbarkeiten anpassen**:
   ```typescript
   // Für jeden TeamMember:
   availability: [
     { day: 'monday', startTime: '08:00', endTime: '17:00', recurring: true }
     // Weitere Verfügbarkeiten
   ]
   ```

## Erweiterte Integration

### SharePoint Listen-Integration

```typescript
// Zukünftige Erweiterung:
// 1. SharePoint-Listen für persistente Speicherung
// 2. Microsoft Graph-Integration für Outlook-Kalender
// 3. Power Automate-Workflows
```

### Beispiel für Listen-Struktur:

**Termine-Liste:**
- Title (Text): Titel des Termins
- StartTime (DateTime): Startzeit
- EndTime (DateTime): Endzeit
- School (Lookup): Verweis auf Schulen-Liste
- TeamMember1 (Person): Erstes Teammitglied
- TeamMember2 (Person): Zweites Teammitglied
- SeriesID (Text): ID der Terminserie

**Schulen-Liste:**
- Title (Text): Schulname
- Address (Text): Adresse
- Contact (Text): Kontaktperson
- Email (Text): E-Mail

## Troubleshooting

### Häufige Probleme

1. **WebPart wird nicht angezeigt**:
   - App Catalog-Genehmigung prüfen
   - Site Collection-Features aktivieren
   - Browser-Cache leeren

2. **JavaScript-Fehler**:
   - F12 Developer Tools öffnen
   - Console-Fehler analysieren
   - TypeScript-Kompilierung prüfen

3. **Styling-Probleme**:
   - SharePoint-Theme-Kompatibilität prüfen
   - CSS-Konflikte untersuchen
   - Responsive Breakpoints testen

### Debug-Modus

```bash
# Lokale Entwicklung
gulp serve

# SharePoint Workbench öffnen:
# https://[tenant].sharepoint.com/sites/[site]/_layouts/15/workbench.aspx
```

## Support & Wartung

### Updates

1. **Code-Änderungen**:
   ```bash
   # Nach Änderungen:
   gulp build
   gulp bundle --ship
   gulp package-solution --ship
   # Neue .sppkg in App Catalog hochladen
   ```

2. **Versionierung**:
   ```json
   // package-solution.json
   "version": "1.1.0.0" // Version erhöhen
   ```

### Monitoring

- SharePoint ULS Logs überwachen
- Browser Developer Tools verwenden
- User Feedback sammeln

## Nächste Schritte

### Geplante Erweiterungen

1. **SharePoint-Listen-Integration** (Phase 2)
2. **Outlook-Kalender-Sync** (Phase 3)
3. **Power BI-Reporting** (Phase 4)
4. **Multi-Language-Support** (Phase 5)

### Performance-Optimierungen

- Lazy Loading für große Datensätze
- Caching-Mechanismen
- Bundle-Size-Optimierung

---

## Zusammenfassung

✅ **Erfolgreich konvertiert**: React-App → SPFx WebPart  
✅ **SharePoint 2019-kompatibel**: ES5-Target, kompatible Dependencies  
✅ **M365-ready**: Moderne UI, responsive Design  
✅ **Produktionsreif**: Vollständige Funktionalität übertragen  

Das WebPart ist bereit für Deployment und kann sofort in SharePoint-Umgebungen eingesetzt werden!
