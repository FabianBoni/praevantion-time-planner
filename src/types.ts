// Typen für die Anwendung
export interface TeamMember {
  id: string;
  name: string;
  gender: 'male' | 'female';
  email?: string;
  availability?: TimeSlot[];
}

export interface TimeSlot {
  day: string; // 'monday', 'tuesday', etc.
  startTime: string; // 'HH:mm' format
  endTime: string; // 'HH:mm' format
  recurring: boolean;
}

export interface School {
  id: string;
  name: string;
  address: string;
  contact: string;
}

export interface AppointmentRequest {
  schoolId: string;
  teacherName: string;
  teacherEmail: string;
  preferredDays: string[]; // ['tuesday', 'thursday']
  preferredTimeStart: string; // '08:45'
  preferredTimeEnd: string; // '10:15'
  notes?: string;
}

export interface ScheduledAppointment {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  teamMembers: [TeamMember, TeamMember]; // Immer zu zweit
  school: School;
  teacherName: string;
  sessionNumber: number; // 1-5
  series: string; // Eindeutige ID für die 5er-Serie
}

export interface AppointmentSeries {
  id: string;
  appointments: ScheduledAppointment[];
  school: School;
  teacherName: string;
  teamMembers: [TeamMember, TeamMember];
  createdAt: Date;
}

// Utility-Funktionen
export const DAYS_DE = {
  monday: 'Montag',
  tuesday: 'Dienstag', 
  wednesday: 'Mittwoch',
  thursday: 'Donnerstag',
  friday: 'Freitag',
  saturday: 'Samstag',
  sunday: 'Sonntag'
};

export const formatTime = (time: string): string => {
  return time;
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('de-CH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
