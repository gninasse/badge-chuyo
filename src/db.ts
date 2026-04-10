import Dexie, { type Table } from 'dexie';
import { Agent, BadgeTemplate } from './types';

export class BadgeDatabase extends Dexie {
  agents!: Table<Agent>;
  templates!: Table<BadgeTemplate>;

  constructor() {
    super('BadgeDatabase');
    this.version(1).stores({
      agents: '++id, &matricule, nom, service, emploi',
      templates: '++id, name, isDefault'
    });
  }
}

export const db = new BadgeDatabase();

// Initial template
export const DEFAULT_TEMPLATE: BadgeTemplate = {
  name: 'Modèle Standard',
  isDefault: true,
  backgroundImage: undefined,
  backgroundColor: '#ffffff',
  fields: {
    logoLeft: { x: 12, y: 12, size: 48, visible: true },
    logoRight: { x: 148, y: 12, size: 48, visible: true },
    headerText1: { text: 'Ministère de la santé', x: 104, y: 35, fontSize: 10, fontFamily: 'Tahoma', color: '#000000', align: 'center', isUppercase: false, isBold: true, visible: true },
    headerText2: { text: 'Centre Hospitalier', x: 104, y: 50, fontSize: 10, fontFamily: 'Tahoma', color: '#000000', align: 'center', isUppercase: false, isBold: true, visible: true },
    headerText3: { text: 'Universitaire Yalgado OUEDRAOGO', x: 104, y: 65, fontSize: 10, fontFamily: 'Tahoma', color: '#000000', align: 'center', isUppercase: false, isBold: true, visible: true },
    photo: { x: 54, y: 85, width: 100, height: 125 },
    nom: { x: 104, y: 235, fontSize: 14, fontFamily: 'Tahoma', color: '#000000', align: 'center', isUppercase: true, isBold: true, visible: true },
    emploi: { x: 104, y: 275, fontSize: 11, fontFamily: 'Tahoma', color: '#000000', align: 'center', isUppercase: false, isBold: true, visible: true },
    service: { x: 104, y: 255, fontSize: 13, fontFamily: 'Tahoma', color: '#0078d4', align: 'center', isUppercase: true, isBold: true, visible: true },
    matricule: { x: 104, y: 215, fontSize: 14, fontFamily: 'Tahoma', color: '#000000', align: 'center', isUppercase: true, isBold: true, visible: true },
    qrCode: { x: 155, y: 260, size: 40, visible: false },
    footerText: { text: 'Visa du DG/CHU-YO', x: 140, y: 295, fontSize: 9, fontFamily: 'Tahoma', color: '#000000', align: 'center', isUppercase: false, isBold: true, visible: true },
    signature: { x: 110, y: 305, width: 85, height: 35, visible: true }
  }
};

export async function initDb() {
  const count = await db.templates.count();
  if (count === 0) {
    await db.templates.add(DEFAULT_TEMPLATE);
  }
}
