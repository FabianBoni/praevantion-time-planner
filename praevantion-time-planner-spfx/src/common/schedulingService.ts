import { TeamMember, TimeSlot, AppointmentRequest, ScheduledAppointment, School } from './types';

// Vereinfachte Date-Funktionen für SharePoint 2019 Kompatibilität
export class DateHelper {
  static addWeeks(date: Date, weeks: number): Date {
    const newDate = new Date(date.getTime());
    newDate.setDate(newDate.getDate() + (weeks * 7));
    return newDate;
  }

  static addDays(date: Date, days: number): Date {
    const newDate = new Date(date.getTime());
    newDate.setDate(newDate.getDate() + days);
    return newDate;
  }

  static format(date: Date, format: string): string {
    // Vereinfachte Formatierung für SharePoint 2019
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    if (format === 'EEEE') {
      return days[date.getDay()];
    }    if (format === 'yyyy-MM-dd') {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const monthStr = month < 10 ? '0' + month : month.toString();
      const dayStr = day < 10 ? '0' + day : day.toString();
      return `${year}-${monthStr}-${dayStr}`;
    }
    return date.toDateString();
  }
}

// Scheduling Service für SPFx
export class SchedulingService {
  
  // Prüft ob zwei Teammitglieder gemischtgeschlechtlich sind
  static isValidTeamPair(member1: TeamMember, member2: TeamMember): boolean {
    return member1.gender !== member2.gender;
  }

  // Generiert alle möglichen gemischtgeschlechtlichen Teampaare
  static generateTeamPairs(teamMembers: TeamMember[]): [TeamMember, TeamMember][] {
    const pairs: [TeamMember, TeamMember][] = [];
    
    for (let i = 0; i < teamMembers.length; i++) {
      for (let j = i + 1; j < teamMembers.length; j++) {
        if (this.isValidTeamPair(teamMembers[i], teamMembers[j])) {
          pairs.push([teamMembers[i], teamMembers[j]]);
        }
      }
    }
    
    return pairs;
  }

  // Konvertiert Wochentag-String zu Datum
  static getNextDateForDay(dayName: string, startDate: Date = new Date()): Date {
    const dayIndex: {[key: string]: number} = {
      'monday': 1,
      'tuesday': 2, 
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6,
      'sunday': 0
    };

    const targetDayIndex = dayIndex[dayName.toLowerCase()];
    if (targetDayIndex === undefined) {
      throw new Error(`Unbekannter Wochentag: ${dayName}`);
    }

    const currentDay = startDate.getDay();
    const daysUntilTarget = (targetDayIndex - currentDay + 7) % 7;
    const targetDate = DateHelper.addDays(startDate, daysUntilTarget === 0 ? 7 : daysUntilTarget);
    
    return targetDate;
  }

  // Prüft Verfügbarkeit eines Teams an einem bestimmten Datum/Zeit
  static isTeamAvailable(
    team: [TeamMember, TeamMember], 
    date: Date, 
    startTime: string, 
    endTime: string,
    existingAppointments: ScheduledAppointment[] = []
  ): boolean {
    const dayName = DateHelper.format(date, 'EEEE').toLowerCase();
    
    // Prüfe ob beide Teammitglieder grundsätzlich verfügbar sind
    for (let i = 0; i < team.length; i++) {
      const member = team[i];
      let dayAvailability: TimeSlot | undefined = undefined;
      
      if (member.availability) {
        for (let j = 0; j < member.availability.length; j++) {
          if (member.availability[j].day.toLowerCase() === dayName) {
            dayAvailability = member.availability[j];
            break;
          }
        }
      }
      
      if (!dayAvailability) {
        return false; // Kein verfügbares Zeitfenster für diesen Tag
      }
      
      // Prüfe Zeitüberschneidung
      if (startTime < dayAvailability.startTime || endTime > dayAvailability.endTime) {
        return false; // Gewünschte Zeit liegt außerhalb der Verfügbarkeit
      }
    }

    // Prüfe auf Konflikte mit bestehenden Terminen
    const dateStr = DateHelper.format(date, 'yyyy-MM-dd');
    for (let i = 0; i < existingAppointments.length; i++) {
      const appointment = existingAppointments[i];
      const appointmentDateStr = DateHelper.format(appointment.date, 'yyyy-MM-dd');
      
      if (appointmentDateStr === dateStr) {
        // Prüfe ob eines der Teammitglieder bereits einen Termin hat
        for (let j = 0; j < team.length; j++) {
          const teamMember = team[j];
          for (let k = 0; k < appointment.teamMembers.length; k++) {
            if (appointment.teamMembers[k].id === teamMember.id) {
              // Prüfe Zeitüberschneidung
              if (!(endTime <= appointment.startTime || startTime >= appointment.endTime)) {
                return false; // Zeitkonflikt
              }
            }
          }
        }
      }
    }

    return true;
  }

  // Sucht verfügbare Termine für eine Terminserie
  static findAvailableAppointmentSeries(
    teamMembers: TeamMember[],
    request: AppointmentRequest,
    school: School,
    existingAppointments: ScheduledAppointment[] = [],
    startFromDate: Date = new Date()
  ): ScheduledAppointment[][] {
    const availableSeries: ScheduledAppointment[][] = [];
    const teamPairs = this.generateTeamPairs(teamMembers);
    
    // Für jedes mögliche Teampaar
    for (let i = 0; i < teamPairs.length; i++) {
      const teamPair = teamPairs[i];
      const series = this.findSeriesForTeam(
        teamPair,
        request,
        school,
        existingAppointments,
        startFromDate
      );
      
      if (series.length > 0) {
        availableSeries.push(series);
      }
    }

    // Sortiere nach frühestem Startdatum
    availableSeries.sort((a, b) => 
      a[0].date.getTime() - b[0].date.getTime()
    );

    return availableSeries.slice(0, 5); // Maximal 5 Optionen zurückgeben
  }

  private static findSeriesForTeam(
    teamPair: [TeamMember, TeamMember],
    request: AppointmentRequest,
    school: School,
    existingAppointments: ScheduledAppointment[],
    startFromDate: Date
  ): ScheduledAppointment[] {
    const seriesId = `series_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const appointments: ScheduledAppointment[] = [];
    
    // Starte die Suche ab dem nächstmöglichen Datum
    let searchDate = new Date(startFromDate.getTime());
    const maxSearchWeeks = 52; // Suche bis zu einem Jahr in die Zukunft
    
    for (let weekOffset = 0; weekOffset < maxSearchWeeks && appointments.length < 5; weekOffset++) {
      const currentSearchDate = DateHelper.addWeeks(searchDate, weekOffset);
      
      // Prüfe jeden gewünschten Wochentag
      for (let dayIndex = 0; dayIndex < request.preferredDays.length; dayIndex++) {
        if (appointments.length >= 5) break;
        
        const preferredDay = request.preferredDays[dayIndex];
        const targetDate = this.getNextDateForDay(preferredDay, currentSearchDate);
        
        // Stelle sicher, dass die Termine den Mindestabstand haben
        if (appointments.length > 0) {
          const lastAppointment = appointments[appointments.length - 1];
          const weeksDifference = Math.floor(
            (targetDate.getTime() - lastAppointment.date.getTime()) / (7 * 24 * 60 * 60 * 1000)
          );
          
          // Mindestens 2 Wochen, maximal 4 Wochen Abstand
          if (weeksDifference < 2 || weeksDifference > 4) {
            continue;
          }
        }

        // Prüfe Verfügbarkeit
        if (this.isTeamAvailable(
          teamPair,
          targetDate,
          request.preferredTimeStart,
          request.preferredTimeEnd,
          existingAppointments.concat(appointments)
        )) {
          const appointment: ScheduledAppointment = {
            id: `${seriesId}_${appointments.length + 1}`,
            date: targetDate,
            startTime: request.preferredTimeStart,
            endTime: request.preferredTimeEnd,
            teamMembers: teamPair,
            school: school,
            teacherName: request.teacherName,
            sessionNumber: appointments.length + 1,
            series: seriesId
          };
          
          appointments.push(appointment);
          
          // Nach dem ersten Termin, suche nur noch in 2-4 Wochen Abständen
          if (appointments.length === 1) {
            searchDate = DateHelper.addWeeks(targetDate, 2); // Nächste Suche beginnt 2 Wochen später
            weekOffset = -1; // Reset week offset da wir searchDate geändert haben
            break;
          }
        }
      }
    }

    // Gib nur vollständige Serien (5 Termine) zurück
    return appointments.length === 5 ? appointments : [];
  }

  // Hilfsfunktion um Beispiel-Verfügbarkeiten zu erstellen
  static createSampleAvailability(): TimeSlot[] {
    return [
      {
        day: 'monday',
        startTime: '08:00',
        endTime: '17:00',
        recurring: true
      },
      {
        day: 'tuesday', 
        startTime: '08:00',
        endTime: '17:00',
        recurring: true
      },
      {
        day: 'wednesday',
        startTime: '08:00',
        endTime: '17:00', 
        recurring: true
      },
      {
        day: 'thursday',
        startTime: '08:00',
        endTime: '17:00',
        recurring: true
      },
      {
        day: 'friday',
        startTime: '08:00',
        endTime: '16:00',
        recurring: true
      }
    ];
  }
}
