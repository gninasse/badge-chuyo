export interface Agent {
  id?: number;
  matricule: string;
  nom: string;
  service: string;
  emploi: string;
  photo: string; // base64
  cardId?: string; // unique card id for the back
  dateCreation: number;
  dateModification: number;
}

export interface BadgeFieldConfig {
  x: number;
  y: number;
  fontSize: number;
  fontFamily?: string;
  color: string;
  align: 'left' | 'center' | 'right';
  isUppercase: boolean;
  isBold: boolean;
  visible: boolean;
}

export interface BadgeTemplate {
  id?: number;
  name: string;
  backgroundImage?: string; // base64
  backgroundColor?: string;
  fields: {
    matricule: BadgeFieldConfig;
    nom: BadgeFieldConfig;
    service: BadgeFieldConfig;
    emploi: BadgeFieldConfig;
    headerText1: BadgeFieldConfig & { text: string };
    headerText2: BadgeFieldConfig & { text: string };
    headerText3: BadgeFieldConfig & { text: string };
    logoLeft: {
      x: number;
      y: number;
      size: number;
      image?: string;
      visible: boolean;
    };
    logoRight: {
      x: number;
      y: number;
      size: number;
      image?: string;
      visible: boolean;
    };
    footerText: BadgeFieldConfig & { text: string };
    signature: {
      x: number;
      y: number;
      width: number;
      height: number;
      image?: string;
      visible: boolean;
    };
    photo: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    qrCode: {
      x: number;
      y: number;
      size: number;
      visible: boolean;
    };
  };
  isDefault: boolean;
  backTexts?: {
    line1: string;
    line2: string;
    line3: string;
    line4: string;
    line5: string;
    line6: string;
    line7: string;
    line8: string;
    line9: string;
    line10: string;
    line11: string;
    line12: string;
  };
  cardIdPattern?: string; // e.g. "00076[RANDOM_5]" or "[MATRICULE]"
}
