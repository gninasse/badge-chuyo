export interface Agent {
  id?: number;
  matricule: string;
  nom: string;
  service: string;
  emploi: string;
  photo: string; // base64
  dateCreation: number;
  dateModification: number;
}

export interface BadgeFieldConfig {
  x: number;
  y: number;
  fontSize: number;
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
}
