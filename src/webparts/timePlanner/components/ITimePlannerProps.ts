export interface ITimePlannerProps {
  description: string;
  displayMode?: string;
  updateProperty?: (value: string) => void;
}

export interface ITimePlannerState {
  appointments: IAppointment[];
  newAppointment: IAppointment;
  isAddingNew: boolean;
  currentView: string;
}

export interface IAppointment {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  location: string;
  description: string;
  attendees: string[];
}
