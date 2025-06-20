var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import * as React from 'react';
import styles from './PraeventionTimeplaner.module.scss';
import { formatDate } from './types';
import { SchedulingService } from './schedulingService';
import { sampleTeamMembers, baselSchools } from './sampleData';
var PraeventionTimeplaner = (function (_super) {
    __extends(PraeventionTimeplaner, _super);
    function PraeventionTimeplaner(props) {
        var _this = _super.call(this, props) || this;
        _this.handleDayToggle = function (day) {
            _this.setState(function (prevState) { return ({
                appointmentRequest: __assign({}, prevState.appointmentRequest, { preferredDays: prevState.appointmentRequest.preferredDays.includes(day)
                        ? prevState.appointmentRequest.preferredDays.filter(function (d) { return d !== day; })
                        : prevState.appointmentRequest.preferredDays.concat([day]) })
            }); });
        };
        _this.handleSearch = function () { return __awaiter(_this, void 0, void 0, function () {
            var _a, appointmentRequest, schools, teamMembers, existingAppointments, selectedSchool, results;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.state, appointmentRequest = _a.appointmentRequest, schools = _a.schools, teamMembers = _a.teamMembers, existingAppointments = _a.existingAppointments;
                        if (!appointmentRequest.schoolId || !appointmentRequest.teacherName || appointmentRequest.preferredDays.length === 0) {
                            alert('Bitte füllen Sie alle Pflichtfelder aus.');
                            return [2 /*return*/];
                        }
                        this.setState({ isSearching: true });
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                    case 1:
                        _b.sent();
                        selectedSchool = schools.find(function (s) { return s.id === appointmentRequest.schoolId; });
                        if (!selectedSchool) {
                            alert('Schule nicht gefunden.');
                            this.setState({ isSearching: false });
                            return [2 /*return*/];
                        }
                        results = SchedulingService.findAvailableAppointmentSeries(teamMembers, appointmentRequest, selectedSchool, existingAppointments);
                        this.setState({ searchResults: results, isSearching: false });
                        return [2 /*return*/];
                }
            });
        }); };
        _this.getDayDisplayName = function (day) {
            var dayNames = {
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
        _this.getTeamPairStats = function () {
            var teamMembers = _this.state.teamMembers;
            var pairs = SchedulingService.generateTeamPairs(teamMembers);
            return {
                totalPairs: pairs.length,
                maleMembers: teamMembers.filter(function (m) { return m.gender === 'male'; }).length,
                femaleMembers: teamMembers.filter(function (m) { return m.gender === 'female'; }).length
            };
        };
        _this.state = {
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
        return _this;
    }
    PraeventionTimeplaner.prototype.render = function () {
        var _this = this;
        var _a = this.state, appointmentRequest = _a.appointmentRequest, searchResults = _a.searchResults, isSearching = _a.isSearching, teamMembers = _a.teamMembers, schools = _a.schools;
        var stats = this.getTeamPairStats();
        return (React.createElement("div", { className: styles.praeventionTimeplaner },
            React.createElement("div", { className: styles.container },
                React.createElement("div", { className: styles.header },
                    React.createElement("h1", null, "Pr\u00E4vention Terminplaner"),
                    React.createElement("p", null, "Intelligente Terminplanung f\u00FCr Schulbesuche in Basel-Stadt")),
                React.createElement("div", { className: styles.section },
                    React.createElement("h2", null, "Team-\u00DCbersicht"),
                    React.createElement("div", { className: styles.alert + " " + styles.info },
                        React.createElement("strong", null, "Team-Statistik:"),
                        " ",
                        stats.totalPairs,
                        " m\u00F6gliche gemischtgeschlechtliche Teampaare (",
                        stats.maleMembers,
                        " M\u00E4nner, ",
                        stats.femaleMembers,
                        " Frauen)"),
                    React.createElement("div", { className: styles['team-grid'] }, teamMembers.map(function (member) { return (React.createElement("div", { key: member.id, className: styles['team-member'] },
                        React.createElement("h3", null, member.name),
                        React.createElement("span", { className: styles.gender + " " + styles[member.gender] }, member.gender === 'male' ? 'Mann' : 'Frau'),
                        React.createElement("p", null,
                            React.createElement("strong", null, "Email:"),
                            " ",
                            member.email),
                        React.createElement("p", null,
                            React.createElement("strong", null, "Verf\u00FCgbarkeit:"),
                            " Mo-Fr (vereinfacht dargestellt)"))); }))),
                React.createElement("div", { className: styles.section },
                    React.createElement("h2", null, "Neue Terminanfrage"),
                    React.createElement("div", { className: styles['two-column'] },
                        React.createElement("div", null,
                            React.createElement("div", { className: styles['form-group'] },
                                React.createElement("label", null, "Schule *"),
                                React.createElement("select", { value: appointmentRequest.schoolId, onChange: function (e) { return _this.setState({ appointmentRequest: __assign({}, appointmentRequest, { schoolId: e.target.value }) }); } },
                                    React.createElement("option", { value: "" }, "Bitte w\u00E4hlen..."),
                                    schools.map(function (school) { return (React.createElement("option", { key: school.id, value: school.id }, school.name)); }))),
                            React.createElement("div", { className: styles['form-group'] },
                                React.createElement("label", null, "Name der Lehrperson *"),
                                React.createElement("input", { type: "text", value: appointmentRequest.teacherName, onChange: function (e) { return _this.setState({ appointmentRequest: __assign({}, appointmentRequest, { teacherName: e.target.value }) }); }, placeholder: "z.B. Frau Meier" })),
                            React.createElement("div", { className: styles['form-group'] },
                                React.createElement("label", null, "Email der Lehrperson"),
                                React.createElement("input", { type: "email", value: appointmentRequest.teacherEmail, onChange: function (e) { return _this.setState({ appointmentRequest: __assign({}, appointmentRequest, { teacherEmail: e.target.value }) }); }, placeholder: "lehrperson@schule.ch" }))),
                        React.createElement("div", null,
                            React.createElement("div", { className: styles['form-group'] },
                                React.createElement("label", null, "Bevorzugte Wochentage *"),
                                React.createElement("div", { className: styles['time-slot-grid'] }, ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map(function (day) { return (React.createElement("div", { key: day, className: styles['time-slot'] + " " + (appointmentRequest.preferredDays.includes(day) ? styles.selected : ''), onClick: function () { return _this.handleDayToggle(day); } }, _this.getDayDisplayName(day))); }))),
                            React.createElement("div", { className: styles['form-group'] },
                                React.createElement("label", null, "Startzeit"),
                                React.createElement("input", { type: "time", value: appointmentRequest.preferredTimeStart, onChange: function (e) { return _this.setState({ appointmentRequest: __assign({}, appointmentRequest, { preferredTimeStart: e.target.value }) }); } })),
                            React.createElement("div", { className: styles['form-group'] },
                                React.createElement("label", null, "Endzeit"),
                                React.createElement("input", { type: "time", value: appointmentRequest.preferredTimeEnd, onChange: function (e) { return _this.setState({ appointmentRequest: __assign({}, appointmentRequest, { preferredTimeEnd: e.target.value }) }); } })))),
                    React.createElement("div", { className: styles['form-group'] },
                        React.createElement("label", null, "Bemerkungen"),
                        React.createElement("textarea", { rows: 3, value: appointmentRequest.notes, onChange: function (e) { return _this.setState({ appointmentRequest: __assign({}, appointmentRequest, { notes: e.target.value }) }); }, placeholder: "Weitere Informationen oder Wünsche..." })),
                    React.createElement("button", { className: styles.btn, onClick: this.handleSearch, disabled: isSearching }, isSearching ? 'Suche läuft...' : 'Termine suchen')),
                isSearching && (React.createElement("div", { className: styles.section },
                    React.createElement("div", { className: styles.loading }, "Suche nach verf\u00FCgbaren Terminen..."))),
                !isSearching && searchResults.length > 0 && (React.createElement("div", { className: styles.section },
                    React.createElement("h2", null, "Verf\u00FCgbare Terminserien"),
                    React.createElement("div", { className: styles.alert + " " + styles.success },
                        searchResults.length,
                        " vollst\u00E4ndige Terminserien gefunden! Jede Serie umfasst 5 Termine im Abstand von 2-4 Wochen."),
                    searchResults.map(function (series, seriesIndex) { return (React.createElement("div", { key: seriesIndex, className: styles['appointment-slot'] },
                        React.createElement("h3", null,
                            "Option ",
                            seriesIndex + 1,
                            ": ",
                            series[0].teamMembers[0].name,
                            " & ",
                            series[0].teamMembers[1].name),
                        React.createElement("div", { className: styles['appointment-details'] }, series.map(function (appointment) { return (React.createElement("div", { key: appointment.id },
                            React.createElement("strong", null,
                                "Termin ",
                                appointment.sessionNumber),
                            React.createElement("div", null, formatDate(appointment.date)),
                            React.createElement("div", null,
                                appointment.startTime,
                                " - ",
                                appointment.endTime),
                            React.createElement("div", { className: "text-sm text-gray-600" },
                                appointment.teamMembers[0].name,
                                " & ",
                                appointment.teamMembers[1].name))); })),
                        React.createElement("div", { style: { marginTop: '1rem' } },
                            React.createElement("button", { className: styles.btn }, "Diese Terminserie buchen")))); }))),
                !isSearching && searchResults.length === 0 && appointmentRequest.schoolId && (React.createElement("div", { className: styles.section },
                    React.createElement("div", { className: styles.alert + " " + styles.warning }, "Keine vollst\u00E4ndigen Terminserien gefunden. Versuchen Sie andere Wochentage oder Zeiten, oder kontaktieren Sie das Team f\u00FCr alternative L\u00F6sungen."))),
                React.createElement("div", { className: styles.section },
                    React.createElement("h2", null, "Systeminformationen"),
                    React.createElement("div", { className: styles.alert + " " + styles.info },
                        React.createElement("strong", null, "\u00DCber das System:"),
                        React.createElement("br", null),
                        "\u2022 ",
                        schools.length,
                        " Schulen in Basel-Stadt erfasst",
                        React.createElement("br", null),
                        "\u2022 ",
                        teamMembers.length,
                        " Teammitglieder verf\u00FCgbar",
                        React.createElement("br", null),
                        "\u2022 ",
                        stats.totalPairs,
                        " m\u00F6gliche Teamzusammenstellungen",
                        React.createElement("br", null),
                        "\u2022 Automatische Suche nach 5er-Terminserien mit 2-4 Wochen Abstand",
                        React.createElement("br", null),
                        "\u2022 Integration von Outlook-Kalendern geplant",
                        React.createElement("br", null),
                        "\u2022 Unterst\u00FCtzung f\u00FCr ca. 400 Termine j\u00E4hrlich")))));
    };
    return PraeventionTimeplaner;
}(React.Component));
export default PraeventionTimeplaner;

//# sourceMappingURL=PraeventionTimeplaner.js.map
