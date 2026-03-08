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
    logoLeft: { x: 10, y: 10, size: 40, visible: true },
    logoRight: { x: 158, y: 10, size: 40, visible: true },
    headerText1: { text: 'RÉPUBLIQUE DU SÉNÉGAL', x: 104, y: 15, fontSize: 8, color: '#000000', align: 'center', isUppercase: true, isBold: true, visible: true },
    headerText2: { text: 'MINISTÈRE DE LA SANTÉ', x: 104, y: 30, fontSize: 8, color: '#000000', align: 'center', isUppercase: true, isBold: false, visible: true },
    headerText3: { text: 'DIRECTION GÉNÉRALE', x: 104, y: 45, fontSize: 8, color: '#000000', align: 'center', isUppercase: true, isBold: false, visible: true },
    photo: { x: 49, y: 65, width: 110, height: 110 },
    nom: { x: 104, y: 180, fontSize: 16, color: '#000000', align: 'center', isUppercase: true, isBold: true, visible: true },
    emploi: { x: 104, y: 205, fontSize: 14, color: '#444444', align: 'center', isUppercase: false, isBold: false, visible: true },
    service: { x: 104, y: 225, fontSize: 12, color: '#666666', align: 'center', isUppercase: false, isBold: false, visible: true },
    matricule: { x: 104, y: 245, fontSize: 12, color: '#000000', align: 'center', isUppercase: true, isBold: true, visible: true },
    qrCode: { x: 10, y: 270, size: 40, visible: true },
    footerText: { text: 'Visa du DG/CHU-YO', x: 104, y: 300, fontSize: 10, color: '#000000', align: 'center', isUppercase: false, isBold: true, visible: true },
    signature: { x: 148, y: 270, width: 50, height: 30, visible: true }
  }
};

export async function initDb() {
  const count = await db.templates.count();
  if (count === 0) {
    await db.templates.add(DEFAULT_TEMPLATE);
  }
}
