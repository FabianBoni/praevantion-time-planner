# Prävention Terminplaner

Ein intelligentes Terminplanungstool für das Präventionsteam zur Organisation von Schulbesuchen in Basel-Stadt.

## Funktionen

### ✅ Aktuelle Features
- **Team-Management**: Verwaltung von 5 Teammitgliedern mit Geschlechtern
- **Gemischte Teams**: Automatische Erstellung von gemischtgeschlechtlichen Teampaaren (Mann/Frau)
- **Schulverwaltung**: Alle 56 Schulen in Basel-Stadt erfasst
- **Intelligente Terminsuche**: Findet 5 aufeinanderfolgende Termine mit 2-4 Wochen Abstand
- **Zeitfenster-Filterung**: Berücksichtigt Lehrerwünsche (z.B. Dienstag/Donnerstag 08:45-10:15)
- **Verfügbarkeitsprüfung**: Simuliert Kalenderabgleich der Teammitglieder
- **Responsive Design**: Moderne, benutzerfreundliche Oberfläche

### 🔄 Geplante Erweiterungen
- **Outlook-Integration**: Direkter Abgleich mit Outlook-Kalendern
- **Terminbuchung**: Automatische Kalendererstellung und E-Mail-Benachrichtigungen
- **Terminverwaltung**: Übersicht über alle gebuchten Termine
- **Statistiken**: Auslastungsanalysen und Berichte
- **Export-Funktionen**: PDF-Berichte und Kalender-Export

## Technische Details

- **Frontend**: React 18 mit TypeScript
- **Styling**: Modernes CSS mit Gradient-Design
- **Icons**: Lucide React
- **Datumsbehandlung**: date-fns Library
- **Build-Tool**: Vite
- **Entwicklungsserver**: Lokaler Development Server

## Installation und Setup

### Voraussetzungen
- Node.js (Version 18 oder höher)
- npm oder yarn Package Manager

### Schritt 1: Node.js installieren
1. Besuchen Sie [nodejs.org](https://nodejs.org)
2. Laden Sie die LTS-Version herunter
3. Führen Sie das Installationsprogramm aus
4. Überprüfen Sie die Installation in PowerShell:
   ```powershell
   node --version
   npm --version
   ```

### Schritt 2: Projekt starten
1. Öffnen Sie PowerShell und navigieren Sie zum Projektverzeichnis:
   ```powershell
   cd "C:\Users\SPOBOA\Desktop\praevantion-time-planner"
   ```

2. Installieren Sie die Abhängigkeiten:
   ```powershell
   npm install
   ```

3. Starten Sie den Entwicklungsserver:
   ```powershell
   npm run dev
   ```

4. Öffnen Sie Ihren Browser und gehen Sie zu: `http://localhost:3000`

### Alternative: Build für Produktion
```powershell
npm run build
npm run preview
```

## Verwendung

### 1. Team-Übersicht
- Zeigt alle 5 Teammitglieder mit Geschlecht und Verfügbarkeiten
- Berechnet automatisch die möglichen Teamkombinationen

### 2. Terminanfrage erstellen
1. **Schule auswählen**: Aus 56 Basel-Stadt Schulen wählen
2. **Lehrperson angeben**: Name und E-Mail eingeben
3. **Wochentage wählen**: Gewünschte Tage anklicken (z.B. Dienstag, Donnerstag)
4. **Zeitfenster definieren**: Start- und Endzeit eingeben
5. **Bemerkungen**: Zusätzliche Informationen hinzufügen

### 3. Termine suchen
- Klicken Sie auf "Termine suchen"
- Das System findet automatisch verfügbare 5er-Terminserien
- Jede Serie respektiert den 2-4 Wochen Abstand
- Verschiedene Teamkombinationen werden vorgeschlagen

### 4. Ergebnisse bewerten
- Mehrere Optionen mit verschiedenen Teams werden angezeigt
- Jede Option zeigt alle 5 Termine mit Datum, Zeit und Team
- Direkter Vergleich der verschiedenen Möglichkeiten

## Beispiel-Anwendungsfall

**Situation**: Eine Lehrperson möchte 5 Präventionstermine buchen

**Eingabe**:
- Schule: Primarschule Allschwil
- Lehrperson: Frau Meier
- Gewünschte Tage: Dienstag, Donnerstag
- Zeitfenster: 08:45 - 10:15

**Ergebnis**: Das System findet mehrere vollständige 5er-Serien mit verschiedenen Teamkombinationen, z.B.:
- Option 1: Anna Müller & Marc Schmidt (Start: nächster Dienstag)
- Option 2: Sarah Weber & Thomas Fischer (Start: übernächster Donnerstag)

## Systemarchitektur

```
src/
├── App.tsx              # Hauptkomponente
├── types.ts             # TypeScript Typdefinitionen
├── schedulingService.ts # Terminplanungslogik
├── sampleData.ts        # Beispieldaten (Teams & Schulen)
├── index.css           # Styling
└── main.tsx            # App-Initialisierung
```

### Kernlogik (`schedulingService.ts`)
- **Teamvalidierung**: Überprüfung gemischtgeschlechtlicher Paare
- **Verfügbarkeitsprüfung**: Simuliert Kalenderabgleich
- **Terminsuche**: Intelligente Suche nach 5er-Serien
- **Konfliktprüfung**: Vermeidet Doppelbuchungen

## Datenstrukturen

### TeamMember
```typescript
interface TeamMember {
  id: string;
  name: string;
  gender: 'male' | 'female';
  email: string;
  availability: TimeSlot[];
}
```

### ScheduledAppointment
```typescript
interface ScheduledAppointment {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  teamMembers: [TeamMember, TeamMember];
  school: School;
  teacherName: string;
  sessionNumber: number; // 1-5
}
```

## Konfiguration

### Team-Mitglieder anpassen
Bearbeiten Sie `src/sampleData.ts` um:
- Namen und E-Mails zu ändern
- Verfügbarkeitszeiten anzupassen
- Neue Teammitglieder hinzuzufügen

### Schulen hinzufügen
Die 56 Basel-Stadt Schulen sind bereits erfasst. Neue Schulen können in `src/sampleData.ts` hinzugefügt werden.

### Zeitabstände ändern
In `src/schedulingService.ts` können die Mindest- und Maximalabstände zwischen Terminen angepasst werden (aktuell 2-4 Wochen).

## Support und Weiterentwicklung

### Nächste Schritte
1. **Outlook-Integration**: Microsoft Graph API für echte Kalenderdaten
2. **Datenbank**: Persistente Speicherung von Terminen und Einstellungen
3. **Benutzerrollen**: Admin-Interface für Team- und Schulverwaltung
4. **Mobile App**: React Native App für Unterwegs-Zugriff
5. **Statistiken**: Dashboard mit Auslastungsanalysen

### Technische Erweiterungen
- Backend mit Node.js/Express
- Datenbank (PostgreSQL oder MongoDB)
- Authentication (Azure AD)
- E-Mail-Integration (SendGrid/Outlook)
- PDF-Generierung für Terminbestätigungen

---

**Entwickelt für das Präventionsteam Basel-Stadt**  
Version 1.0 - Juni 2025
