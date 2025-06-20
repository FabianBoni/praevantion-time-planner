export interface TeamMember {
    id: string;
    name: string;
    gender: 'male' | 'female';
    email?: string;
    availability?: TimeSlot[];
}
export interface TimeSlot {
    day: string;
    startTime: string;
    endTime: string;
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
    preferredDays: string[];
    preferredTimeStart: string;
    preferredTimeEnd: string;
    notes?: string;
}
export interface ScheduledAppointment {
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
export interface AppointmentSeries {
    id: string;
    appointments: ScheduledAppointment[];
    school: School;
    teacherName: string;
    teamMembers: [TeamMember, TeamMember];
    createdAt: Date;
}
export declare const DAYS_DE: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
};
export declare const formatTime: (time: string) => string;
export declare const formatDate: (date: Date) => string;
