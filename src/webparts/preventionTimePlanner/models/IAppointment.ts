export interface ITimeSlot {
  startTime: Date;
  endTime: Date;
  dayOfWeek: number; // 0 = Sonntag, 1 = Montag, etc.
  isRecurring: boolean;
}

export interface IAppointment {
  id: string;
  schoolName: string;
  className: string;
  teacherName: string;
  teacherEmail: string;
  preferredTimeSlots: ITimeSlot[];
  sessionCount: number; // Normalerweise 5
  sessionDurationMinutes: number; // Normalerweise 90 (1.5 Stunden)
  minWeeksBetweenSessions: number; // Normalerweise 2
  maxWeeksBetweenSessions: number; // Normalerweise 4
  assignedTeamPair?: string; // ID der zugewiesenen Teammitglieder
  scheduledSessions: IScheduledSession[];
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  createdDate: Date;
  notes?: string;
}

export interface IScheduledSession {
  id: string;
  appointmentId: string;
  sessionNumber: number; // 1-5
  startTime: Date;
  endTime: Date;
  teamMember1Id: string;
  teamMember2Id: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}
