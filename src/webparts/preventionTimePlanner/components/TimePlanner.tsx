import * as React from 'react';
import { IAppointment, ITimeSlot, IScheduledSession } from '../models/IAppointment';
import { ISchool, BaselStadtSchools } from '../models/ISchool';
import { SchedulingService } from '../services/SchedulingService';

export interface ITimePlannerProps {
  onAppointmentCreated?: (appointment: IAppointment) => void;
}

export interface ITimePlannerState {
  appointments: IAppointment[];
  selectedSchool: ISchool | null;
  isLoading: boolean;
  newAppointment: Partial<IAppointment>;
}

export class TimePlanner extends React.Component<ITimePlannerProps, ITimePlannerState> {
  
  constructor(props: ITimePlannerProps) {
    super(props);
    
    this.state = {
      appointments: [],
      selectedSchool: null,
      isLoading: false,
      newAppointment: {
        sessionCount: 5,
        sessionDurationMinutes: 90,
        minWeeksBetweenSessions: 2,
        maxWeeksBetweenSessions: 4,
        status: 'pending',
        preferredTimeSlots: []
      }
    };
  }

  private handleSchoolSelect = (schoolId: string): void => {
    let school: ISchool | null = null;
    for (let i = 0; i < BaselStadtSchools.length; i++) {
      if (BaselStadtSchools[i].id === schoolId) {
        school = BaselStadtSchools[i];
        break;
      }
    }
    
    this.setState((prevState) => ({ 
      ...prevState,
      selectedSchool: school,
      newAppointment: {
        ...prevState.newAppointment,
        schoolName: school ? school.name : ''
      }
    }));
  }

  private handleTimeSlotAdd = (): void => {
    const newTimeSlot: ITimeSlot = {
      startTime: new Date(),
      endTime: new Date(),
      dayOfWeek: 2, // Dienstag als Standard
      isRecurring: true
    };

    this.setState((prevState) => ({
      ...prevState,
      newAppointment: {
        ...prevState.newAppointment,
        preferredTimeSlots: [...(prevState.newAppointment.preferredTimeSlots || []), newTimeSlot]
      }
    }));
  }

  private handleTimeSlotUpdate = (index: number, updatedSlot: Partial<ITimeSlot>): void => {
    this.setState((prevState) => {
      const timeSlots = [...(prevState.newAppointment.preferredTimeSlots || [])];
      timeSlots[index] = { ...timeSlots[index], ...updatedSlot };
      
      return {
        ...prevState,
        newAppointment: {
          ...prevState.newAppointment,
          preferredTimeSlots: timeSlots
        }
      };
    });
  }

  private handleCreateAppointment = async (): Promise<void> => {
    if (!this.state.newAppointment.schoolName || !this.state.newAppointment.className || !this.state.newAppointment.teacherName) {
      alert('Bitte füllen Sie alle Pflichtfelder aus.');
      return;
    }

    this.setState((prevState) => ({ ...prevState, isLoading: true }));

    try {
      const appointment: IAppointment = {
        id: `app-${Date.now()}`,
        schoolName: this.state.newAppointment.schoolName!,
        className: this.state.newAppointment.className!,
        teacherName: this.state.newAppointment.teacherName!,
        teacherEmail: this.state.newAppointment.teacherEmail || '',
        preferredTimeSlots: this.state.newAppointment.preferredTimeSlots || [],
        sessionCount: this.state.newAppointment.sessionCount || 5,
        sessionDurationMinutes: this.state.newAppointment.sessionDurationMinutes || 90,
        minWeeksBetweenSessions: this.state.newAppointment.minWeeksBetweenSessions || 2,
        maxWeeksBetweenSessions: this.state.newAppointment.maxWeeksBetweenSessions || 4,
        scheduledSessions: [],
        status: 'pending',
        createdDate: new Date(),
        notes: this.state.newAppointment.notes
      };

      // Versuche Termine zu planen
      const scheduledSessions = await SchedulingService.scheduleAppointment(appointment);
      appointment.scheduledSessions = scheduledSessions;
      appointment.status = scheduledSessions.length === appointment.sessionCount ? 'scheduled' : 'pending';

      this.setState((prevState) => ({
        ...prevState,
        appointments: [...prevState.appointments, appointment],
        isLoading: false,
        newAppointment: {
          sessionCount: 5,
          sessionDurationMinutes: 90,
          minWeeksBetweenSessions: 2,
          maxWeeksBetweenSessions: 4,
          status: 'pending',
          preferredTimeSlots: []
        },
        selectedSchool: null
      }));

      if (this.props.onAppointmentCreated) {
        this.props.onAppointmentCreated(appointment);
      }

      alert(`Angebot erstellt! ${scheduledSessions.length} von ${appointment.sessionCount} Terminen konnten geplant werden.`);
    } catch (error) {
      console.error('Fehler beim Erstellen des Angebots:', error);
      alert('Fehler beim Erstellen des Angebots. Bitte versuchen Sie es erneut.');
      this.setState((prevState) => ({ ...prevState, isLoading: false }));
    }
  }

  private formatDate = (date: Date): string => {
    return date.toLocaleDateString('de-CH', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  public render(): React.ReactElement<ITimePlannerProps> {
    return (
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>Prävention Terminplaner</h1>
        <p>Planen Sie Präventions-Termine für die 56 Schulen in Basel-Stadt. Das System plant automatisch 5 Termine im Abstand von 2-4 Wochen mit gemischten Teams (Mann/Frau).</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '30px' }}>
          {/* Neues Angebot erstellen */}
          <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
            <h2>Neues Angebot erstellen</h2>
            
            <div style={{ marginBottom: '15px' }}>
              <label>Schule auswählen:</label>
              <select 
                value={this.state.selectedSchool ? this.state.selectedSchool.id : ''} 
                onChange={(e) => this.handleSchoolSelect((e.target as HTMLSelectElement).value)}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              >
                <option value="">-- Schule auswählen --</option>
                {BaselStadtSchools.map(school => (
                  <option key={school.id} value={school.id}>{school.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Klassenname:</label>
              <input 
                type="text" 
                value={this.state.newAppointment.className || ''} 
                onChange={(e) => this.setState((prevState) => ({
                  ...prevState,
                  newAppointment: { ...prevState.newAppointment, className: (e.target as HTMLInputElement).value }
                }))}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                placeholder="z.B. 6a, 7b"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Lehrperson:</label>
              <input 
                type="text" 
                value={this.state.newAppointment.teacherName || ''} 
                onChange={(e) => this.setState((prevState) => ({
                  ...prevState,
                  newAppointment: { ...prevState.newAppointment, teacherName: (e.target as HTMLInputElement).value }
                }))}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                placeholder="Name der Lehrperson"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>E-Mail der Lehrperson:</label>
              <input 
                type="email" 
                value={this.state.newAppointment.teacherEmail || ''} 
                onChange={(e) => this.setState((prevState) => ({
                  ...prevState,
                  newAppointment: { ...prevState.newAppointment, teacherEmail: (e.target as HTMLInputElement).value }
                }))}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                placeholder="email@bs.ch"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3>Bevorzugte Zeitfenster</h3>
              {(this.state.newAppointment.preferredTimeSlots || []).map((slot, index) => (
                <div key={index} style={{ border: '1px solid #eee', padding: '10px', marginBottom: '10px', borderRadius: '4px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div>
                      <label>Wochentag:</label>
                      <select 
                        value={slot.dayOfWeek} 
                        onChange={(e) => this.handleTimeSlotUpdate(index, { dayOfWeek: parseInt((e.target as HTMLSelectElement).value) })}
                        style={{ width: '100%', padding: '4px' }}
                      >
                        <option value={1}>Montag</option>
                        <option value={2}>Dienstag</option>
                        <option value={3}>Mittwoch</option>
                        <option value={4}>Donnerstag</option>
                        <option value={5}>Freitag</option>
                      </select>
                    </div>
                    <div>
                      <label>Von:</label>
                      <input 
                        type="time" 
                        value={slot.startTime ? slot.startTime.toTimeString().slice(0, 5) : '08:45'}
                        onChange={(e) => {
                          const newDate = new Date();
                          const timeValue = (e.target as HTMLInputElement).value;
                          const [hours, minutes] = timeValue.split(':');
                          newDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                          this.handleTimeSlotUpdate(index, { startTime: newDate });
                        }}
                        style={{ width: '100%', padding: '4px' }}
                      />
                    </div>
                    <div>
                      <label>Bis:</label>
                      <input 
                        type="time" 
                        value={slot.endTime ? slot.endTime.toTimeString().slice(0, 5) : '10:15'}
                        onChange={(e) => {
                          const newDate = new Date();
                          const timeValue = (e.target as HTMLInputElement).value;
                          const [hours, minutes] = timeValue.split(':');
                          newDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                          this.handleTimeSlotUpdate(index, { endTime: newDate });
                        }}
                        style={{ width: '100%', padding: '4px' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button 
                onClick={this.handleTimeSlotAdd}
                style={{ padding: '8px 16px', backgroundColor: '#0078d7', color: 'white', border: 'none', borderRadius: '4px' }}
              >
                Zeitfenster hinzufügen
              </button>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Notizen:</label>
              <textarea 
                value={this.state.newAppointment.notes || ''} 
                onChange={(e) => this.setState((prevState) => ({
                  ...prevState,
                  newAppointment: { ...prevState.newAppointment, notes: (e.target as HTMLTextAreaElement).value }
                }))}
                style={{ width: '100%', padding: '8px', marginTop: '5px', minHeight: '60px' }}
                placeholder="Zusätzliche Informationen..."
              />
            </div>

            <button 
              onClick={this.handleCreateAppointment}
              disabled={this.state.isLoading}
              style={{ 
                padding: '12px 24px', 
                backgroundColor: this.state.isLoading ? '#ccc' : '#107c10', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                fontSize: '16px',
                cursor: this.state.isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {this.state.isLoading ? 'Wird erstellt...' : 'Angebot erstellen'}
            </button>
          </div>

          {/* Aktuelle Angebote */}
          <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
            <h2>Aktuelle Angebote ({this.state.appointments.length})</h2>
            
            {this.state.appointments.length === 0 ? (
              <p style={{ color: '#666' }}>Noch keine Angebote erstellt.</p>
            ) : (
              <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {this.state.appointments.map(appointment => (
                  <div key={appointment.id} style={{ 
                    border: '1px solid #eee', 
                    padding: '15px', 
                    marginBottom: '15px', 
                    borderRadius: '6px',
                    backgroundColor: appointment.status === 'scheduled' ? '#f0f8f0' : '#fff8f0'
                  }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
                      {appointment.schoolName} - {appointment.className}
                    </h3>
                    <p><strong>Lehrperson:</strong> {appointment.teacherName}</p>
                    <p><strong>Status:</strong> 
                      <span style={{ 
                        color: appointment.status === 'scheduled' ? '#107c10' : '#d83b01',
                        fontWeight: 'bold',
                        marginLeft: '5px'
                      }}>
                        {appointment.status === 'scheduled' ? 'Geplant' : 'Ausstehend'}
                      </span>
                    </p>
                    
                    {appointment.scheduledSessions.length > 0 && (
                      <div style={{ marginTop: '10px' }}>
                        <strong>Geplante Termine:</strong>
                        <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                          {appointment.scheduledSessions.map(session => (
                            <li key={session.id} style={{ marginBottom: '5px' }}>
                              <strong>Termin {session.sessionNumber}:</strong> {this.formatDate(session.startTime)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                      Erstellt am: {appointment.createdDate.toLocaleDateString('de-CH')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Statistiken */}
        <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <h2>Statistiken</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div>
              <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>Angebote gesamt</h3>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0', color: '#0078d7' }}>
                {this.state.appointments.length}
              </p>
            </div>
            <div>
              <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>Geplante Angebote</h3>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0', color: '#107c10' }}>
                {this.state.appointments.filter(a => a.status === 'scheduled').length}
              </p>
            </div>
            <div>
              <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>Termine gesamt</h3>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0', color: '#0078d7' }}>
                {this.state.appointments.reduce((sum, a) => sum + a.scheduledSessions.length, 0)}
              </p>
            </div>
            <div>
              <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>Ziel pro Jahr</h3>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0', color: '#666' }}>
                400 Termine
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
