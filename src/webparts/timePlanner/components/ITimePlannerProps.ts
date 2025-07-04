export interface ITimePlannerProps {
  description: string;
  context: any;
  displayMode?: string;
  updateProperty?: (value: string) => void;
  appointments: string;
  onAppointmentsChange: (appointments: string) => void;
}

export interface ITimePlannerState {
  appointments: IAppointment[];
  schools: ISchool[];
  newAppointment: IAppointment;
  isAddingNew: boolean;
  currentView: string;
  selectedSchool: string;
  isLoading: boolean;
  error: string;
}

export interface IAppointment {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  school: string;
  preventionType: string;
  participants: number;
  status: string;
  contact: string;
  notes: string;
  attendees: string[];
}

export interface ISchool {
  id: string;
  name: string;
  address: string;
  type: string; // Kindergarten, Primarschule, Sekundarschule, Gymnasium
  canton: string;
  district: string;
}
