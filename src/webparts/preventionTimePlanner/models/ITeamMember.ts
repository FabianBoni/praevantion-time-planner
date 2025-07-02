export interface ITeamMember {
  id: string;
  name: string;
  email: string;
  gender: 'male' | 'female';
  isAvailable: boolean;
  calendarId?: string;
}

export interface ITeamPair {
  member1: ITeamMember;
  member2: ITeamMember;
  isValid: boolean; // Muss immer Mann/Frau Kombination sein
}
