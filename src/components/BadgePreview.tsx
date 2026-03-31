import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { BadgeTemplate, Agent } from '../types';

interface BadgePreviewProps {
  template: BadgeTemplate;
  agent: Partial<Agent>;
  scale?: number;
  id?: string;
}

const BadgePreview: React.FC<BadgePreviewProps> = ({ template, agent, scale = 1, id }) => {
  if (!template) return null;
  const { fields, backgroundImage, backgroundColor } = template;

  const getStyle = (config: any) => ({
    position: 'absolute' as const,
    left: `${config.x}px`,
    top: `${config.y}px`,
    fontSize: `${config.fontSize}px`,
    fontFamily: config.fontFamily || 'inherit',
    color: config.color,
    textAlign: config.align as any,
    fontWeight: config.isBold ? 'bold' : 'normal',
    textTransform: config.isUppercase ? 'uppercase' : 'none' as any,
    width: config.align === 'center' ? '208px' : 'auto',
    marginLeft: config.align === 'center' ? '-104px' : '0',
    display: config?.visible !== false ? 'block' : 'none',
    pointerEvents: 'none' as const,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  });

  return (
    <div 
      id={id}
      className="relative bg-white shadow-lg overflow-hidden border border-gray-200"
      style={{ 
        width: '208px', 
        height: '321px',
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        backgroundColor: backgroundColor || '#ffffff',
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Logos */}
      {fields?.logoLeft?.visible && fields.logoLeft.image && (
        <div 
          style={{
            position: 'absolute',
            left: `${fields.logoLeft.x}px`,
            top: `${fields.logoLeft.y}px`,
            width: `${fields.logoLeft.size}px`,
            height: `${fields.logoLeft.size}px`,
          }}
        >
          <img src={fields.logoLeft.image} alt="Logo Left" className="w-full h-full object-contain" />
        </div>
      )}
      {fields?.logoRight?.visible && fields.logoRight.image && (
        <div 
          style={{
            position: 'absolute',
            left: `${fields.logoRight.x}px`,
            top: `${fields.logoRight.y}px`,
            width: `${fields.logoRight.size}px`,
            height: `${fields.logoRight.size}px`,
          }}
        >
          <img src={fields.logoRight.image} alt="Logo Right" className="w-full h-full object-contain" />
        </div>
      )}

      {/* Header Texts */}
      {fields?.headerText1 && <div style={getStyle(fields.headerText1)}>{fields.headerText1.text}</div>}
      {fields?.headerText2 && <div style={getStyle(fields.headerText2)}>{fields.headerText2.text}</div>}
      {fields?.headerText3 && <div style={getStyle(fields.headerText3)}>{fields.headerText3.text}</div>}

      {/* Footer Text */}
      {fields?.footerText && <div style={getStyle(fields.footerText)}>{fields.footerText.text}</div>}

      {/* Signature */}
      {fields?.signature?.visible && fields.signature.image && (
        <div 
          style={{
            position: 'absolute',
            left: `${fields.signature.x}px`,
            top: `${fields.signature.y}px`,
            width: `${fields.signature.width}px`,
            height: `${fields.signature.height}px`,
          }}
        >
          <img src={fields.signature.image} alt="Signature" className="w-full h-full object-contain" />
        </div>
      )}

      {/* Photo */}
      {agent.photo && (
        <div 
          style={{
            position: 'absolute',
            left: `${fields.photo.x}px`,
            top: `${fields.photo.y}px`,
            width: `${fields.photo.width}px`,
            height: `${fields.photo.height}px`,
            overflow: 'hidden',
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}
        >
          <img 
            src={agent.photo} 
            alt="Agent" 
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Fields */}
      <div style={getStyle(fields.nom)}>{agent.nom || 'NOM PRÉNOM'}</div>
      <div style={getStyle(fields.emploi)}>{agent.emploi || 'EMPLOI / FONCTION'}</div>
      <div style={getStyle(fields.service)}>{agent.service || 'SERVICE / DÉPARTEMENT'}</div>
      <div style={getStyle(fields.matricule)}>{agent.matricule || 'MATRICULE'}</div>

      {/* QR Code */}
      {fields?.qrCode?.visible && agent.matricule && (
        <div 
          style={{
            position: 'absolute',
            left: `${fields.qrCode.x}px`,
            top: `${fields.qrCode.y}px`,
          }}
        >
          <QRCodeSVG 
            value={agent.matricule} 
            size={fields.qrCode.size}
            level="H"
          />
        </div>
      )}
    </div>
  );
};

export default BadgePreview;
