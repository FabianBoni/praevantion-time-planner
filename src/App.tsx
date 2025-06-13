import React, { useState } from 'react';
import { TeamMember, AppointmentRequest, ScheduledAppointment, School } from './types';
import { SchedulingService } from './schedulingService';
import { sampleTeamMembers, baselSchools } from './sampleData';
import { formatDate } from './types';
import { Calendar, Users, Clock, School as SchoolIcon, CheckCircle, AlertCircle } from 'lucide-react';

function App() {
  const [teamMembers] = useState<TeamMember[]>(sampleTeamMembers);
  const [schools] = useState<School[]>(baselSchools);
  const [appointmentRequest, setAppointmentRequest] = useState<AppointmentRequest>({
    schoolId: '',
    teacherName: '',
    teacherEmail: '',
    preferredDays: [],
    preferredTimeStart: '08:45',
    preferredTimeEnd: '10:15',
    notes: ''
  });
  const [searchResults, setSearchResults] = useState<ScheduledAppointment[][]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [existingAppointments] = useState<ScheduledAppointment[]>([]); // Hier würden bestehende Termine stehen

  const handleDayToggle = (day: string) => {
    setAppointmentRequest(prev => ({
      ...prev,
      preferredDays: prev.preferredDays.includes(day)
        ? prev.preferredDays.filter(d => d !== day)
        : [...prev.preferredDays, day]
    }));
  };

  const handleSearch = async () => {
    if (!appointmentRequest.schoolId || !appointmentRequest.teacherName || appointmentRequest.preferredDays.length === 0) {
      alert('Bitte füllen Sie alle Pflichtfelder aus.');
      return;
    }

    setIsSearching(true);
    
    // Simuliere eine kurze Ladezeit
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const selectedSchool = schools.find(s => s.id === appointmentRequest.schoolId);
    if (!selectedSchool) {
      alert('Schule nicht gefunden.');
      setIsSearching(false);
      return;
    }

    const results = SchedulingService.findAvailableAppointmentSeries(
      teamMembers,
      appointmentRequest,
      selectedSchool,
      existingAppointments
    );

    setSearchResults(results);
    setIsSearching(false);
  };

  const getDayDisplayName = (day: string): string => {
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

  const getTeamPairStats = () => {
    const pairs = SchedulingService.generateTeamPairs(teamMembers);
    return {
      totalPairs: pairs.length,
      maleMembers: teamMembers.filter(m => m.gender === 'male').length,
      femaleMembers: teamMembers.filter(m => m.gender === 'female').length
    };
  };

  const stats = getTeamPairStats();

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <h1>Prävention Terminplaner</h1>
        <p>Intelligente Terminplanung für Schulbesuche in Basel-Stadt</p>
      </div>

      {/* Team-Übersicht */}
      <div className="section">
        <h2><Users className="inline w-6 h-6 mr-2" />Team-Übersicht</h2>
        <div className="alert info">
          <strong>Team-Statistik:</strong> {stats.totalPairs} mögliche gemischtgeschlechtliche Teampaare 
          ({stats.maleMembers} Männer, {stats.femaleMembers} Frauen)
        </div>
        <div className="team-grid">
          {teamMembers.map(member => (
            <div key={member.id} className="team-member">
              <h3>{member.name}</h3>
              <span className={`gender ${member.gender}`}>
                {member.gender === 'male' ? 'Mann' : 'Frau'}
              </span>
              <p><strong>Email:</strong> {member.email}</p>
              <p><strong>Verfügbarkeit:</strong> Mo-Fr (vereinfacht dargestellt)</p>
            </div>
          ))}
        </div>
      </div>

      {/* Terminanfrage */}
      <div className="section">
        <h2><Calendar className="inline w-6 h-6 mr-2" />Neue Terminanfrage</h2>
        
        <div className="two-column">
          <div>
            <div className="form-group">
              <label>Schule *</label>
              <select 
                value={appointmentRequest.schoolId}
                onChange={(e) => setAppointmentRequest(prev => ({ ...prev, schoolId: e.target.value }))}
              >
                <option value="">Bitte wählen...</option>
                {schools.map(school => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Name der Lehrperson *</label>
              <input
                type="text"
                value={appointmentRequest.teacherName}
                onChange={(e) => setAppointmentRequest(prev => ({ ...prev, teacherName: e.target.value }))}
                placeholder="z.B. Frau Meier"
              />
            </div>

            <div className="form-group">
              <label>Email der Lehrperson</label>
              <input
                type="email"
                value={appointmentRequest.teacherEmail}
                onChange={(e) => setAppointmentRequest(prev => ({ ...prev, teacherEmail: e.target.value }))}
                placeholder="lehrperson@schule.ch"
              />
            </div>
          </div>

          <div>
            <div className="form-group">
              <label>Bevorzugte Wochentage *</label>
              <div className="time-slot-grid">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map(day => (
                  <div
                    key={day}
                    className={`time-slot ${appointmentRequest.preferredDays.includes(day) ? 'selected' : ''}`}
                    onClick={() => handleDayToggle(day)}
                  >
                    {getDayDisplayName(day)}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Startzeit</label>
              <input
                type="time"
                value={appointmentRequest.preferredTimeStart}
                onChange={(e) => setAppointmentRequest(prev => ({ ...prev, preferredTimeStart: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label>Endzeit</label>
              <input
                type="time"
                value={appointmentRequest.preferredTimeEnd}
                onChange={(e) => setAppointmentRequest(prev => ({ ...prev, preferredTimeEnd: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Bemerkungen</label>
          <textarea
            rows={3}
            value={appointmentRequest.notes}
            onChange={(e) => setAppointmentRequest(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Weitere Informationen oder Wünsche..."
          />
        </div>

        <button 
          className="btn" 
          onClick={handleSearch}
          disabled={isSearching}
        >
          {isSearching ? 'Suche läuft...' : 'Termine suchen'}
        </button>
      </div>

      {/* Suchergebnisse */}
      {isSearching && (
        <div className="section">
          <div className="loading">
            <Clock className="inline w-6 h-6 mr-2" />
            Suche nach verfügbaren Terminen...
          </div>
        </div>
      )}

      {!isSearching && searchResults.length > 0 && (
        <div className="section">
          <h2><CheckCircle className="inline w-6 h-6 mr-2" />Verfügbare Terminserien</h2>
          <div className="alert success">
            {searchResults.length} vollständige Terminserien gefunden! 
            Jede Serie umfasst 5 Termine im Abstand von 2-4 Wochen.
          </div>

          {searchResults.map((series, seriesIndex) => (
            <div key={seriesIndex} className="appointment-slot">
              <h3>
                Option {seriesIndex + 1}: {series[0].teamMembers[0].name} & {series[0].teamMembers[1].name}
              </h3>
              
              <div className="appointment-details">
                {series.map((appointment, index) => (
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
                <button className="btn">
                  Diese Terminserie buchen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isSearching && searchResults.length === 0 && appointmentRequest.schoolId && (
        <div className="section">
          <div className="alert warning">
            <AlertCircle className="inline w-6 h-6 mr-2" />
            Keine vollständigen Terminserien gefunden. 
            Versuchen Sie andere Wochentage oder Zeiten, oder kontaktieren Sie das Team für alternative Lösungen.
          </div>
        </div>
      )}

      {/* Informationen */}
      <div className="section">
        <h2><SchoolIcon className="inline w-6 h-6 mr-2" />Systeminformationen</h2>
        <div className="alert info">
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
  );
}

export default App;
