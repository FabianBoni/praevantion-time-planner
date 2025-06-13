import * as React from 'react';
import { IPraeventionTimePlannerProps } from './IPraeventionTimePlannerProps';
import { TeamMember, AppointmentRequest, ScheduledAppointment, School, formatDate } from '../../../common/types';
import { SchedulingService } from '../../../common/schedulingService';
import { sampleTeamMembers, baselSchools } from '../../../common/sampleData';
import styles from './PraeventionTimePlanner.module.scss';
import { 
  PrimaryButton, 
  DefaultButton, 
  TextField, 
  Dropdown, 
  IDropdownOption,
  MessageBar,
  MessageBarType,
  Spinner,
  SpinnerSize,
  Panel,
  PanelType
} from 'office-ui-fabric-react';

interface IPraeventionTimePlannerState {
  teamMembers: TeamMember[];
  schools: School[];
  appointmentRequest: AppointmentRequest;
  searchResults: ScheduledAppointment[][];
  isSearching: boolean;
  existingAppointments: ScheduledAppointment[];
  selectedSeries: ScheduledAppointment[] | null;
  showDetailsPanel: boolean;
}

export default class PraeventionTimePlanner extends React.Component<IPraeventionTimePlannerProps, IPraeventionTimePlannerState> {

  constructor(props: IPraeventionTimePlannerProps) {
    super(props);

    this.state = {
      teamMembers: sampleTeamMembers,
      schools: baselSchools,
      appointmentRequest: {
        schoolId: '',
        teacherName: '',
        teacherEmail: '',
        preferredDays: [],
        preferredTimeStart: '08:45',
        preferredTimeEnd: '10:15',
        notes: ''
      },
      searchResults: [],
      isSearching: false,
      existingAppointments: [],
      selectedSeries: null,
      showDetailsPanel: false
    };
  }

  private handleDayToggle = (day: string): void => {
    this.setState(prevState => ({
      appointmentRequest: {
        ...prevState.appointmentRequest,
        preferredDays: prevState.appointmentRequest.preferredDays.indexOf(day) > -1
          ? prevState.appointmentRequest.preferredDays.filter(d => d !== day)
          : [...prevState.appointmentRequest.preferredDays, day]
      }
    }));
  }

  private handleInputChange = (field: keyof AppointmentRequest, value: string): void => {
    this.setState(prevState => ({
      appointmentRequest: {
        ...prevState.appointmentRequest,
        [field]: value
      }
    }));
  }
  private handleSearch = (): void => {
    const { appointmentRequest, schools, teamMembers, existingAppointments } = this.state;
    
    if (!appointmentRequest.schoolId || !appointmentRequest.teacherName || appointmentRequest.preferredDays.length === 0) {
      // In einer echten SPFx-Implementierung würde hier eine Notification angezeigt
      alert('Bitte füllen Sie alle Pflichtfelder aus.');
      return;
    }

    this.setState({ isSearching: true });
    
    // Simuliere eine kurze Ladezeit
    setTimeout(() => {
      let selectedSchool: School | undefined = undefined;
      for (let i = 0; i < schools.length; i++) {
        if (schools[i].id === appointmentRequest.schoolId) {
          selectedSchool = schools[i];
          break;
        }
      }

      if (!selectedSchool) {
        alert('Schule nicht gefunden.');
        this.setState({ isSearching: false });
        return;
      }

      const results = SchedulingService.findAvailableAppointmentSeries(
        teamMembers,
        appointmentRequest,
        selectedSchool,
        existingAppointments
      );

      this.setState({ 
        searchResults: results,
        isSearching: false 
      });
    }, 1000);
  }

  private getDayDisplayName = (day: string): string => {
    const dayNames: { [key: string]: string } = {
      'monday': 'Montag',
      'tuesday': 'Dienstag',
      'wednesday': 'Mittwoch',
      'thursday': 'Donnerstag',
      'friday': 'Freitag',
      'saturday': 'Samstag',
      'sunday': 'Sonntag'
    };
    return dayNames[day] || day;
  }

  private getTeamPairStats = () => {
    const { teamMembers } = this.state;
    const pairs = SchedulingService.generateTeamPairs(teamMembers);
    let maleCount = 0;
    let femaleCount = 0;
    
    for (let i = 0; i < teamMembers.length; i++) {
      if (teamMembers[i].gender === 'male') maleCount++;
      if (teamMembers[i].gender === 'female') femaleCount++;
    }
    
    return {
      totalPairs: pairs.length,
      maleMembers: maleCount,
      femaleMembers: femaleCount
    };
  }

  private showSeriesDetails = (series: ScheduledAppointment[]): void => {
    this.setState({
      selectedSeries: series,
      showDetailsPanel: true
    });
  }

  private hideDetailsPanel = (): void => {
    this.setState({
      selectedSeries: null,
      showDetailsPanel: false
    });
  }

  public render(): React.ReactElement<IPraeventionTimePlannerProps> {
    const { 
      appointmentRequest, 
      schools, 
      teamMembers, 
      searchResults, 
      isSearching,
      selectedSeries,
      showDetailsPanel
    } = this.state;
    
    const stats = this.getTeamPairStats();

    const schoolOptions: IDropdownOption[] = [
      { key: '', text: 'Bitte wählen...' },
      ...schools.map(school => ({ key: school.id, text: school.name }))
    ];

    const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

    return (
      <div className={styles.praeventionTimePlanner}>
        <div className={styles.header}>
          <h1>Prävention Terminplaner</h1>
          <p>Intelligente Terminplanung für Schulbesuche in Basel-Stadt</p>
        </div>

        {/* Team-Übersicht */}
        <div className={styles.section}>
          <h2>Team-Übersicht</h2>
          <MessageBar messageBarType={MessageBarType.info}>
            <strong>Team-Statistik:</strong> {stats.totalPairs} mögliche gemischtgeschlechtliche Teampaare 
            ({stats.maleMembers} Männer, {stats.femaleMembers} Frauen)
          </MessageBar>
          
          <div className={styles.teamGrid}>
            {teamMembers.map(member => (
              <div key={member.id} className={styles.teamMember}>
                <h3>{member.name}</h3>
                <span className={`${styles.gender} ${member.gender === 'male' ? styles.male : styles.female}`}>
                  {member.gender === 'male' ? 'Mann' : 'Frau'}
                </span>
                <p><strong>Email:</strong> {member.email}</p>
                <p><strong>Verfügbarkeit:</strong> Mo-Fr (vereinfacht dargestellt)</p>
              </div>
            ))}
          </div>
        </div>

        {/* Terminanfrage */}
        <div className={styles.section}>
          <h2>Neue Terminanfrage</h2>
          
          <div className={styles.twoColumn}>
            <div>
              <Dropdown
                label="Schule *"
                options={schoolOptions}
                selectedKey={appointmentRequest.schoolId}
                onChange={(event, option) => this.handleInputChange('schoolId', option ? option.key as string : '')}
              />

              <TextField
                label="Name der Lehrperson *"
                value={appointmentRequest.teacherName}
                onChange={(event, value) => this.handleInputChange('teacherName', value || '')}
                placeholder="z.B. Frau Meier"
              />

              <TextField
                label="Email der Lehrperson"
                value={appointmentRequest.teacherEmail}
                onChange={(event, value) => this.handleInputChange('teacherEmail', value || '')}
                placeholder="lehrperson@schule.ch"
                type="email"
              />
            </div>

            <div>
              <div className={styles.formGroup}>
                <label>Bevorzugte Wochentage *</label>
                <div className={styles.timeSlotGrid}>
                  {weekDays.map(day => (
                    <div
                      key={day}
                      className={`${styles.timeSlot} ${appointmentRequest.preferredDays.indexOf(day) > -1 ? styles.selected : ''}`}
                      onClick={() => this.handleDayToggle(day)}
                    >
                      {this.getDayDisplayName(day)}
                    </div>
                  ))}
                </div>
              </div>

              <TextField
                label="Startzeit"
                type="time"
                value={appointmentRequest.preferredTimeStart}
                onChange={(event, value) => this.handleInputChange('preferredTimeStart', value || '')}
              />

              <TextField
                label="Endzeit"
                type="time"
                value={appointmentRequest.preferredTimeEnd}
                onChange={(event, value) => this.handleInputChange('preferredTimeEnd', value || '')}
              />
            </div>
          </div>

          <TextField
            label="Bemerkungen"
            multiline
            rows={3}
            value={appointmentRequest.notes}
            onChange={(event, value) => this.handleInputChange('notes', value || '')}
            placeholder="Weitere Informationen oder Wünsche..."
          />

          <PrimaryButton 
            text={isSearching ? 'Suche läuft...' : 'Termine suchen'}
            onClick={this.handleSearch}
            disabled={isSearching}
          />
        </div>

        {/* Suchergebnisse */}
        {isSearching && (
          <div className={styles.section}>
            <Spinner size={SpinnerSize.large} label="Suche nach verfügbaren Terminen..." />
          </div>
        )}

        {!isSearching && searchResults.length > 0 && (
          <div className={styles.section}>
            <h2>Verfügbare Terminserien</h2>
            <MessageBar messageBarType={MessageBarType.success}>
              {searchResults.length} vollständige Terminserien gefunden! 
              Jede Serie umfasst 5 Termine im Abstand von 2-4 Wochen.
            </MessageBar>

            {searchResults.map((series, seriesIndex) => (
              <div key={seriesIndex} className={styles.appointmentSlot}>
                <h3>
                  Option {seriesIndex + 1}: {series[0].teamMembers[0].name} & {series[0].teamMembers[1].name}
                </h3>
                
                <div className={styles.appointmentDetails}>
                  {series.map((appointment, index) => (
                    <div key={appointment.id}>
                      <strong>Termin {appointment.sessionNumber}</strong>
                      <div>{formatDate(appointment.date)}</div>
                      <div>{appointment.startTime} - {appointment.endTime}</div>
                      <div className={styles.teamInfo}>
                        {appointment.teamMembers[0].name} & {appointment.teamMembers[1].name}
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.buttonGroup}>
                  <DefaultButton 
                    text="Details anzeigen"
                    onClick={() => this.showSeriesDetails(series)}
                  />
                  <PrimaryButton text="Diese Terminserie buchen" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isSearching && searchResults.length === 0 && appointmentRequest.schoolId && (
          <div className={styles.section}>
            <MessageBar messageBarType={MessageBarType.warning}>
              Keine vollständigen Terminserien gefunden. 
              Versuchen Sie andere Wochentage oder Zeiten, oder kontaktieren Sie das Team für alternative Lösungen.
            </MessageBar>
          </div>
        )}

        {/* Systeminformationen */}
        <div className={styles.section}>
          <h2>Systeminformationen</h2>
          <MessageBar messageBarType={MessageBarType.info}>
            <strong>Über das System:</strong><br />
            • {schools.length} Schulen in Basel-Stadt erfasst<br />
            • {teamMembers.length} Teammitglieder verfügbar<br />
            • {stats.totalPairs} mögliche Teamzusammenstellungen<br />
            • Automatische Suche nach 5er-Terminserien mit 2-4 Wochen Abstand<br />
            • SharePoint-Integration für Kalenderverwaltung<br />
            • Unterstützung für ca. 400 Termine jährlich
          </MessageBar>
        </div>

        {/* Details Panel */}
        <Panel
          isOpen={showDetailsPanel}
          type={PanelType.medium}
          onDismiss={this.hideDetailsPanel}
          headerText="Terminserie Details"
        >
          {selectedSeries && (
            <div>
              <h3>Team: {selectedSeries[0].teamMembers[0].name} & {selectedSeries[0].teamMembers[1].name}</h3>
              <p><strong>Schule:</strong> {selectedSeries[0].school.name}</p>
              <p><strong>Lehrperson:</strong> {selectedSeries[0].teacherName}</p>
              
              <h4>Alle Termine:</h4>
              {selectedSeries.map((appointment) => (
                <div key={appointment.id} className={styles.appointmentDetail}>
                  <strong>Termin {appointment.sessionNumber}</strong>
                  <p>Datum: {formatDate(appointment.date)}</p>
                  <p>Zeit: {appointment.startTime} - {appointment.endTime}</p>
                  <p>Team: {appointment.teamMembers[0].name} & {appointment.teamMembers[1].name}</p>
                  <hr />
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    );
  }
}
