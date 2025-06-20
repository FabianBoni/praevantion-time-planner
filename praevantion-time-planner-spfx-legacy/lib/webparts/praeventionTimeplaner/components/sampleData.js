// Beispieldaten für die 5 Teammitglieder
export var sampleTeamMembers = [
    {
        id: 'tm1',
        name: 'Anna Müller',
        gender: 'female',
        email: 'anna.mueller@praevantion.ch',
        availability: [
            { day: 'monday', startTime: '08:00', endTime: '17:00', recurring: true },
            { day: 'tuesday', startTime: '08:00', endTime: '17:00', recurring: true },
            { day: 'wednesday', startTime: '08:00', endTime: '17:00', recurring: true },
            { day: 'thursday', startTime: '08:00', endTime: '17:00', recurring: true },
            { day: 'friday', startTime: '08:00', endTime: '16:00', recurring: true }
        ]
    },
    {
        id: 'tm2',
        name: 'Marc Schmidt',
        gender: 'male',
        email: 'marc.schmidt@praevantion.ch',
        availability: [
            { day: 'monday', startTime: '08:30', endTime: '17:30', recurring: true },
            { day: 'tuesday', startTime: '08:30', endTime: '17:30', recurring: true },
            { day: 'wednesday', startTime: '08:30', endTime: '17:30', recurring: true },
            { day: 'thursday', startTime: '08:30', endTime: '17:30', recurring: true },
            { day: 'friday', startTime: '08:30', endTime: '16:30', recurring: true }
        ]
    },
    {
        id: 'tm3',
        name: 'Sarah Weber',
        gender: 'female',
        email: 'sarah.weber@praevantion.ch',
        availability: [
            { day: 'monday', startTime: '09:00', endTime: '18:00', recurring: true },
            { day: 'tuesday', startTime: '08:00', endTime: '17:00', recurring: true },
            { day: 'wednesday', startTime: '09:00', endTime: '18:00', recurring: true },
            { day: 'thursday', startTime: '08:00', endTime: '17:00', recurring: true },
            { day: 'friday', startTime: '08:00', endTime: '15:00', recurring: true }
        ]
    },
    {
        id: 'tm4',
        name: 'Thomas Fischer',
        gender: 'male',
        email: 'thomas.fischer@praevantion.ch',
        availability: [
            { day: 'monday', startTime: '08:00', endTime: '16:30', recurring: true },
            { day: 'tuesday', startTime: '08:00', endTime: '16:30', recurring: true },
            { day: 'wednesday', startTime: '08:00', endTime: '16:30', recurring: true },
            { day: 'thursday', startTime: '08:00', endTime: '16:30', recurring: true },
            { day: 'friday', startTime: '08:00', endTime: '15:30', recurring: true }
        ]
    },
    {
        id: 'tm5',
        name: 'Julia Zimmermann',
        gender: 'female',
        email: 'julia.zimmermann@praevantion.ch',
        availability: [
            { day: 'monday', startTime: '08:15', endTime: '17:15', recurring: true },
            { day: 'tuesday', startTime: '08:15', endTime: '17:15', recurring: true },
            { day: 'wednesday', startTime: '08:15', endTime: '17:15', recurring: true },
            { day: 'thursday', startTime: '08:15', endTime: '17:15', recurring: true },
            { day: 'friday', startTime: '08:15', endTime: '16:15', recurring: true }
        ]
    }
];
// Beispieldaten für Basel-Stadt Schulen (Auswahl von 56 Schulen)
export var baselSchools = [
    // Primarstufe
    { id: 'ps1', name: 'Primarschule Allschwil', address: 'Baselmattweg 10, 4123 Allschwil', contact: 'sekretariat@ps-allschwil.ch' },
    { id: 'ps2', name: 'Primarschule Bettingen', address: 'Chrischonaweg 24, 4126 Bettingen', contact: 'schulleitung@ps-bettingen.ch' },
    { id: 'ps3', name: 'Primarschule Binningen', address: 'Kirchgasse 20, 4102 Binningen', contact: 'info@ps-binningen.ch' },
    { id: 'ps4', name: 'Primarschule Bottmingen', address: 'Talweg 24, 4103 Bottmingen', contact: 'sekretariat@ps-bottmingen.ch' },
    { id: 'ps5', name: 'Primarschule Münchenstein', address: 'Hauptstrasse 28, 4142 Münchenstein', contact: 'info@ps-muenchenstein.ch' },
    // Sekundarstufe I
    { id: 'ss1', name: 'Sekundarschule Basel-Stadt Ost', address: 'Kirschgartenstrasse 25, 4051 Basel', contact: 'sekretariat@sek-ost.ch' },
    { id: 'ss2', name: 'Sekundarschule Basel-Stadt West', address: 'Hammerstrasse 12, 4058 Basel', contact: 'info@sek-west.ch' },
    { id: 'ss3', name: 'Sekundarschule Basel-Stadt Nord', address: 'Riehentorstrasse 15, 4054 Basel', contact: 'verwaltung@sek-nord.ch' },
    { id: 'ss4', name: 'Sekundarschule Basel-Stadt Süd', address: 'Gundeldingerstrasse 30, 4053 Basel', contact: 'leitung@sek-sued.ch' },
    { id: 'ss5', name: 'Sekundarschule Basel-Stadt Zentrum', address: 'Steinenberg 8, 4051 Basel', contact: 'sekretariat@sek-zentrum.ch' },
    // Gymnasien
    { id: 'gym1', name: 'Gymnasium Leonhard', address: 'Kohlenberggasse 17, 4051 Basel', contact: 'rektorat@gymleonhard.ch' },
    { id: 'gym2', name: 'Gymnasium Bäumlihof', address: 'Zu den drei Linden 80, 4058 Basel', contact: 'sekretariat@gymbaeumli.ch' },
    { id: 'gym3', name: 'Gymnasium Kirschgarten', address: 'Hermann Kinkelin-Strasse 10, 4051 Basel', contact: 'verwaltung@gymkirsch.ch' },
    { id: 'gym4', name: 'Gymnasium Münsterplatz', address: 'Münsterplatz 15, 4051 Basel', contact: 'rektorat@gymmuenster.ch' },
    { id: 'gym5', name: 'Wirtschaftsgymnasium Basel', address: 'Engelgasse 120, 4052 Basel', contact: 'info@wgbasel.ch' },
    // Berufsfachschulen
    { id: 'bfs1', name: 'Berufsfachschule Basel', address: 'Kohlenberggasse 10, 4051 Basel', contact: 'info@bfsbasel.ch' },
    { id: 'bfs2', name: 'Gewerblich-industrielle Berufsfachschule', address: 'Vogelsangstrasse 15, 4058 Basel', contact: 'sekretariat@gibb.ch' },
    { id: 'bfs3', name: 'Berufsfachschule Gesundheit', address: 'Binningerstrasse 2, 4051 Basel', contact: 'verwaltung@bfsg.ch' },
    { id: 'bfs4', name: 'Kaufmännische Berufsfachschule', address: 'Aeschengraben 15, 4051 Basel', contact: 'info@kbsbasel.ch' },
    { id: 'bfs5', name: 'Berufsfachschule für Gestaltung', address: 'Vogelsangstrasse 40, 4058 Basel', contact: 'kontakt@sfgbasel.ch' },
    // Weitere Primarschulen
    { id: 'ps6', name: 'Primarschule Aesch', address: 'Schulstrasse 20, 4147 Aesch BL', contact: 'schulleitung@ps-aesch.ch' },
    { id: 'ps7', name: 'Primarschule Arlesheim', address: 'Känerkindenstieg 15, 4144 Arlesheim', contact: 'sekretariat@ps-arlesheim.ch' },
    { id: 'ps8', name: 'Primarschule Dornach', address: 'Schulhausplatz 1, 4143 Dornach', contact: 'info@ps-dornach.ch' },
    { id: 'ps9', name: 'Primarschule Ettingen', address: 'Schöntalweg 5, 4107 Ettingen', contact: 'verwaltung@ps-ettingen.ch' },
    { id: 'ps10', name: 'Primarschule Flüh', address: 'Dorfstrasse 42, 4112 Flüh', contact: 'leitung@ps-flueh.ch' },
    // Weitere Sekundarschulen
    { id: 'ss6', name: 'Sekundarschule Laufen', address: 'Pfarrgasse 14, 4242 Laufen', contact: 'sekretariat@sek-laufen.ch' },
    { id: 'ss7', name: 'Sekundarschule Liestal', address: 'Friedensstrasse 20, 4410 Liestal', contact: 'info@sek-liestal.ch' },
    { id: 'ss8', name: 'Sekundarschule Muttenz', address: 'Baselstrasse 25, 4132 Muttenz', contact: 'verwaltung@sek-muttenz.ch' },
    { id: 'ss9', name: 'Sekundarschule Oberwil', address: 'Schulweg 10, 4104 Oberwil BL', contact: 'leitung@sek-oberwil.ch' },
    { id: 'ss10', name: 'Sekundarschule Pratteln', address: 'Hohenrainstrasse 3, 4133 Pratteln', contact: 'sekretariat@sek-pratteln.ch' },
    // Weitere Schulen
    { id: 'fs1', name: 'Freie Schule Basel', address: 'Engelgasse 122, 4052 Basel', contact: 'kontakt@freie-schule-basel.ch' },
    { id: 'fs2', name: 'Rudolf Steiner Schule Basel', address: 'Jakobsbergerholzweg 54, 4059 Basel', contact: 'info@steinerschule-basel.ch' },
    { id: 'fs3', name: 'International School Basel', address: 'Fleischbachstrasse 2, 4153 Reinach BL', contact: 'office@isbasel.ch' },
    { id: 'fs4', name: 'École Française de Bâle', address: 'Erlensträsschen 15, 4058 Basel', contact: 'secretariat@efb.ch' },
    { id: 'fs5', name: 'Academia International School', address: 'Dornacherstrasse 192, 4053 Basel', contact: 'info@academia-international.ch' },
    // Berufsschulen und Weiterbildung
    { id: 'wb1', name: 'Volkshochschule Basel', address: 'Clarastrasse 12, 4058 Basel', contact: 'info@vhsbasel.ch' },
    { id: 'wb2', name: 'Bildungszentrum Wirtschaft', address: 'Peter Merian-Strasse 86, 4052 Basel', contact: 'kontakt@bzwbasel.ch' },
    { id: 'wb3', name: 'Zentrum für Brückenangebote', address: 'Kohlenberggasse 10, 4051 Basel', contact: 'info@zbabasel.ch' },
    { id: 'wb4', name: 'Fachhochschule Nordwestschweiz', address: 'Riggenbachstrasse 16, 4600 Olten', contact: 'info@fhnw.ch' },
    { id: 'wb5', name: 'Pädagogische Hochschule FHNW', address: 'Benzburweg 30, 4410 Liestal', contact: 'ph.sekretariat@fhnw.ch' },
    // Weitere Primarschulen
    { id: 'ps11', name: 'Primarschule Gelterkinden', address: 'Schulstrasse 8, 4460 Gelterkinden', contact: 'schulleitung@ps-gelterkinden.ch' },
    { id: 'ps12', name: 'Primarschule Hölstein', address: 'Dorfplatz 2, 4434 Hölstein', contact: 'sekretariat@ps-hoelstein.ch' },
    { id: 'ps13', name: 'Primarschule Itingen', address: 'Schulweg 15, 4452 Itingen', contact: 'info@ps-itingen.ch' },
    { id: 'ps14', name: 'Primarschule Kilchberg', address: 'Dorfstrasse 28, 4496 Kilchberg BL', contact: 'verwaltung@ps-kilchberg.ch' },
    { id: 'ps15', name: 'Primarschule Lausen', address: 'Schulhausplatz 3, 4415 Lausen', contact: 'leitung@ps-lausen.ch' },
    // Zusätzliche Bildungseinrichtungen
    { id: 'spe1', name: 'Spezialschule für Hörgeschädigte', address: 'Holee 1, 4054 Basel', contact: 'info@hoerbehinderte.ch' },
    { id: 'spe2', name: 'Spezialschule für Sehbehinderte', address: 'Zschokkestrasse 20, 4052 Basel', contact: 'kontakt@sehbehinderte.ch' },
    { id: 'spe3', name: 'Heilpädagogische Schule Basel', address: 'Bruderholzstrasse 42, 4053 Basel', contact: 'sekretariat@hps-basel.ch' },
    { id: 'spe4', name: 'Tagesschule Riehen', address: 'Baselstrasse 200, 4125 Riehen', contact: 'info@tagesschule-riehen.ch' },
    { id: 'spe5', name: 'Montessori Schule Basel', address: 'Engelgasse 124, 4052 Basel', contact: 'office@montessori-basel.ch' },
    // Weitere Schulen zur Vervollständigung der 56
    { id: 'misc1', name: 'Musikschule Basel-Stadt', address: 'Leonhardsgraben 6, 4051 Basel', contact: 'info@musikschule-basel.ch' },
    { id: 'misc2', name: 'Kunstschule Basel', address: 'Steinenberg 7, 4051 Basel', contact: 'kontakt@kunstschule-basel.ch' },
    { id: 'misc3', name: 'Sprachschule Basel', address: 'Centralbahnplatz 8, 4051 Basel', contact: 'info@sprachschule-basel.ch' },
    { id: 'misc4', name: 'Abendschule Basel', address: 'Kohlenberggasse 8, 4051 Basel', contact: 'sekretariat@abendschule-basel.ch' },
    { id: 'misc5', name: 'Fachmittelschule Basel', address: 'Kohlenberggasse 10, 4051 Basel', contact: 'verwaltung@fms-basel.ch' },
    { id: 'misc6', name: 'Informatikmittelschule Basel', address: 'Kohlenberggasse 10, 4051 Basel', contact: 'info@ims-basel.ch' }
];
// Hilfsfunktion für zufällige Auswahl
export var getRandomSchools = function (count) {
    var shuffled = baselSchools.slice().sort(function () { return 0.5 - Math.random(); });
    return shuffled.slice(0, count);
};
export var getSchoolById = function (id) {
    return baselSchools.find(function (school) { return school.id === id; });
};
export var getTeamMemberById = function (id) {
    return sampleTeamMembers.find(function (member) { return member.id === id; });
};

//# sourceMappingURL=sampleData.js.map
