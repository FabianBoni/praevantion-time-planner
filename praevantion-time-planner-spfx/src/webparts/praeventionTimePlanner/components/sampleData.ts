import { TeamMember, School } from './types';

// Beispieldaten für die 5 Teammitglieder
export const sampleTeamMembers: TeamMember[] = [
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

// Basel-Stadt Schulen (Auswahl)
export const baselSchools: School[] = [
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
  
  // Weitere Schulen (gekürzt für SPFx)
  { id: 'bfs1', name: 'Berufsfachschule Basel', address: 'Kohlenberggasse 10, 4051 Basel', contact: 'info@bfsbasel.ch' },
  { id: 'fs1', name: 'Freie Schule Basel', address: 'Engelgasse 122, 4052 Basel', contact: 'kontakt@freie-schule-basel.ch' },
  { id: 'fs2', name: 'Rudolf Steiner Schule Basel', address: 'Jakobsbergerholzweg 54, 4059 Basel', contact: 'info@steinerschule-basel.ch' },
  { id: 'wb1', name: 'Volkshochschule Basel', address: 'Clarastrasse 12, 4058 Basel', contact: 'info@vhsbasel.ch' },
  { id: 'misc1', name: 'Musikschule Basel-Stadt', address: 'Leonhardsgraben 6, 4051 Basel', contact: 'info@musikschule-basel.ch' }
];

// Hilfsfunktionen
export const getRandomSchools = (count: number): School[] => {
  const shuffled = [...baselSchools].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const getSchoolById = (id: string): School | undefined => {
  return baselSchools.find(school => school.id === id);
};

export const getTeamMemberById = (id: string): TeamMember | undefined => {
  return sampleTeamMembers.find(member => member.id === id);
};
