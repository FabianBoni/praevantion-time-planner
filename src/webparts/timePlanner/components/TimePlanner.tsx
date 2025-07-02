import * as React from 'react';
import styles from './TimePlanner.module.scss';
import { ITimePlannerProps, ITimePlannerState, IAppointment } from './ITimePlannerProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { 
  TextField, 
  PrimaryButton, 
  DefaultButton,
  DatePicker, 
  Panel,
  PanelType,
  Pivot,
  PivotItem,
  Label,
  DetailsList,
  SelectionMode,
  IColumn
} from 'office-ui-fabric-react';
import { v4 as uuidv4 } from 'uuid';

export default class TimePlanner extends React.Component<ITimePlannerProps, ITimePlannerState> {
  
  private _columns: IColumn[];

  constructor(props: ITimePlannerProps) {
    super(props);
    
    this.state = {
      appointments: [],
      newAppointment: this._getEmptyAppointment(),
      isAddingNew: false,
      currentView: 'list'
    };

    this._columns = [
      {
        key: 'title',
        name: 'Title',
        fieldName: 'title',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true
      },
      {
        key: 'startDate',
        name: 'Start Date',
        fieldName: 'startDate',
        minWidth: 100,
        maxWidth: 150,
        isResizable: true,
        onRender: (item: IAppointment) => {
          return <span>{item.startDate.toLocaleDateString()} {item.startDate.toLocaleTimeString()}</span>;
        }
      },
      {
        key: 'endDate',
        name: 'End Date',
        fieldName: 'endDate',
        minWidth: 100,
        maxWidth: 150,
        isResizable: true,
        onRender: (item: IAppointment) => {
          return <span>{item.endDate.toLocaleDateString()} {item.endDate.toLocaleTimeString()}</span>;
        }
      },
      {
        key: 'location',
        name: 'Location',
        fieldName: 'location',
        minWidth: 100,
        maxWidth: 150,
        isResizable: true
      },
      {
        key: 'actions',
        name: 'Actions',
        fieldName: 'actions',
        minWidth: 100,
        maxWidth: 100,
        isResizable: false,
        onRender: (item: IAppointment) => {
          return (
            <div>
              <DefaultButton text="Delete" onClick={() => this._deleteAppointment(item.id)} />
            </div>
          );
        }
      }
    ];
  }

  public render(): React.ReactElement<ITimePlannerProps> {
    return (
      <div className={styles.timePlanner}>
        <div className={styles.container}>
          <div className={styles.row}>
            <div className={styles.column}>
              <span className={styles.title}>Time Planner</span>
              <p className={styles.subTitle}>Manage your appointments efficiently</p>
            </div>
          </div>
          
          <Pivot selectedKey={this.state.currentView} onLinkClick={this._handlePivotLinkClick}>
            <PivotItem itemKey="list" linkText="Appointments List">
              {this._renderAppointmentsList()}
            </PivotItem>
            <PivotItem itemKey="calendar" linkText="Calendar View">
              {this._renderCalendarView()}
            </PivotItem>
          </Pivot>

          {this._renderAddAppointmentPanel()}
        </div>
      </div>
    );
  }

  private _getEmptyAppointment(): IAppointment {
    const now = new Date();
    const later = new Date();
    later.setHours(later.getHours() + 1);
    
    return {
      id: '',
      title: '',
      startDate: now,
      endDate: later,
      location: '',
      description: '',
      attendees: []
    };
  }

  private _handlePivotLinkClick = (item): void => {
    this.setState({
      appointments: this.state.appointments,
      newAppointment: this.state.newAppointment,
      isAddingNew: this.state.isAddingNew,
      currentView: item.props.itemKey
    });
  }

  private _renderAppointmentsList(): JSX.Element {
    return (
      <div className={styles.container}>
        <PrimaryButton 
          text="Add New Appointment" 
          onClick={this._showAddAppointmentPanel} 
          className={styles.button}
        />
        <DetailsList
          items={this.state.appointments}
          columns={this._columns}
          selectionMode={SelectionMode.none}
          setKey="set"
          layoutMode={1}
          isHeaderVisible={true}
        />
        {this.state.appointments.length === 0 && 
          <div className={styles.description}>No appointments scheduled. Click "Add New Appointment" to create one.</div>
        }
      </div>
    );
  }

  private _renderCalendarView(): JSX.Element {
    // In a real application, we would use a proper calendar control
    // For now, we'll just display appointments by date
    const appointmentsByDate = this._groupAppointmentsByDate();
    
    return (
      <div className={styles.container}>
        <PrimaryButton 
          text="Add New Appointment" 
          onClick={this._showAddAppointmentPanel} 
          className={styles.button}
        />
        {Object.keys(appointmentsByDate).length === 0 ? (
          <div className={styles.description}>No appointments scheduled. Click "Add New Appointment" to create one.</div>
        ) : (
          Object.keys(appointmentsByDate).map((date) => (
            <div key={date} className={styles.row}>
              <h3>{date}</h3>
              {appointmentsByDate[date].map((appointment) => (
                <div key={appointment.id} className={styles.column}>
                  <h4>{appointment.title}</h4>
                  <div>
                    <span>{appointment.startDate.toLocaleTimeString()} - {appointment.endDate.toLocaleTimeString()}</span>
                  </div>
                  <div>{appointment.location}</div>
                  <DefaultButton 
                    text="Delete" 
                    onClick={() => this._deleteAppointment(appointment.id)} 
                    className={styles.button}
                  />
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    );
  }

  private _groupAppointmentsByDate(): { [date: string]: IAppointment[] } {
    const result: { [date: string]: IAppointment[] } = {};
    
    this.state.appointments.forEach((appointment) => {
      const dateStr = appointment.startDate.toLocaleDateString();
      if (!result[dateStr]) {
        result[dateStr] = [];
      }
      result[dateStr].push(appointment);
    });
    
    return result;
  }

  private _showAddAppointmentPanel = (): void => {
    this.setState({
      appointments: this.state.appointments,
      isAddingNew: true,
      newAppointment: this._getEmptyAppointment(),
      currentView: this.state.currentView
    });
  }

  private _hideAddAppointmentPanel = (): void => {
    this.setState({
      appointments: this.state.appointments,
      isAddingNew: false,
      newAppointment: this.state.newAppointment,
      currentView: this.state.currentView
    });
  }

  private _renderAddAppointmentPanel(): JSX.Element {
    const { newAppointment, isAddingNew } = this.state;
    
    return (
      <Panel
        isOpen={isAddingNew}
        type={PanelType.medium}
        onDismiss={this._hideAddAppointmentPanel}
        headerText="Add New Appointment"
      >
        <div className={styles.row}>
          <TextField
            label="Title"
            required={true}
            value={newAppointment.title}
            onChange={this._onTitleChange}
          />
        </div>
        <div className={styles.row}>
          <Label>Start Date/Time</Label>
          <DatePicker
            value={newAppointment.startDate}
            onSelectDate={this._onStartDateChange}
          />
          <div className={styles.column}>
            <TextField
              type="time"
              value={this._formatTimeForInput(newAppointment.startDate)}
              onChange={this._onStartTimeChange}
            />
          </div>
        </div>
        <div className={styles.row}>
          <Label>End Date/Time</Label>
          <DatePicker
            value={newAppointment.endDate}
            onSelectDate={this._onEndDateChange}
          />
          <div className={styles.column}>
            <TextField
              type="time"
              value={this._formatTimeForInput(newAppointment.endDate)}
              onChange={this._onEndTimeChange}
            />
          </div>
        </div>
        <div className={styles.row}>
          <TextField
            label="Location"
            value={newAppointment.location}
            onChange={this._onLocationChange}
          />
        </div>
        <div className={styles.row}>
          <TextField
            label="Description"
            multiline
            rows={3}
            value={newAppointment.description}
            onChange={this._onDescriptionChange}
          />
        </div>
        <div className={styles.row}>
          <TextField
            label="Attendees"
            placeholder="Enter email addresses separated by semicolons"
            value={newAppointment.attendees.join('; ')}
            onChange={this._onAttendeesChange}
          />
        </div>
        <div className={styles.row}>
          <PrimaryButton
            text="Save"
            onClick={this._saveAppointment}
            disabled={!newAppointment.title}
            className={styles.button}
          />
          <DefaultButton
            text="Cancel"
            onClick={this._hideAddAppointmentPanel}
            className={styles.button}
          />
        </div>
      </Panel>
    );
  }

  private _formatTimeForInput = (date: Date): string => {
    const hours = date.getHours().toString();
    const minutes = date.getMinutes().toString();
    return `${hours.length === 1 ? '0' + hours : hours}:${minutes.length === 1 ? '0' + minutes : minutes}`;
  }

  private _onTitleChange = (event: React.FormEvent<HTMLInputElement>, newValue?: string): void => {
    this.setState({
      appointments: this.state.appointments,
      isAddingNew: this.state.isAddingNew,
      currentView: this.state.currentView,
      newAppointment: {
        ...this.state.newAppointment,
        title: newValue || ''
      }
    });
  }

  private _onStartDateChange = (date: Date | null | undefined): void => {
    if (date) {
      const newStartDate = new Date();
      newStartDate.setTime(this.state.newAppointment.startDate.getTime());
      newStartDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      
      this.setState({
        appointments: this.state.appointments,
        isAddingNew: this.state.isAddingNew,
        currentView: this.state.currentView,
        newAppointment: {
          ...this.state.newAppointment,
          startDate: newStartDate
        }
      });
    }
  }

  private _onStartTimeChange = (event: React.FormEvent<HTMLInputElement>, newValue?: string): void => {
    if (newValue) {
      const [hours, minutes] = newValue.split(':').map(Number);
      const newStartDate = new Date();
      newStartDate.setTime(this.state.newAppointment.startDate.getTime());
      newStartDate.setHours(hours, minutes);
      
      this.setState({
        appointments: this.state.appointments,
        isAddingNew: this.state.isAddingNew,
        currentView: this.state.currentView,
        newAppointment: {
          ...this.state.newAppointment,
          startDate: newStartDate
        }
      });
    }
  }

  private _onEndDateChange = (date: Date | null | undefined): void => {
    if (date) {
      const newEndDate = new Date();
      newEndDate.setTime(this.state.newAppointment.endDate.getTime());
      newEndDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      
      this.setState({
        appointments: this.state.appointments,
        isAddingNew: this.state.isAddingNew,
        currentView: this.state.currentView,
        newAppointment: {
          ...this.state.newAppointment,
          endDate: newEndDate
        }
      });
    }
  }

  private _onEndTimeChange = (event: React.FormEvent<HTMLInputElement>, newValue?: string): void => {
    if (newValue) {
      const [hours, minutes] = newValue.split(':').map(Number);
      const newEndDate = new Date();
      newEndDate.setTime(this.state.newAppointment.endDate.getTime());
      newEndDate.setHours(hours, minutes);
      
      this.setState({
        appointments: this.state.appointments,
        isAddingNew: this.state.isAddingNew,
        currentView: this.state.currentView,
        newAppointment: {
          ...this.state.newAppointment,
          endDate: newEndDate
        }
      });
    }
  }

  private _onLocationChange = (event: React.FormEvent<HTMLInputElement>, newValue?: string): void => {
    this.setState({
      appointments: this.state.appointments,
      isAddingNew: this.state.isAddingNew,
      currentView: this.state.currentView,
      newAppointment: {
        ...this.state.newAppointment,
        location: newValue || ''
      }
    });
  }

  private _onDescriptionChange = (event: React.FormEvent<HTMLInputElement>, newValue?: string): void => {
    this.setState({
      appointments: this.state.appointments,
      isAddingNew: this.state.isAddingNew,
      currentView: this.state.currentView,
      newAppointment: {
        ...this.state.newAppointment,
        description: newValue || ''
      }
    });
  }

  private _onAttendeesChange = (event: React.FormEvent<HTMLInputElement>, newValue?: string): void => {
    const attendees = newValue ? newValue.split(';').map(email => email.trim()).filter(email => email.length > 0) : [];
    
    this.setState({
      appointments: this.state.appointments,
      isAddingNew: this.state.isAddingNew,
      currentView: this.state.currentView,
      newAppointment: {
        ...this.state.newAppointment,
        attendees
      }
    });
  }

  private _saveAppointment = (): void => {
    const newAppointment: IAppointment = {
      ...this.state.newAppointment,
      id: this.state.newAppointment.id || `appointment-${Date.now()}`
    };
    
    this.setState({
      appointments: [...this.state.appointments, newAppointment],
      isAddingNew: false,
      newAppointment: this.state.newAppointment,
      currentView: this.state.currentView
    });
  }

  private _deleteAppointment = (id: string): void => {
    this.setState({
      appointments: this.state.appointments.filter(appointment => appointment.id !== id),
      isAddingNew: this.state.isAddingNew,
      newAppointment: this.state.newAppointment,
      currentView: this.state.currentView
    });
  }
}
