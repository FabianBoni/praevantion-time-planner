import { TeamMember, TimeSlot, AppointmentRequest, ScheduledAppointment, School } from './types';
export declare class SchedulingService {
    static isValidTeamPair(member1: TeamMember, member2: TeamMember): boolean;
    static generateTeamPairs(teamMembers: TeamMember[]): [TeamMember, TeamMember][];
    static getNextDateForDay(dayName: string, startDate?: Date): Date;
    static isTeamAvailable(team: [TeamMember, TeamMember], date: Date, startTime: string, endTime: string, existingAppointments?: ScheduledAppointment[]): boolean;
    static findAvailableAppointmentSeries(teamMembers: TeamMember[], request: AppointmentRequest, school: School, existingAppointments?: ScheduledAppointment[], startFromDate?: Date): ScheduledAppointment[][];
    private static findSeriesForTeam(teamPair, request, school, existingAppointments, startFromDate);
    static createSampleAvailability(): TimeSlot[];
}
