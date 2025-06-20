// Utility-Funktionen
export var DAYS_DE = {
    monday: 'Montag',
    tuesday: 'Dienstag',
    wednesday: 'Mittwoch',
    thursday: 'Donnerstag',
    friday: 'Freitag',
    saturday: 'Samstag',
    sunday: 'Sonntag'
};
export var formatTime = function (time) {
    return time;
};
export var formatDate = function (date) {
    return date.toLocaleDateString('de-CH', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

//# sourceMappingURL=types.js.map
