import * as React from 'react';
import styles from './PraeventionTimeplaner.module.scss';
import { IPraeventionTimeplanerProps } from './IPraeventionTimeplanerProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { TeamMember, AppointmentRequest, ScheduledAppointment, School, formatDate } from './types';
import { SchedulingService } from './schedulingService';
import { sampleTeamMembers, baselSchools } from './sampleData';


export default class PraeventionTimeplaner extends React.Component<IPraeventionTimeplanerProps, any> {
  constructor(props: IPraeventionTimeplanerProps) {
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
      existingAppointments: []
    };
  }

  private handleDayToggle = (day: string) => {
    this.setState((prevState: any) => ({
      appointmentRequest: {
        ...prevState.appointmentRequest,
        preferredDays: prevState.appointmentRequest.preferredDays.includes(day)
          ? prevState.appointmentRequest.preferredDays.filter((d: string) => d !== day)
          : [...prevState.appointmentRequest.preferredDays, day]
      }
    }));
  };

  private handleSearch = async () => {
    const { appointmentRequest, schools, teamMembers, existingAppointments } = this.state;

    if (!appointmentRequest.schoolId || !appointmentRequest.teacherName || appointmentRequest.preferredDays.length === 0) {
      alert('Bitte füllen Sie alle Pflichtfelder aus.');
      return;
    }

    this.setState({ isSearching: true });

    await new Promise(resolve => setTimeout(resolve, 1000));

    const selectedSchool = schools.find((s: School) => s.id === appointmentRequest.schoolId);
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

    this.setState({ searchResults: results, isSearching: false });
  };

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
  };

  private getTeamPairStats = () => {
    const { teamMembers } = this.state;
    const pairs = SchedulingService.generateTeamPairs(teamMembers);
    return {
      totalPairs: pairs.length,
      maleMembers: teamMembers.filter((m: TeamMember) => m.gender === 'male').length,
      femaleMembers: teamMembers.filter((m: TeamMember) => m.gender === 'female').length
    };
  };

  public render(): React.ReactElement<IPraeventionTimeplanerProps> {
    const { appointmentRequest, searchResults, isSearching, teamMembers, schools } = this.state;
    const stats = this.getTeamPairStats();

    return (
      <div className={styles.praeventionTimeplaner}>
        <div className={styles.container}>
          {/* Header */}
          <div className={styles.header}>
            <h1>Prävention Terminplaner</h1>
            <p>Intelligente Terminplanung für Schulbesuche in Basel-Stadt</p>
          </div>

          {/* Team-Übersicht */}
          <div className={styles.section}>
            <h2>Team-Übersicht</h2>
            <div className={`${styles.alert} ${styles.info}`}>
              <strong>Team-Statistik:</strong> {stats.totalPairs} mögliche gemischtgeschlechtliche Teampaare
              ({stats.maleMembers} Männer, {stats.femaleMembers} Frauen)
            </div>
            <div className={styles['team-grid']}>
              {teamMembers.map((member: TeamMember) => (
                <div key={member.id} className={styles['team-member']}>
                  <h3>{member.name}</h3>
                  <span className={`${styles.gender} ${styles[member.gender]}`}>
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

            <div className={styles['two-column']}>
              <div>
                <div className={styles['form-group']}>
                  <label>Schule *</label>
                  <select
                    value={appointmentRequest.schoolId}
                    onChange={(e) => this.setState({ appointmentRequest: { ...appointmentRequest, schoolId: e.target.value } })}
                  >
                    <option value="">Bitte wählen...</option>
                    {schools.map((school: School) => (
                      <option key={school.id} value={school.id}>
                        {school.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles['form-group']}>
                  <label>Name der Lehrperson *</label>
                  <input
                    type="text"
                    value={appointmentRequest.teacherName}
                    onChange={(e) => this.setState({ appointmentRequest: { ...appointmentRequest, teacherName: e.target.value } })}
                    placeholder="z.B. Frau Meier"
                  />
                </div>

                <div className={styles['form-group']}>
                  <label>Email der Lehrperson</label>
                  <input
                    type="email"
                    value={appointmentRequest.teacherEmail}
                    onChange={(e) => this.setState({ appointmentRequest: { ...appointmentRequest, teacherEmail: e.target.value } })}
                    placeholder="lehrperson@schule.ch"
                  />
                </div>
              </div>

              <div>
                <div className={styles['form-group']}>
                  <label>Bevorzugte Wochentage *</label>
                  <div className={styles['time-slot-grid']}>
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map(day => (
                      <div
                        key={day}
                        className={`${styles['time-slot']} ${appointmentRequest.preferredDays.includes(day) ? styles.selected : ''}`}
                        onClick={() => this.handleDayToggle(day)}
                      >
                        {this.getDayDisplayName(day)}
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles['form-group']}>
                  <label>Startzeit</label>
                  <input
                    type="time"
                    value={appointmentRequest.preferredTimeStart}
                    onChange={(e) => this.setState({ appointmentRequest: { ...appointmentRequest, preferredTimeStart: e.target.value } })}
                  />
                </div>

                <div className={styles['form-group']}>
                  <label>Endzeit</label>
                  <input
                    type="time"
                    value={appointmentRequest.preferredTimeEnd}
                    onChange={(e) => this.setState({ appointmentRequest: { ...appointmentRequest, preferredTimeEnd: e.target.value } })}
                  />
                </div>
              </div>
            </div>

            <div className={styles['form-group']}>
              <label>Bemerkungen</label>
              <textarea
                rows={3}
                value={appointmentRequest.notes}
                onChange={(e) => this.setState({ appointmentRequest: { ...appointmentRequest, notes: e.target.value } })}
                placeholder="Weitere Informationen oder Wünsche..."
              />
            </div>

            <button
              className={styles.btn}
              onClick={this.handleSearch}
              disabled={isSearching}
            >
              {isSearching ? 'Suche läuft...' : 'Termine suchen'}
            </button>
          </div>

          {/* Suchergebnisse */}
          {isSearching && (
            <div className={styles.section}>
              <div className={styles.loading}>
                Suche nach verfügbaren Terminen...
              </div>
            </div>
          )}

          {!isSearching && searchResults.length > 0 && (
            <div className={styles.section}>
              <h2>Verfügbare Terminserien</h2>
              <div className={`${styles.alert} ${styles.success}`}>
                {searchResults.length} vollständige Terminserien gefunden!
                Jede Serie umfasst 5 Termine im Abstand von 2-4 Wochen.
              </div>

              {searchResults.map((series: ScheduledAppointment[], seriesIndex: number) => (
                <div key={seriesIndex} className={styles['appointment-slot']}>
                  <h3>
                    Option {seriesIndex + 1}: {series[0].teamMembers[0].name} & {series[0].teamMembers[1].name}
                  </h3>

                  <div className={styles['appointment-details']}>
                    {series.map((appointment: ScheduledAppointment) => (
                      <div key={appointment.id}>
                        <strong>Termin {appointment.sessionNumber}</strong>
                        <div>{formatDate(appointment.date)}</div>
                        <div>{appointment.startTime} - {appointment.endTime}</div>
                        <div className="text-sm text-gray-600">
                          {appointment.teamMembers[0].name} & {appointment.teamMembers[1].name}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '1rem' }}>
                    <button className={styles.btn}>
                      Diese Terminserie buchen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isSearching && searchResults.length === 0 && appointmentRequest.schoolId && (
            <div className={styles.section}>
              <div className={`${styles.alert} ${styles.warning}`}>
                Keine vollständigen Terminserien gefunden.
                Versuchen Sie andere Wochentage oder Zeiten, oder kontaktieren Sie das Team für alternative Lösungen.
              </div>
            </div>
          )}

          {/* Informationen */}
          <div className={styles.section}>
            <h2>Systeminformationen</h2>
            <div className={`${styles.alert} ${styles.info}`}>
              <strong>Über das System:</strong><br />
              • {schools.length} Schulen in Basel-Stadt erfasst<br />
              • {teamMembers.length} Teammitglieder verfügbar<br />
              • {stats.totalPairs} mögliche Teamzusammenstellungen<br />
              • Automatische Suche nach 5er-Terminserien mit 2-4 Wochen Abstand<br />
              • Integration von Outlook-Kalendern geplant<br />
              • Unterstützung für ca. 400 Termine jährlich
            </div>
          </div>
        </div>
      </div>
    );
  }
}
