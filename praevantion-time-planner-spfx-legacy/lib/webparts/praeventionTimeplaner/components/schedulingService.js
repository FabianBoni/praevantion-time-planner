import { addWeeks, addDays, format } from 'date-fns';
import { de } from 'date-fns/locale';
// Simulation von Outlook-Kalenderdaten
var SchedulingService = (function () {
    function SchedulingService() {
    }
    // Prüft ob zwei Teammitglieder gemischtgeschlechtlich sind
    SchedulingService.isValidTeamPair = function (member1, member2) {
        return member1.gender !== member2.gender;
    };
    // Generiert alle möglichen gemischtgeschlechtlichen Teampaare
    SchedulingService.generateTeamPairs = function (teamMembers) {
        var pairs = [];
        for (var i = 0; i < teamMembers.length; i++) {
            for (var j = i + 1; j < teamMembers.length; j++) {
                if (this.isValidTeamPair(teamMembers[i], teamMembers[j])) {
                    pairs.push([teamMembers[i], teamMembers[j]]);
                }
            }
        }
        return pairs;
    };
    // Konvertiert Wochentag-String zu Datum
    SchedulingService.getNextDateForDay = function (dayName, startDate) {
        if (startDate === void 0) { startDate = new Date(); }
        var dayIndex = {
            'monday': 1,
            'tuesday': 2,
            'wednesday': 3,
            'thursday': 4,
            'friday': 5,
            'saturday': 6,
            'sunday': 0
        }[dayName.toLowerCase()];
        if (dayIndex === undefined) {
            throw new Error("Unbekannter Wochentag: " + dayName);
        }
        var currentDay = startDate.getDay();
        var daysUntilTarget = (dayIndex - currentDay + 7) % 7;
        var targetDate = addDays(startDate, daysUntilTarget === 0 ? 7 : daysUntilTarget);
        return targetDate;
    };
    // Prüft Verfügbarkeit eines Teams an einem bestimmten Datum/Zeit
    SchedulingService.isTeamAvailable = function (team, date, startTime, endTime, existingAppointments) {
        if (existingAppointments === void 0) { existingAppointments = []; }
        var dayName = format(date, 'EEEE', { locale: de }).toLowerCase();
        // Prüfe ob beide Teammitglieder grundsätzlich verfügbar sind
        for (var _i = 0, team_1 = team; _i < team_1.length; _i++) {
            var member = team_1[_i];
            var dayAvailability = member.availability && member.availability.find(function (slot) {
                return slot.day.toLowerCase() === dayName;
            });
            if (!dayAvailability) {
                return false; // Kein verfügbares Zeitfenster für diesen Tag
            }
            // Prüfe Zeitüberschneidung
            if (startTime < dayAvailability.startTime || endTime > dayAvailability.endTime) {
                return false; // Gewünschte Zeit liegt außerhalb der Verfügbarkeit
            }
        }
        // Prüfe auf Konflikte mit bestehenden Terminen
        var dateStr = format(date, 'yyyy-MM-dd');
        for (var _a = 0, existingAppointments_1 = existingAppointments; _a < existingAppointments_1.length; _a++) {
            var appointment = existingAppointments_1[_a];
            var appointmentDateStr = format(appointment.date, 'yyyy-MM-dd');
            if (appointmentDateStr === dateStr) {
                var _loop_1 = function (teamMember) {
                    if (appointment.teamMembers.some(function (m) { return m.id === teamMember.id; })) {
                        // Prüfe Zeitüberschneidung
                        if (!(endTime <= appointment.startTime || startTime >= appointment.endTime)) {
                            return { value: false };
                        }
                    }
                };
                // Prüfe ob eines der Teammitglieder bereits einen Termin hat
                for (var _b = 0, team_2 = team; _b < team_2.length; _b++) {
                    var teamMember = team_2[_b];
                    var state_1 = _loop_1(teamMember);
                    if (typeof state_1 === "object")
                        return state_1.value;
                }
            }
        }
        return true;
    };
    // Sucht verfügbare Termine für eine Terminserie
    SchedulingService.findAvailableAppointmentSeries = function (teamMembers, request, school, existingAppointments, startFromDate) {
        if (existingAppointments === void 0) { existingAppointments = []; }
        if (startFromDate === void 0) { startFromDate = new Date(); }
        var availableSeries = [];
        var teamPairs = this.generateTeamPairs(teamMembers);
        // Für jedes mögliche Teampaar
        for (var _i = 0, teamPairs_1 = teamPairs; _i < teamPairs_1.length; _i++) {
            var teamPair = teamPairs_1[_i];
            var series = this.findSeriesForTeam(teamPair, request, school, existingAppointments, startFromDate);
            if (series.length > 0) {
                availableSeries.push(series);
            }
        }
        // Sortiere nach frühestem Startdatum
        availableSeries.sort(function (a, b) {
            return a[0].date.getTime() - b[0].date.getTime();
        });
        return availableSeries.slice(0, 5); // Maximal 5 Optionen zurückgeben
    };
    SchedulingService.findSeriesForTeam = function (teamPair, request, school, existingAppointments, startFromDate) {
        var seriesId = "series_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
        var appointments = [];
        // Starte die Suche ab dem nächstmöglichen Datum
        var searchDate = new Date(startFromDate);
        var maxSearchWeeks = 52; // Suche bis zu einem Jahr in die Zukunft
        for (var weekOffset = 0; weekOffset < maxSearchWeeks && appointments.length < 5; weekOffset++) {
            var currentSearchDate = addWeeks(searchDate, weekOffset);
            // Prüfe jeden gewünschten Wochentag
            for (var _i = 0, _a = request.preferredDays; _i < _a.length; _i++) {
                var preferredDay = _a[_i];
                if (appointments.length >= 5)
                    break;
                var targetDate = this.getNextDateForDay(preferredDay, currentSearchDate);
                // Stelle sicher, dass die Termine den Mindestabstand haben
                if (appointments.length > 0) {
                    var lastAppointment = appointments[appointments.length - 1];
                    var weeksDifference = Math.floor((targetDate.getTime() - lastAppointment.date.getTime()) / (7 * 24 * 60 * 60 * 1000));
                    // Mindestens 2 Wochen, maximal 4 Wochen Abstand
                    if (weeksDifference < 2 || weeksDifference > 4) {
                        continue;
                    }
                }
                // Prüfe Verfügbarkeit
                if (this.isTeamAvailable(teamPair, targetDate, request.preferredTimeStart, request.preferredTimeEnd, existingAppointments.concat(appointments))) {
                    var appointment = {
                        id: seriesId + "_" + (appointments.length + 1),
                        date: targetDate,
                        startTime: request.preferredTimeStart,
                        endTime: request.preferredTimeEnd,
                        teamMembers: teamPair,
                        school: school,
                        teacherName: request.teacherName,
                        sessionNumber: appointments.length + 1,
                        series: seriesId
                    };
                    appointments.push(appointment);
                    // Nach dem ersten Termin, suche nur noch in 2-4 Wochen Abständen
                    if (appointments.length === 1) {
                        searchDate = addWeeks(targetDate, 2); // Nächste Suche beginnt 2 Wochen später
                        weekOffset = -1; // Reset week offset da wir searchDate geändert haben
                        break;
                    }
                }
            }
        }
        // Gib nur vollständige Serien (5 Termine) zurück
        return appointments.length === 5 ? appointments : [];
    };
    // Hilfsfunktion um Beispiel-Verfügbarkeiten zu erstellen
    SchedulingService.createSampleAvailability = function () {
        return [
            {
                day: 'monday',
                startTime: '08:00',
                endTime: '17:00',
                recurring: true
            },
            {
                day: 'tuesday',
                startTime: '08:00',
                endTime: '17:00',
                recurring: true
            },
            {
                day: 'wednesday',
                startTime: '08:00',
                endTime: '17:00',
                recurring: true
            },
            {
                day: 'thursday',
                startTime: '08:00',
                endTime: '17:00',
                recurring: true
            },
            {
                day: 'friday',
                startTime: '08:00',
                endTime: '16:00',
                recurring: true
            }
        ];
    };
    return SchedulingService;
}());
export { SchedulingService };

//# sourceMappingURL=schedulingService.js.map
