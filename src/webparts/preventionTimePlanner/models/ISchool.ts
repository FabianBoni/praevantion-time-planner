export interface ISchool {
  id: string;
  name: string;
  address: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone?: string;
  isActive: boolean;
  notes?: string;
}

export const BaselStadtSchools: ISchool[] = [
  // Primarstufe
  { id: '1', name: 'Primarschule Gellert', address: 'Gellertstrasse 145, 4052 Basel', contactPerson: 'Hans Müller', contactEmail: 'hans.mueller@edubs.ch', isActive: true },
  { id: '2', name: 'Primarschule Isaak Iselin', address: 'Iselin-Weber-Gasse 7, 4057 Basel', contactPerson: 'Anna Schmidt', contactEmail: 'anna.schmidt@edubs.ch', isActive: true },
  { id: '3', name: 'Primarschule Kleinhüningen', address: 'Kleinhüninger Anlage 45, 4057 Basel', contactPerson: 'Peter Weber', contactEmail: 'peter.weber@edubs.ch', isActive: true },
  { id: '4', name: 'Primarschule Theodor', address: 'Theodorskirchplatz 7, 4058 Basel', contactPerson: 'Lisa Meier', contactEmail: 'lisa.meier@edubs.ch', isActive: true },
  { id: '5', name: 'Primarschule Bruderholz', address: 'Bruderholzstrasse 20, 4059 Basel', contactPerson: 'Thomas Keller', contactEmail: 'thomas.keller@edubs.ch', isActive: true },
  
  // Sekundarstufe I
  { id: '6', name: 'Sekundarschule Bäumlihof', address: 'Neubadstrasse 96, 4054 Basel', contactPerson: 'Maria Garcia', contactEmail: 'maria.garcia@edubs.ch', isActive: true },
  { id: '7', name: 'Sekundarschule Drei Linden', address: 'Lindenstrasse 15, 4058 Basel', contactPerson: 'Stefan Brenner', contactEmail: 'stefan.brenner@edubs.ch', isActive: true },
  { id: '8', name: 'Sekundarschule Holbein', address: 'Clarastrasse 33, 4058 Basel', contactPerson: 'Julia Roth', contactEmail: 'julia.roth@edubs.ch', isActive: true },
  { id: '9', name: 'Sekundarschule Vogesen', address: 'Vogesenstrasse 20, 4056 Basel', contactPerson: 'Martin Fischer', contactEmail: 'martin.fischer@edubs.ch', isActive: true },
  { id: '10', name: 'Sekundarschule Sandgruben', address: 'Sandgrubenstrasse 50, 4058 Basel', contactPerson: 'Sandra Huber', contactEmail: 'sandra.huber@edubs.ch', isActive: true },
  
  // Weitere Schulen
  { id: '11', name: 'Primarschule Am Rhein', address: 'Rheinweg 25, 4057 Basel', contactPerson: 'Robert Zimmermann', contactEmail: 'robert.zimmermann@edubs.ch', isActive: true },
  { id: '12', name: 'Primarschule Gotthelf', address: 'Gotthelfstrasse 33, 4054 Basel', contactPerson: 'Christine Bauer', contactEmail: 'christine.bauer@edubs.ch', isActive: true },
  { id: '13', name: 'Primarschule Hirzbrunnen', address: 'Hirzbrunnenschanze 50, 4058 Basel', contactPerson: 'Daniel Wagner', contactEmail: 'daniel.wagner@edubs.ch', isActive: true },
  { id: '14', name: 'Primarschule Margarethen', address: 'Margarethenstrasse 15, 4053 Basel', contactPerson: 'Nicole Gerber', contactEmail: 'nicole.gerber@edubs.ch', isActive: true },
  { id: '15', name: 'Primarschule Riehen-Dorf', address: 'Wettsteinstrasse 1, 4125 Riehen', contactPerson: 'Andreas Lehmann', contactEmail: 'andreas.lehmann@edubs.ch', isActive: true },
  
  // Weitere 10 Schulen
  { id: '16', name: 'Primarschule Wasgenring', address: 'Wasgenring 30, 4055 Basel', contactPerson: 'Sabine Moser', contactEmail: 'sabine.moser@edubs.ch', isActive: true },
  { id: '17', name: 'Primarschule Volta', address: 'Voltastrasse 30, 4056 Basel', contactPerson: 'Marco Steiner', contactEmail: 'marco.steiner@edubs.ch', isActive: true },
  { id: '18', name: 'Primarschule Neubad', address: 'Neubadstrasse 200, 4054 Basel', contactPerson: 'Elena Rodriguez', contactEmail: 'elena.rodriguez@edubs.ch', isActive: true },
  { id: '19', name: 'Primarschule Erlensträsschen', address: 'Erlensträsschen 10, 4058 Basel', contactPerson: 'Patrick Jung', contactEmail: 'patrick.jung@edubs.ch', isActive: true },
  { id: '20', name: 'Primarschule Clara', address: 'Clarastrasse 50, 4058 Basel', contactPerson: 'Miriam Kraft', contactEmail: 'miriam.kraft@edubs.ch', isActive: true },
  { id: '21', name: 'Sekundarschule Theobald Baerwart', address: 'Laufenstrasse 107, 4053 Basel', contactPerson: 'Oliver Kunz', contactEmail: 'oliver.kunz@edubs.ch', isActive: true },
  { id: '22', name: 'Sekundarschule Kornfeld', address: 'Kornfeldstrasse 25, 4055 Basel', contactPerson: 'Petra Lang', contactEmail: 'petra.lang@edubs.ch', isActive: true },
  { id: '23', name: 'Sekundarschule De Wette', address: 'De Wette-Strasse 7, 4051 Basel', contactPerson: 'Benjamin Graf', contactEmail: 'benjamin.graf@edubs.ch', isActive: true },
  { id: '24', name: 'Primarschule Lysbüchel', address: 'Lysbüchel 55, 4052 Basel', contactPerson: 'Claudia Nussbaum', contactEmail: 'claudia.nussbaum@edubs.ch', isActive: true },
  { id: '25', name: 'Primarschule Sevogel', address: 'Sevogelstrasse 32, 4052 Basel', contactPerson: 'David Hofer', contactEmail: 'david.hofer@edubs.ch', isActive: true },

  // Ergänzung weitere Schulen bis 30 (repräsentativ für die 56 Schulen)
  { id: '26', name: 'Gymnasium Leonhard', address: 'Kohlenberggasse 10, 4051 Basel', contactPerson: 'Franziska Wirth', contactEmail: 'franziska.wirth@edubs.ch', isActive: true },
  { id: '27', name: 'Gymnasium Bäumlihof', address: 'Zu den drei Linden 80, 4058 Basel', contactPerson: 'Markus Frei', contactEmail: 'markus.frei@edubs.ch', isActive: true },
  { id: '28', name: 'Fachmaturitätsschule', address: 'Austrasse 67, 4051 Basel', contactPerson: 'Stephanie Fuchs', contactEmail: 'stephanie.fuchs@edubs.ch', isActive: true },
  { id: '29', name: 'Wirtschaftsmittelschule', address: 'Petersgraben 15, 4051 Basel', contactPerson: 'Roland Schneider', contactEmail: 'roland.schneider@edubs.ch', isActive: true },
  { id: '30', name: 'Informatikmittelschule', address: 'Kornhausgasse 5, 4051 Basel', contactPerson: 'Katharina Blum', contactEmail: 'katharina.blum@edubs.ch', isActive: true },
];
