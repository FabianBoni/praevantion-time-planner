import * as React from 'react';
import styles from './TimePlanner.module.scss';
import { ITimePlannerProps, ITimePlannerState, IAppointment, ISchool } from './ITimePlannerProps';
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
  IColumn,
  Dropdown,
  IDropdownOption,
  Spinner,
  SpinnerSize,
  MessageBar,
  MessageBarType,
  SearchBox,
  Icon,
  ChoiceGroup,
  IChoiceGroupOption,
  Slider
} from 'office-ui-fabric-react';
// Custom UUID generator function for compatibility
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export default class TimePlanner extends React.Component<ITimePlannerProps, ITimePlannerState> {
  
  private _columns: IColumn[];
  private _preventionTypes: IDropdownOption[];
  private _statusOptions: IChoiceGroupOption[];

  constructor(props: ITimePlannerProps) {
    super(props);
    
    // Prävention-Typen
    this._preventionTypes = [
      { key: 'verkehrssicherheit', text: '🚦 Verkehrssicherheit' },
      { key: 'medienkompetenz', text: '💻 Medienkompetenz' },
      { key: 'suchtpraevention', text: '🚭 Suchtprävention' },
      { key: 'gewaltpraevention', text: '🤝 Gewaltprävention' },
      { key: 'cybermobbing', text: '📱 Cybermobbing-Prävention' },
      { key: 'sexualaufklaerung', text: '💗 Sexualaufklärung' },
      { key: 'umweltschutz', text: '🌱 Umweltschutz' },
      { key: 'erste_hilfe', text: '🩹 Erste Hilfe' },
      { key: 'brandschutz', text: '🔥 Brandschutz' }
    ];

    this._statusOptions = [
      { key: 'geplant', text: '📅 Geplant' },
      { key: 'bestaetigt', text: '✅ Bestätigt' },
      { key: 'durchgefuehrt', text: '🎯 Durchgeführt' },
      { key: 'abgesagt', text: '❌ Abgesagt' }
    ];
    
    let appointments: IAppointment[] = [];
    try {
      appointments = JSON.parse(props.appointments || '[]').map(appointment => ({
        ...appointment,
        startDate: new Date(appointment.startDate),
        endDate: new Date(appointment.endDate)
      }));
    } catch (error) {
      console.error('Error parsing appointments:', error);
    }
    
    this.state = {
      appointments,
      schools: [],
      newAppointment: this._getEmptyAppointment(),
      isAddingNew: false,
      currentView: 'dashboard',
      selectedSchool: '',
      isLoading: false,
      error: ''
    };

    this._columns = [
      {
        key: 'school',
        name: 'Schule',
        fieldName: 'school',
        minWidth: 150,
        maxWidth: 200,
        isResizable: true,
        onRender: (item: IAppointment) => {
          let school = null;
          for (let i = 0; i < this.state.schools.length; i++) {
            if (this.state.schools[i].id === item.school) {
              school = this.state.schools[i];
              break;
            }
          }
          return <span>{school ? school.name : item.school}</span>;
        }
      },
      {
        key: 'title',
        name: 'Titel',
        fieldName: 'title',
        minWidth: 150,
        maxWidth: 250,
        isResizable: true,
        onRender: (item: IAppointment) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon iconName="Event" />
            <span style={{ fontWeight: 600 }}>{item.title}</span>
          </div>
        )
      },
      {
        key: 'preventionType',
        name: 'Präventionstyp',
        fieldName: 'preventionType',
        minWidth: 120,
        maxWidth: 180,
        isResizable: true,
        onRender: (item: IAppointment) => {
          let type = null;
          for (let i = 0; i < this._preventionTypes.length; i++) {
            if (this._preventionTypes[i].key === item.preventionType) {
              type = this._preventionTypes[i];
              break;
            }
          }
          return <span>{type ? type.text : item.preventionType}</span>;
        }
      },
      {
        key: 'startDate',
        name: 'Startdatum',
        fieldName: 'startDate',
        minWidth: 120,
        maxWidth: 150,
        isResizable: true,
        onRender: (item: IAppointment) => (
          <div>
            <div>{item.startDate.toLocaleDateString('de-CH')}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{item.startDate.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        )
      },
      {
        key: 'participants',
        name: 'Teilnehmer',
        fieldName: 'participants',
        minWidth: 80,
        maxWidth: 100,
        isResizable: true,
        onRender: (item: IAppointment) => (
          <div style={{ textAlign: 'center' }}>
            <Icon iconName="People" style={{ color: '#0078d4' }} />
            <span style={{ marginLeft: '4px' }}>{item.participants}</span>
          </div>
        )
      },
      {
        key: 'status',
        name: 'Status',
        fieldName: 'status',
        minWidth: 100,
        maxWidth: 120,
        isResizable: true,
        onRender: (item: IAppointment) => {
          let status = null;
          for (let i = 0; i < this._statusOptions.length; i++) {
            if (this._statusOptions[i].key === item.status) {
              status = this._statusOptions[i];
              break;
            }
          }
          return (
            <div style={{ 
              padding: '4px 8px', 
              borderRadius: '12px', 
              backgroundColor: this._getStatusColor(item.status),
              color: 'white',
              textAlign: 'center',
              fontSize: '12px',
              fontWeight: 600
            }}>
              {status ? status.text : item.status}
            </div>
          );
        }
      },
      {
        key: 'actions',
        name: 'Aktionen',
        fieldName: 'actions',
        minWidth: 100,
        maxWidth: 100,
        isResizable: false,
        onRender: (item: IAppointment) => (
          <div style={{ display: 'flex', gap: '4px' }}>
            <DefaultButton 
              iconProps={{ iconName: 'Edit' }}
              title="Bearbeiten"
              onClick={() => this._editAppointment(item)}
              style={{ minWidth: '32px', width: '32px', height: '32px' }}
            />
            <DefaultButton 
              iconProps={{ iconName: 'Delete' }}
              title="Löschen"
              onClick={() => this._deleteAppointment(item.id)}
              style={{ 
                minWidth: '32px', 
                width: '32px', 
                height: '32px',
                backgroundColor: '#d13438',
                color: 'white'
              }}
            />
          </div>
        )
      }
    ];
  }

  public componentDidMount(): void {
    this._loadSchools();
  }

  private _getStatusColor = (status: string): string => {
    switch (status) {
      case 'geplant': return '#ffa500';
      case 'bestaetigt': return '#28a745';
      case 'durchgefuehrt': return '#007bff';
      case 'abgesagt': return '#dc3545';
      default: return '#6c757d';
    }
  }

  private _getEmptyAppointment = (): IAppointment => {
    return {
      id: generateUUID(),
      title: '',
      description: '',
      startDate: new Date(),
      endDate: new Date(),
      location: '',
      school: '',
      preventionType: '',
      participants: 0,
      status: 'geplant',
      contact: '',
      notes: '',
      attendees: []
    };
  }

  private _loadSchools = (): void => {
    // Schulen für Basel-Stadt und Basel-Landschaft
    const baselSchools: ISchool[] = [
      // Basel-Stadt Kindergärten
      { id: '1', name: 'Kindergarten Bachletten', address: 'Bachlettenstrasse 12, 4054 Basel', type: 'Kindergarten', canton: 'Basel-Stadt', district: 'Bachletten' },
      { id: '2', name: 'Kindergarten Gotthelf', address: 'Gotthelfstrasse 3, 4054 Basel', type: 'Kindergarten', canton: 'Basel-Stadt', district: 'St. Johann' },
      { id: '3', name: 'Kindergarten Hirzbrunnen', address: 'Hirzbrunnenschanze 50, 4058 Basel', type: 'Kindergarten', canton: 'Basel-Stadt', district: 'Hirzbrunnen' },
      
      // Basel-Stadt Primarschulen
      { id: '4', name: 'Primarschule Thierstein', address: 'Thiersteinerrain 7, 4059 Basel', type: 'Primarschule', canton: 'Basel-Stadt', district: 'Kleinbasel' },
      { id: '5', name: 'Primarschule Gellert', address: 'Gellertstrasse 4, 4052 Basel', type: 'Primarschule', canton: 'Basel-Stadt', district: 'Gellert' },
      { id: '6', name: 'Primarschule Volta', address: 'Voltastrasse 30, 4056 Basel', type: 'Primarschule', canton: 'Basel-Stadt', district: 'St. Johann' },
      { id: '7', name: 'Primarschule Wasgenring', address: 'Wasgenring 181, 4055 Basel', type: 'Primarschule', canton: 'Basel-Stadt', district: 'Iselin' },
      { id: '8', name: 'Primarschule Theodor', address: 'Theodorskirchplatz 7, 4058 Basel', type: 'Primarschule', canton: 'Basel-Stadt', district: 'Kleinbasel' },
      
      // Basel-Stadt Sekundarschulen
      { id: '9', name: 'Sekundarschule Sandgruben', address: 'Sandgrubenstrasse 28, 4052 Basel', type: 'Sekundarschule', canton: 'Basel-Stadt', district: 'Gundeldingen' },
      { id: '10', name: 'Sekundarschule Theobald Baerwart', address: 'Laufenstrasse 107, 4053 Basel', type: 'Sekundarschule', canton: 'Basel-Stadt', district: 'St. Alban' },
      { id: '11', name: 'Sekundarschule Holbein', address: 'Holbeinstrasse 80, 4051 Basel', type: 'Sekundarschule', canton: 'Basel-Stadt', district: 'Vorstädte' },
      
      // Basel-Stadt Gymnasien
      { id: '12', name: 'Gymnasium Leonhard', address: 'Kohlenberggasse 10, 4051 Basel', type: 'Gymnasium', canton: 'Basel-Stadt', district: 'Altstadt' },
      { id: '13', name: 'Gymnasium Bäumlihof', address: 'Zu den drei Brunnen 150, 4058 Basel', type: 'Gymnasium', canton: 'Basel-Stadt', district: 'Riehen' },
      { id: '14', name: 'Gymnasium am Münsterplatz', address: 'Münsterplatz 15, 4051 Basel', type: 'Gymnasium', canton: 'Basel-Stadt', district: 'Altstadt' },
      
      // Basel-Landschaft Kindergärten
      { id: '15', name: 'Kindergarten Allschwil Dorf', address: 'Schulstrasse 1, 4123 Allschwil', type: 'Kindergarten', canton: 'Basel-Landschaft', district: 'Allschwil' },
      { id: '16', name: 'Kindergarten Birsfelden', address: 'Kirchgasse 52, 4127 Birsfelden', type: 'Kindergarten', canton: 'Basel-Landschaft', district: 'Birsfelden' },
      { id: '17', name: 'Kindergarten Muttenz Dorf', address: 'Hauptstrasse 75, 4132 Muttenz', type: 'Kindergarten', canton: 'Basel-Landschaft', district: 'Muttenz' },
      
      // Basel-Landschaft Primarschulen
      { id: '18', name: 'Primarschule Pratteln', address: 'Burggartenstrasse 14, 4133 Pratteln', type: 'Primarschule', canton: 'Basel-Landschaft', district: 'Pratteln' },
      { id: '19', name: 'Primarschule Liestal', address: 'Rosenstrasse 25, 4410 Liestal', type: 'Primarschule', canton: 'Basel-Landschaft', district: 'Liestal' },
      { id: '20', name: 'Primarschule Reinach', address: 'Aumattstrasse 43, 4153 Reinach', type: 'Primarschule', canton: 'Basel-Landschaft', district: 'Reinach' },
      { id: '21', name: 'Primarschule Münchenstein', address: 'Hauptstrasse 22, 4142 Münchenstein', type: 'Primarschule', canton: 'Basel-Landschaft', district: 'Münchenstein' },
      
      // Basel-Landschaft Sekundarschulen
      { id: '22', name: 'Sekundarschule Aesch', address: 'Schulstrasse 26, 4147 Aesch', type: 'Sekundarschule', canton: 'Basel-Landschaft', district: 'Aesch' },
      { id: '23', name: 'Sekundarschule Sissach', address: 'Schulhausstrasse 1, 4450 Sissach', type: 'Sekundarschule', canton: 'Basel-Landschaft', district: 'Sissach' },
      { id: '24', name: 'Sekundarschule Oberwil', address: 'Bättwilerstrasse 17, 4104 Oberwil', type: 'Sekundarschule', canton: 'Basel-Landschaft', district: 'Oberwil' },
      
      // Basel-Landschaft Gymnasien
      { id: '25', name: 'Gymnasium Muttenz', address: 'Grellingerstrasse 74, 4132 Muttenz', type: 'Gymnasium', canton: 'Basel-Landschaft', district: 'Muttenz' },
      { id: '26', name: 'Gymnasium Liestal', address: 'Friedensstrasse 20, 4410 Liestal', type: 'Gymnasium', canton: 'Basel-Landschaft', district: 'Liestal' },
      { id: '27', name: 'Gymnasium Oberwil', address: 'Allschwilerstrasse 85, 4104 Oberwil', type: 'Gymnasium', canton: 'Basel-Landschaft', district: 'Oberwil' }
    ];

    this.setState({ 
      schools: baselSchools,
      isLoading: false,
      appointments: this.state.appointments,
      newAppointment: this.state.newAppointment,
      isAddingNew: this.state.isAddingNew,
      currentView: this.state.currentView,
      selectedSchool: this.state.selectedSchool,
      error: this.state.error
    });
  }

  private _addAppointment = (): void => {
    const newAppointments = [...this.state.appointments, this.state.newAppointment];
    this.setState({
      appointments: newAppointments,
      newAppointment: this._getEmptyAppointment(),
      isAddingNew: false,
      schools: this.state.schools,
      selectedSchool: this.state.selectedSchool,
      isLoading: this.state.isLoading,
      error: this.state.error,
      currentView: this.state.currentView
    });
    
    if (this.props.onAppointmentsChange) {
      this.props.onAppointmentsChange(JSON.stringify(newAppointments));
    }
  }

  private _editAppointment = (appointment: IAppointment): void => {
    this.setState({
      newAppointment: { ...appointment },
      isAddingNew: true,
      appointments: this.state.appointments,
      schools: this.state.schools,
      selectedSchool: this.state.selectedSchool,
      isLoading: this.state.isLoading,
      error: this.state.error,
      currentView: this.state.currentView
    });
  }

  private _deleteAppointment = (id: string): void => {
    const newAppointments = this.state.appointments.filter(a => a.id !== id);
    this.setState({ 
      appointments: newAppointments,
      schools: this.state.schools,
      newAppointment: this.state.newAppointment,
      isAddingNew: this.state.isAddingNew,
      selectedSchool: this.state.selectedSchool,
      isLoading: this.state.isLoading,
      error: this.state.error,
      currentView: this.state.currentView
    });
    
    if (this.props.onAppointmentsChange) {
      this.props.onAppointmentsChange(JSON.stringify(newAppointments));
    }
  }

  private _getSchoolOptions = (): IDropdownOption[] => {
    return this.state.schools.map(school => ({
      key: school.id,
      text: `${school.name} (${school.type}, ${school.district})`
    }));
  }

  private _getFilteredAppointments = (): IAppointment[] => {
    let filtered = this.state.appointments;
    
    if (this.state.selectedSchool) {
      filtered = filtered.filter(a => a.school === this.state.selectedSchool);
    }
    
    return filtered.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }

  private _getStatistics = () => {
    const appointments = this.state.appointments;
    return {
      total: appointments.length,
      thisMonth: appointments.filter(a => 
        a.startDate.getMonth() === new Date().getMonth() &&
        a.startDate.getFullYear() === new Date().getFullYear()
      ).length,
      confirmed: appointments.filter(a => a.status === 'bestaetigt').length,
      completed: appointments.filter(a => a.status === 'durchgefuehrt').length
    };
  }

  public render(): React.ReactElement<ITimePlannerProps> {
    if (this.state.isLoading) {
      return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spinner size={SpinnerSize.large} label="Lädt Daten..." />
        </div>
      );
    }

    const stats = this._getStatistics();
    const filteredAppointments = this._getFilteredAppointments();

    return (
      <div className={styles.timePlanner}>
        {this.state.error && (
          <MessageBar messageBarType={MessageBarType.error} onDismiss={() => this.setState({ 
            error: '',
            appointments: this.state.appointments,
            schools: this.state.schools,
            newAppointment: this.state.newAppointment,
            isAddingNew: this.state.isAddingNew,
            selectedSchool: this.state.selectedSchool,
            isLoading: this.state.isLoading,
            currentView: this.state.currentView
          })}>
            {this.state.error}
          </MessageBar>
        )}
        
        {/* Header */}
        <div style={{
          minHeight: 'fit-content',
          margin: '0 0 20px 0',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          background: 'white',
          border: '1px solid #e1e1e1'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '20px',
            borderRadius: '8px 8px 0 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0 }}>🛡️ Präventions-Zeitplaner Basel</h1>
              <div style={{ opacity: 0.9 }}>Koordination von Präventionsprogrammen für Basel-Stadt und Basel-Landschaft</div>
            </div>
            <Icon iconName="Calendar" style={{ fontSize: '48px' }} />
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <div style={{
            flex: 1,
            padding: '20px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0' }}>{stats.total}</div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Termine Gesamt</div>
          </div>
          <div style={{
            flex: 1,
            padding: '20px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0' }}>{stats.thisMonth}</div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Dieser Monat</div>
          </div>
          <div style={{
            flex: 1,
            padding: '20px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0' }}>{stats.confirmed}</div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Bestätigt</div>
          </div>
          <div style={{
            flex: 1,
            padding: '20px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0' }}>{stats.completed}</div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Durchgeführt</div>
          </div>
        </div>

        {/* Navigation */}
        <Pivot
          selectedKey={this.state.currentView}
          onLinkClick={(item) => this.setState({ 
            currentView: item && item.props && item.props.itemKey || 'dashboard',
            appointments: this.state.appointments,
            schools: this.state.schools,
            newAppointment: this.state.newAppointment,
            isAddingNew: this.state.isAddingNew,
            selectedSchool: this.state.selectedSchool,
            isLoading: this.state.isLoading,
            error: this.state.error
          })}
          headersOnly={true}
        >
          <PivotItem linkText="📊 Dashboard" itemKey="dashboard" />
          <PivotItem linkText="🏫 Schulen" itemKey="schools" />
        </Pivot>

        {/* Main Content */}
        {this.state.currentView === 'dashboard' && (
          <div style={{
            minHeight: 'fit-content',
            margin: '0 0 20px 0',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            background: 'white',
            border: '1px solid #e1e1e1',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>
                📅 Präventionstermine
              </h2>
            </div>
            
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
              <Dropdown
                placeHolder="Schule auswählen..."
                options={[
                  { key: '', text: 'Alle Schulen' },
                  ...this._getSchoolOptions()
                ]}
                selectedKey={this.state.selectedSchool}
                onChanged={(option) => this.setState({ 
                  selectedSchool: option && option.key as string || '',
                  appointments: this.state.appointments,
                  schools: this.state.schools,
                  newAppointment: this.state.newAppointment,
                  isAddingNew: this.state.isAddingNew,
                  isLoading: this.state.isLoading,
                  error: this.state.error,
                  currentView: this.state.currentView
                })}
              />
              
              <PrimaryButton
                text="✨ Neuer Termin"
                iconProps={{ iconName: 'Add' }}
                onClick={() => this.setState({ 
                  isAddingNew: true,
                  appointments: this.state.appointments,
                  schools: this.state.schools,
                  newAppointment: this.state.newAppointment,
                  selectedSchool: this.state.selectedSchool,
                  isLoading: this.state.isLoading,
                  error: this.state.error,
                  currentView: this.state.currentView
                })}
              />
            </div>
            
            <DetailsList
              items={filteredAppointments}
              columns={this._columns}
              selectionMode={SelectionMode.none}
              layoutMode={1}
              isHeaderVisible={true}
            />
          </div>
        )}

        {this.state.currentView === 'schools' && (
          <div style={{
            minHeight: 'fit-content',
            margin: '0 0 20px 0',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            background: 'white',
            border: '1px solid #e1e1e1',
            padding: '20px'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>
              🏫 Schulen Übersicht ({this.state.schools.length} Schulen)
            </h2>
            
            <DetailsList
              items={this.state.schools}
              columns={[
                { key: 'name', name: 'Schulname', fieldName: 'name', minWidth: 200 },
                { key: 'type', name: 'Typ', fieldName: 'type', minWidth: 120 },
                { key: 'district', name: 'Bezirk', fieldName: 'district', minWidth: 120 },
                { key: 'canton', name: 'Kanton', fieldName: 'canton', minWidth: 120 },
                { key: 'address', name: 'Adresse', fieldName: 'address', minWidth: 250 }
              ]}
              selectionMode={SelectionMode.none}
              layoutMode={1}
              isHeaderVisible={true}
            />
          </div>
        )}
        
        {/* Add Appointment Panel */}
        <Panel
          isOpen={this.state.isAddingNew}
          onDismiss={() => this.setState({ 
            isAddingNew: false, 
            newAppointment: this._getEmptyAppointment(),
            appointments: this.state.appointments,
            schools: this.state.schools,
            selectedSchool: this.state.selectedSchool,
            isLoading: this.state.isLoading,
            error: this.state.error,
            currentView: this.state.currentView
          })}
          type={PanelType.medium}
          headerText="✨ Neuen Präventionstermin erstellen"
          closeButtonAriaLabel="Schließen"
        >
          <div style={{ padding: '20px 0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <TextField
                label="📝 Titel"
                value={this.state.newAppointment.title}
                onChanged={(value) => this.setState({
                  newAppointment: { ...this.state.newAppointment, title: value || '' },
                  appointments: this.state.appointments,
                  schools: this.state.schools,
                  isAddingNew: this.state.isAddingNew,
                  selectedSchool: this.state.selectedSchool,
                  isLoading: this.state.isLoading,
                  error: this.state.error,
                  currentView: this.state.currentView
                })}
                required
              />
              
              <Dropdown
                label="🏫 Schule"
                options={this._getSchoolOptions()}
                selectedKey={this.state.newAppointment.school}
                onChanged={(option) => this.setState({
                  newAppointment: { ...this.state.newAppointment, school: option && option.key as string || '' },
                  appointments: this.state.appointments,
                  schools: this.state.schools,
                  isAddingNew: this.state.isAddingNew,
                  selectedSchool: this.state.selectedSchool,
                  isLoading: this.state.isLoading,
                  error: this.state.error,
                  currentView: this.state.currentView
                })}
                required
              />
              
              <Dropdown
                label="🎯 Präventionstyp"
                options={this._preventionTypes}
                selectedKey={this.state.newAppointment.preventionType}
                onChanged={(option) => this.setState({
                  newAppointment: { ...this.state.newAppointment, preventionType: option && option.key as string || '' },
                  appointments: this.state.appointments,
                  schools: this.state.schools,
                  isAddingNew: this.state.isAddingNew,
                  selectedSchool: this.state.selectedSchool,
                  isLoading: this.state.isLoading,
                  error: this.state.error,
                  currentView: this.state.currentView
                })}
                required
              />
              
              <div style={{ display: 'flex', gap: '20px' }}>
                <DatePicker
                  label="📅 Startdatum"
                  value={this.state.newAppointment.startDate}
                  onSelectDate={(date) => this.setState({
                    newAppointment: { ...this.state.newAppointment, startDate: date || new Date() },
                    appointments: this.state.appointments,
                    schools: this.state.schools,
                    isAddingNew: this.state.isAddingNew,
                    selectedSchool: this.state.selectedSchool,
                    isLoading: this.state.isLoading,
                    error: this.state.error,
                    currentView: this.state.currentView
                  })}
                  formatDate={(date) => date && date.toLocaleDateString('de-CH') || ''}
                />
                
                <DatePicker
                  label="🏁 Enddatum"
                  value={this.state.newAppointment.endDate}
                  onSelectDate={(date) => this.setState({
                    newAppointment: { ...this.state.newAppointment, endDate: date || new Date() },
                    appointments: this.state.appointments,
                    schools: this.state.schools,
                    isAddingNew: this.state.isAddingNew,
                    selectedSchool: this.state.selectedSchool,
                    isLoading: this.state.isLoading,
                    error: this.state.error,
                    currentView: this.state.currentView
                  })}
                  formatDate={(date) => date && date.toLocaleDateString('de-CH') || ''}
                />
              </div>
              
              <Slider
                label={`👥 Anzahl Teilnehmer: ${this.state.newAppointment.participants}`}
                min={1}
                max={300}
                step={1}
                value={this.state.newAppointment.participants}
                onChange={(value) => this.setState({
                  newAppointment: { ...this.state.newAppointment, participants: value },
                  appointments: this.state.appointments,
                  schools: this.state.schools,
                  isAddingNew: this.state.isAddingNew,
                  selectedSchool: this.state.selectedSchool,
                  isLoading: this.state.isLoading,
                  error: this.state.error,
                  currentView: this.state.currentView
                })}
                showValue
              />
              
              <TextField
                label="📍 Ort/Raum"
                value={this.state.newAppointment.location}
                onChanged={(value) => this.setState({
                  newAppointment: { ...this.state.newAppointment, location: value || '' },
                  appointments: this.state.appointments,
                  schools: this.state.schools,
                  isAddingNew: this.state.isAddingNew,
                  selectedSchool: this.state.selectedSchool,
                  isLoading: this.state.isLoading,
                  error: this.state.error,
                  currentView: this.state.currentView
                })}
              />
              
              <TextField
                label="👤 Kontaktperson"
                value={this.state.newAppointment.contact}
                onChanged={(value) => this.setState({
                  newAppointment: { ...this.state.newAppointment, contact: value || '' },
                  appointments: this.state.appointments,
                  schools: this.state.schools,
                  isAddingNew: this.state.isAddingNew,
                  selectedSchool: this.state.selectedSchool,
                  isLoading: this.state.isLoading,
                  error: this.state.error,
                  currentView: this.state.currentView
                })}
              />
              
              <ChoiceGroup
                label="📊 Status"
                options={this._statusOptions}
                selectedKey={this.state.newAppointment.status}
                onChange={(ev, option) => this.setState({
                  newAppointment: { ...this.state.newAppointment, status: option && option.key || 'geplant' },
                  appointments: this.state.appointments,
                  schools: this.state.schools,
                  isAddingNew: this.state.isAddingNew,
                  selectedSchool: this.state.selectedSchool,
                  isLoading: this.state.isLoading,
                  error: this.state.error,
                  currentView: this.state.currentView
                })}
              />
              
              <TextField
                label="📝 Beschreibung"
                multiline
                rows={3}
                value={this.state.newAppointment.description}
                onChanged={(value) => this.setState({
                  newAppointment: { ...this.state.newAppointment, description: value || '' },
                  appointments: this.state.appointments,
                  schools: this.state.schools,
                  isAddingNew: this.state.isAddingNew,
                  selectedSchool: this.state.selectedSchool,
                  isLoading: this.state.isLoading,
                  error: this.state.error,
                  currentView: this.state.currentView
                })}
              />
              
              <TextField
                label="📋 Notizen"
                multiline
                rows={2}
                value={this.state.newAppointment.notes}
                onChanged={(value) => this.setState({
                  newAppointment: { ...this.state.newAppointment, notes: value || '' },
                  appointments: this.state.appointments,
                  schools: this.state.schools,
                  isAddingNew: this.state.isAddingNew,
                  selectedSchool: this.state.selectedSchool,
                  isLoading: this.state.isLoading,
                  error: this.state.error,
                  currentView: this.state.currentView
                })}
              />
            </div>
            
            <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
              <PrimaryButton
                text="💾 Speichern"
                onClick={this._addAppointment}
                disabled={!this.state.newAppointment.title || !this.state.newAppointment.school}
              />
              <DefaultButton
                text="❌ Abbrechen"
                onClick={() => this.setState({ 
                  isAddingNew: false, 
                  newAppointment: this._getEmptyAppointment(),
                  appointments: this.state.appointments,
                  schools: this.state.schools,
                  selectedSchool: this.state.selectedSchool,
                  isLoading: this.state.isLoading,
                  error: this.state.error,
                  currentView: this.state.currentView
                })}
              />
            </div>
          </div>
        </Panel>
      </div>
    );
  }
}
