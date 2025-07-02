import { ITeamMember, ITeamPair } from '../models/ITeamMember';
import { IAppointment, IScheduledSession, ITimeSlot } from '../models/IAppointment';

export class SchedulingService {
  
  /**
   * Findet verfügbare Zeitfenster für ein Teampaar basierend auf den Outlook-Kalendern
   */
  public static async findAvailableTimeSlots(
    teamPair: ITeamPair, 
    preferredTimeSlots: ITimeSlot[],
    startDate: Date,
    endDate: Date
  ): Promise<ITimeSlot[]> {
    // TODO: Integration mit Microsoft Graph API für Outlook-Kalender
    // Hier würde die Logik implementiert werden, um die Verfügbarkeit der Teammitglieder zu prüfen
    
    // Platzhalter-Implementierung
    const availableSlots: ITimeSlot[] = [];
    
    for (const preferredSlot of preferredTimeSlots) {
      // Simuliere verfügbare Zeitfenster basierend auf den bevorzugten Zeiten
      const slot: ITimeSlot = {
        startTime: new Date(startDate.getTime() + (preferredSlot.dayOfWeek * 24 * 60 * 60 * 1000)),
        endTime: new Date(startDate.getTime() + (preferredSlot.dayOfWeek * 24 * 60 * 60 * 1000) + (90 * 60 * 1000)),
        dayOfWeek: preferredSlot.dayOfWeek,
        isRecurring: false
      };
      
      // Hier würde die tatsächliche Verfügbarkeitsprüfung stattfinden
      if (await this.isTeamPairAvailable(teamPair, slot)) {
        availableSlots.push(slot);
      }
    }
    
    return availableSlots;
  }
  
  /**
   * Erstellt einen optimalen Terminplan für ein Angebot
   */
  public static async scheduleAppointment(appointment: IAppointment): Promise<IScheduledSession[]> {
    const sessions: IScheduledSession[] = [];
    
    // Finde verfügbare Teampaare
    const availableTeamPairs = await this.getAvailableTeamPairs();
    
    for (const teamPair of availableTeamPairs) {
      // Finde verfügbare Zeitfenster für das aktuelle Teampaar
      const availableSlots = await this.findAvailableTimeSlots(
        teamPair,
        appointment.preferredTimeSlots,
        new Date(),
        new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)) // Ein Jahr in die Zukunft
      );
      
      // Versuche, 5 Termine im richtigen Abstand zu planen
      const scheduledSessions = this.planSessions(
        appointment,
        availableSlots,
        teamPair
      );
      
      if (scheduledSessions.length === appointment.sessionCount) {
        return scheduledSessions;
      }
    }
    
    return sessions;
  }
  
  /**
   * Plant die einzelnen Sitzungen mit dem korrekten Abstand
   */
  private static planSessions(
    appointment: IAppointment,
    availableSlots: ITimeSlot[],
    teamPair: ITeamPair
  ): IScheduledSession[] {
    const sessions: IScheduledSession[] = [];
    const minDaysBetween = appointment.minWeeksBetweenSessions * 7;
    const maxDaysBetween = appointment.maxWeeksBetweenSessions * 7;
    
    // Sortiere verfügbare Slots nach Datum
    const sortedSlots = availableSlots.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    
    let lastSessionDate: Date | null = null;
    
    for (let sessionNumber = 1; sessionNumber <= appointment.sessionCount; sessionNumber++) {
      for (const slot of sortedSlots) {
        if (lastSessionDate) {
          const daysDifference = Math.floor((slot.startTime.getTime() - lastSessionDate.getTime()) / (24 * 60 * 60 * 1000));
          
          if (daysDifference < minDaysBetween || daysDifference > maxDaysBetween) {
            continue;
          }
        }
        
        // Prüfe, ob dieser Slot nicht bereits verwendet wird
        const isSlotUsed = sessions.some(session => 
          Math.abs(session.startTime.getTime() - slot.startTime.getTime()) < 24 * 60 * 60 * 1000
        );
        
        if (!isSlotUsed) {
          const session: IScheduledSession = {
            id: `${appointment.id}-session-${sessionNumber}`,
            appointmentId: appointment.id,
            sessionNumber: sessionNumber,
            startTime: slot.startTime,
            endTime: slot.endTime,
            teamMember1Id: teamPair.member1.id,
            teamMember2Id: teamPair.member2.id,
            status: 'scheduled'
          };
          
          sessions.push(session);
          lastSessionDate = slot.startTime;
          break;
        }
      }
    }
    
    return sessions;
  }
  
  /**
   * Prüft, ob ein Teampaar zu einem bestimmten Zeitpunkt verfügbar ist
   */
  private static async isTeamPairAvailable(teamPair: ITeamPair, timeSlot: ITimeSlot): Promise<boolean> {
    // TODO: Integration mit Microsoft Graph API
    // Hier würde die tatsächliche Outlook-Integration implementiert werden
    
    // Platzhalter: Simuliere zufällige Verfügbarkeit
    return Math.random() > 0.3; // 70% Chance auf Verfügbarkeit
  }
  
  /**
   * Gibt alle verfügbaren Teampaare zurück (immer Mann/Frau Kombination)
   */
  private static async getAvailableTeamPairs(): Promise<ITeamPair[]> {
    // Beispiel-Team (sollte aus einer Konfiguration oder Datenbank geladen werden)
    const teamMembers: ITeamMember[] = [
      { id: '1', name: 'Max Müller', email: 'max.mueller@bs.ch', gender: 'male', isAvailable: true },
      { id: '2', name: 'Anna Schmidt', email: 'anna.schmidt@bs.ch', gender: 'female', isAvailable: true },
      { id: '3', name: 'Peter Weber', email: 'peter.weber@bs.ch', gender: 'male', isAvailable: true },
      { id: '4', name: 'Lisa Meier', email: 'lisa.meier@bs.ch', gender: 'female', isAvailable: true },
      { id: '5', name: 'Thomas Keller', email: 'thomas.keller@bs.ch', gender: 'male', isAvailable: true }
    ];
    
    const pairs: ITeamPair[] = [];
    const males = teamMembers.filter(m => m.gender === 'male' && m.isAvailable);
    const females = teamMembers.filter(m => m.gender === 'female' && m.isAvailable);
    
    // Erstelle alle möglichen Mann/Frau Kombinationen
    for (const male of males) {
      for (const female of females) {
        pairs.push({
          member1: male,
          member2: female,
          isValid: true
        });
      }
    }
    
    return pairs;
  }
  
  /**
   * Konvertiert einen Wochentag-String zu einer Nummer
   */
  public static dayOfWeekToNumber(day: string): number {
    const days = ['sonntag', 'montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag', 'samstag'];
    return days.indexOf(day.toLowerCase());
  }
  
  /**
   * Parst einen Zeitstring (z.B. "08:45") zu einem Date-Objekt
   */
  public static parseTimeString(timeString: string, baseDate: Date): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date(baseDate.getTime());
    date.setHours(hours, minutes, 0, 0);
    return date;
  }
}
