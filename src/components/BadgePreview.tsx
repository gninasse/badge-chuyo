import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { BadgeTemplate, Agent } from '../types';

interface BadgePreviewProps {
  template: BadgeTemplate;
  agent: Partial<Agent>;
  scale?: number;
  id?: string;
  showBack?: boolean;
}

const BadgePreview: React.FC<BadgePreviewProps> = ({ template, agent, scale = 1, id, showBack = false }) => {
  if (!template) return null;
  const { fields, backgroundImage, backgroundColor } = template;

  if (showBack) {
    const cardId = agent.cardId || (agent.matricule ? agent.matricule.replace(/\s+/g, '') : 'MATRICULE');
    const texts = template.backTexts || {
      line1: 'Cette carte est strictement personnelle.',
      line2: 'En cas de perte ou de vol,',
      line3: 'le titulaire devra aviser',
      line4: 'la direction des ressources humaines.',
      line5: "A restituer à l'employeur",
      line6: 'en cas de cessation de fonction',
      line7: 'CENTRE HOSPITALIER',
      line8: 'YALGADO OUEDRAOGO',
      line9: 'UNIVERSITAIRE',
      line10: '03 BP 7022 Ouagadougou 03',
      line11: 'Tél : 25 31 16 55',
      line12: 'Email : Chubf@gmail.com'
    };

    return (
      <div 
        id={id}
        className="relative bg-white shadow-lg overflow-hidden border border-gray-200 flex flex-col justify-between py-5 px-3 text-center"
        style={{ 
          width: '208px', 
          height: '321px',
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
          color: '#000000',
          backgroundColor: '#ffffff'
        }}
      >
        {/* Vertical Unique Badge ID on the left side */}
        <div 
          style={{
            position: 'absolute',
            left: '-132px',
            top: '150px',
            width: '290px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'rotate(-90deg)',
            transformOrigin: 'center center',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontSize: '9px',
            fontWeight: 'bold',
            letterSpacing: '1.5px',
            color: '#111827',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 10
          }}
        >
          {cardId}
        </div>

        {/* Main Content shifted slightly to the right */}
        <div className="flex-1 flex flex-col justify-between pl-5 pr-1 text-center">
          {/* Top Disclaimer Section */}
          <div className="flex flex-col items-center justify-center space-y-1.5 pt-1">
            {texts.line1 && (
              <p className="font-bold text-[9.5px] leading-tight text-black tracking-tight">
                {texts.line1}
              </p>
            )}
            
            <div className="text-[8.5px] leading-tight text-black font-semibold space-y-0.5">
              {texts.line2 && <p>{texts.line2}</p>}
              {texts.line3 && <p>{texts.line3}</p>}
              {texts.line4 && <p className="font-bold">{texts.line4}</p>}
            </div>

            <div className="text-[8.5px] leading-tight text-black font-bold pt-1 space-y-0.5">
              {texts.line5 && <p>{texts.line5}</p>}
              {texts.line6 && <p>{texts.line6}</p>}
            </div>
          </div>

          {/* Separator Line */}
          <div className="my-1.5 flex justify-center w-full">
            <div className="w-[92%] border-t-[1.5px] border-black"></div>
          </div>

          {/* Bottom Section: Institution & Contact */}
          <div className="flex flex-col items-center justify-center space-y-1.5 pb-1">
            <div className="text-[9.5px] leading-tight text-black font-black tracking-wide uppercase space-y-0.5">
              {texts.line7 && <p>{texts.line7}</p>}
              {texts.line8 && <p>{texts.line8}</p>}
              {texts.line9 && <p>{texts.line9}</p>}
            </div>

            <div className="text-[8.5px] leading-tight text-black font-bold pt-0.5 space-y-0.5">
              {texts.line10 && <p>{texts.line10}</p>}
              {texts.line11 && <p>{texts.line11}</p>}
              {texts.line12 && <p>{texts.line12}</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getStyle = (config: any, isMultiline = false) => {
    const baseStyle: any = {
      position: 'absolute' as const,
      left: `${config.x}px`,
      top: `${config.y}px`,
      fontSize: `${config.fontSize}px`,
      fontFamily: config.fontFamily || 'inherit',
      color: config.color,
      textAlign: config.align as any,
      fontWeight: config.isBold ? 'bold' : 'normal',
      textTransform: config.isUppercase ? 'uppercase' : 'none' as any,
      width: config.align === 'center' ? '208px' : (isMultiline ? `${208 - config.x}px` : 'auto'),
      marginLeft: config.align === 'center' ? '-104px' : '0',
      display: config?.visible !== false ? 'block' : 'none',
      pointerEvents: 'none' as const,
    };

    if (isMultiline) {
      return {
        ...baseStyle,
        display: config?.visible !== false ? '-webkit-box' : 'none',
        WebkitBoxOrient: 'vertical' as const,
        WebkitLineClamp: 2,
        overflow: 'hidden',
        whiteSpace: 'normal' as const,
        lineHeight: '1.15',
        maxHeight: `${config.fontSize * 2.5}px`,
      };
    } else {
      return {
        ...baseStyle,
        whiteSpace: 'nowrap' as const,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      };
    }
  };

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
      <div style={getStyle(fields.service, true)}>{agent.service || 'SERVICE / DÉPARTEMENT'}</div>
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
