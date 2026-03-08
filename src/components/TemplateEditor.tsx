import React, { useState, useRef, useEffect } from 'react';
import { BadgeTemplate, BadgeFieldConfig } from '../types';
import { Settings, Image as ImageIcon, Move, Type, Palette, Eye, EyeOff, RotateCcw, PenTool } from 'lucide-react';
import BadgePreview from './BadgePreview';
import { DEFAULT_TEMPLATE } from '../db';
import SignatureCanvas from 'react-signature-canvas';

interface TemplateEditorProps {
  template: BadgeTemplate;
  onChange: (template: BadgeTemplate) => void;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({ template, onChange }) => {
  const [activeTab, setActiveTab] = useState<'layout' | 'header' | 'logos' | 'footer' | 'signature' | 'bg'>('layout');
  const [draggingField, setDraggingField] = useState<string | null>(null);
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const sigPad = useRef<SignatureCanvas>(null);

  const handleFieldChange = (fieldName: string, updates: any) => {
    const newTemplate = { ...template };
    (newTemplate.fields as any)[fieldName] = { ...(newTemplate.fields as any)[fieldName], ...updates };
    onChange(newTemplate);
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onChange({ ...template, backgroundImage: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const startDrag = (field: string) => (e: React.MouseEvent) => {
    setDraggingField(field);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingField || !previewRef.current) return;

      const rect = previewRef.current.getBoundingClientRect();
      const x = Math.round(e.clientX - rect.left);
      const y = Math.round(e.clientY - rect.top);

      const newTemplate = { ...template };
      if (draggingField === 'photo' || draggingField === 'qrCode' || draggingField === 'logoLeft' || draggingField === 'logoRight' || draggingField === 'signature') {
        if (!(newTemplate.fields as any)[draggingField]) return;
        (newTemplate.fields as any)[draggingField].x = x;
        (newTemplate.fields as any)[draggingField].y = y;
      } else {
        if (!(newTemplate.fields as any)[draggingField]) return;
        (newTemplate.fields as any)[draggingField].x = x;
        (newTemplate.fields as any)[draggingField].y = y;
      }
      onChange(newTemplate);
    };

    const handleMouseUp = () => {
      setDraggingField(null);
    };

    if (draggingField) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingField, template, onChange]);

  const CoordinateInputs = ({ name, config }: { name: string, config: { x: number, y: number } }) => (
    <div className="space-y-3 mt-3 pt-3 border-t border-gray-50">
      <div className="flex items-center justify-between">
        <label className="text-[10px] uppercase font-bold text-gray-400">Position X</label>
        <span className="text-[10px] font-mono bg-gray-100 px-1 rounded">{config.x}px</span>
      </div>
      <input 
        type="range" 
        min="0" 
        max="208" 
        value={config.x} 
        onChange={(e) => handleFieldChange(name, { x: parseInt(e.target.value) })}
        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
      />
      
      <div className="flex items-center justify-between">
        <label className="text-[10px] uppercase font-bold text-gray-400">Position Y</label>
        <span className="text-[10px] font-mono bg-gray-100 px-1 rounded">{config.y}px</span>
      </div>
      <input 
        type="range" 
        min="0" 
        max="321" 
        value={config.y} 
        onChange={(e) => handleFieldChange(name, { y: parseInt(e.target.value) })}
        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
      />
    </div>
  );

  const HeaderFieldControl = ({ name, label, config }: { name: string, label: string, config: BadgeFieldConfig & { text: string } }) => (
    <div 
      className={`p-4 border-b border-gray-100 last:border-0 transition-colors ${hoveredField === name ? 'bg-indigo-50/30' : ''}`}
      onMouseEnter={() => setHoveredField(name)}
      onMouseLeave={() => setHoveredField(null)}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-bold text-xs text-gray-800 uppercase tracking-tight">{label}</span>
        <button 
          onClick={() => handleFieldChange(name, { visible: !config.visible })}
          className={`p-1 rounded transition-colors ${config.visible ? 'text-indigo-600 hover:bg-indigo-100' : 'text-gray-300 hover:bg-gray-100'}`}
        >
          {config.visible ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
      </div>
      <input 
        type="text" 
        value={config.text} 
        onChange={(e) => handleFieldChange(name, { text: e.target.value })}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg mb-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
        placeholder="Texte de l'en-tête"
      />
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] uppercase font-bold text-gray-400">Taille de police</label>
            <span className="text-[10px] font-mono bg-gray-100 px-1 rounded">{config.fontSize}px</span>
          </div>
          <input 
            type="range" 
            min="6" 
            max="32" 
            value={config.fontSize} 
            onChange={(e) => handleFieldChange(name, { fontSize: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>
        
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Couleur</label>
            <div className="flex items-center gap-2">
              <input 
                type="color" 
                value={config.color} 
                onChange={(e) => handleFieldChange(name, { color: e.target.value })}
                className="w-8 h-8 border-0 p-0 rounded-full cursor-pointer overflow-hidden"
              />
              <span className="text-[10px] font-mono text-gray-500">{config.color}</span>
            </div>
          </div>
          <div className="flex-1">
            <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Alignement</label>
            <div className="flex bg-gray-100 p-0.5 rounded-lg">
              {(['left', 'center', 'right'] as const).map((align) => (
                <button
                  key={align}
                  onClick={() => handleFieldChange(name, { align })}
                  className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all ${config.align === align ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {align === 'left' ? 'G' : align === 'center' ? 'C' : 'D'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleFieldChange(name, { isBold: !config.isBold })}
            className={`flex-1 py-1.5 text-[10px] font-bold border rounded-lg transition-all ${config.isBold ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            GRAS
          </button>
          <button 
            onClick={() => handleFieldChange(name, { isUppercase: !config.isUppercase })}
            className={`flex-1 py-1.5 text-[10px] font-bold border rounded-lg transition-all ${config.isUppercase ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            MAJ
          </button>
        </div>
      </div>
      <CoordinateInputs name={name} config={config} />
    </div>
  );

  const LogoControl = ({ name, label, config }: { name: string, label: string, config: any }) => {
    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          handleFieldChange(name, { image: event.target?.result as string });
        };
        reader.readAsDataURL(file);
      }
    };

    return (
      <div 
        className={`p-4 border-b border-gray-100 last:border-0 transition-colors ${hoveredField === name ? 'bg-indigo-50/30' : ''}`}
        onMouseEnter={() => setHoveredField(name)}
        onMouseLeave={() => setHoveredField(null)}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-xs text-gray-800 uppercase tracking-tight">{label}</span>
          <button 
            onClick={() => handleFieldChange(name, { visible: !config.visible })}
            className={`p-1 rounded transition-colors ${config.visible ? 'text-indigo-600 hover:bg-indigo-100' : 'text-gray-300 hover:bg-gray-100'}`}
          >
            {config.visible ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden group relative">
            {config.image ? (
              <>
                <img src={config.image} className="w-full h-full object-contain" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label htmlFor={`logo-upload-${name}`} className="cursor-pointer text-white">
                    <ImageIcon size={20} />
                  </label>
                </div>
              </>
            ) : (
              <label htmlFor={`logo-upload-${name}`} className="cursor-pointer text-gray-300 hover:text-indigo-400 transition-colors">
                <ImageIcon size={24} />
              </label>
            )}
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleLogoUpload}
              className="hidden" 
              id={`logo-upload-${name}`}
            />
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase font-bold text-gray-400">Taille (px)</label>
              <span className="text-[10px] font-mono bg-gray-100 px-1 rounded">{config.size}px</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="100" 
              value={config.size} 
              onChange={(e) => handleFieldChange(name, { size: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
        </div>
        <CoordinateInputs name={name} config={config} />
      </div>
    );
  };

  const SignatureControl = ({ name, label, config }: { name: string, label: string, config: any }) => {
    const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          handleFieldChange(name, { image: event.target?.result as string });
        };
        reader.readAsDataURL(file);
      }
    };

    const saveSignature = () => {
      if (sigPad.current) {
        const dataUrl = sigPad.current.getTrimmedCanvas().toDataURL('image/png');
        handleFieldChange(name, { image: dataUrl });
      }
    };

    const clearSignature = () => {
      if (sigPad.current) {
        sigPad.current.clear();
      }
    };

    return (
      <div 
        className={`p-4 border-b border-gray-100 last:border-0 transition-colors ${hoveredField === name ? 'bg-indigo-50/30' : ''}`}
        onMouseEnter={() => setHoveredField(name)}
        onMouseLeave={() => setHoveredField(null)}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-xs text-gray-800 uppercase tracking-tight">{label}</span>
          <button 
            onClick={() => handleFieldChange(name, { visible: !config.visible })}
            className={`p-1 rounded transition-colors ${config.visible ? 'text-indigo-600 hover:bg-indigo-100' : 'text-gray-300 hover:bg-gray-100'}`}
          >
            {config.visible ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        </div>
        
        <div className="mb-4">
          <label className="text-[10px] uppercase font-bold text-gray-400 block mb-2">Signer ici</label>
          <div className="border border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
            <SignatureCanvas 
              ref={sigPad}
              penColor="black"
              canvasProps={{ width: 280, height: 100, className: 'sigCanvas' }}
            />
          </div>
          <div className="flex gap-2 mt-2">
            <button onClick={saveSignature} className="flex-1 py-1.5 text-[10px] font-bold bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 transition-all">VALIDER</button>
            <button onClick={clearSignature} className="flex-1 py-1.5 text-[10px] font-bold border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-all">EFFACER</button>
          </div>
        </div>

        <div className="mb-6">
          <label className="text-[10px] uppercase font-bold text-gray-400 block mb-2">Ou envoyer une image</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleSignatureUpload}
            className="w-full text-[10px] text-gray-500 file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] uppercase font-bold text-gray-400">Largeur (px)</label>
              <span className="text-[10px] font-mono bg-gray-100 px-1 rounded">{config.width}px</span>
            </div>
            <input 
              type="range" 
              min="20" 
              max="200" 
              value={config.width} 
              onChange={(e) => handleFieldChange(name, { width: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] uppercase font-bold text-gray-400">Hauteur (px)</label>
              <span className="text-[10px] font-mono bg-gray-100 px-1 rounded">{config.height}px</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="150" 
              value={config.height} 
              onChange={(e) => handleFieldChange(name, { height: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
        </div>
        <CoordinateInputs name={name} config={config} />
      </div>
    );
  };

  const FieldControl = ({ name, label, config }: { name: string, label: string, config: BadgeFieldConfig }) => (
    <div 
      className={`p-4 border-b border-gray-100 last:border-0 transition-colors ${hoveredField === name ? 'bg-indigo-50/30' : ''}`}
      onMouseEnter={() => setHoveredField(name)}
      onMouseLeave={() => setHoveredField(null)}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-bold text-xs text-gray-800 uppercase tracking-tight">{label}</span>
        <button 
          onClick={() => handleFieldChange(name, { visible: !config.visible })}
          className={`p-1 rounded transition-colors ${config.visible ? 'text-indigo-600 hover:bg-indigo-100' : 'text-gray-300 hover:bg-gray-100'}`}
        >
          {config.visible ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] uppercase font-bold text-gray-400">Taille de police</label>
            <span className="text-[10px] font-mono bg-gray-100 px-1 rounded">{config.fontSize}px</span>
          </div>
          <input 
            type="range" 
            min="6" 
            max="32" 
            value={config.fontSize} 
            onChange={(e) => handleFieldChange(name, { fontSize: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>
        
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Couleur</label>
            <div className="flex items-center gap-2">
              <input 
                type="color" 
                value={config.color} 
                onChange={(e) => handleFieldChange(name, { color: e.target.value })}
                className="w-8 h-8 border-0 p-0 rounded-full cursor-pointer overflow-hidden"
              />
              <span className="text-[10px] font-mono text-gray-500">{config.color}</span>
            </div>
          </div>
          <div className="flex-1">
            <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Alignement</label>
            <div className="flex bg-gray-100 p-0.5 rounded-lg">
              {(['left', 'center', 'right'] as const).map((align) => (
                <button
                  key={align}
                  onClick={() => handleFieldChange(name, { align })}
                  className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all ${config.align === align ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {align === 'left' ? 'G' : align === 'center' ? 'C' : 'D'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleFieldChange(name, { isBold: !config.isBold })}
            className={`flex-1 py-1.5 text-[10px] font-bold border rounded-lg transition-all ${config.isBold ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            GRAS
          </button>
          <button 
            onClick={() => handleFieldChange(name, { isUppercase: !config.isUppercase })}
            className={`flex-1 py-1.5 text-[10px] font-bold border rounded-lg transition-all ${config.isUppercase ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            MAJ
          </button>
        </div>
      </div>
      <CoordinateInputs name={name} config={config} />
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Preview Area */}
      <div className="flex-1 flex flex-col items-center">
        <div className="mb-4 text-sm text-gray-500 flex items-center gap-2">
          <Move size={16} />
          <span>Glissez les éléments sur le badge pour les repositionner</span>
        </div>
        <div 
          ref={previewRef}
          className="relative select-none cursor-crosshair"
          style={{ width: '208px', height: '321px' }}
        >
          <BadgePreview template={template} agent={{}} />
          
          {/* Draggable Overlays */}
          {Object.entries(template.fields).map(([key, config]: [string, any]) => {
            if (!config) return null;
            const isHovered = hoveredField === key;
            return (
              <div
                key={key}
                onMouseDown={startDrag(key)}
                onMouseEnter={() => setHoveredField(key)}
                onMouseLeave={() => setHoveredField(null)}
                className={`absolute border-2 transition-all duration-200 cursor-move ${isHovered ? 'border-indigo-600 bg-indigo-600/10 shadow-lg scale-105' : 'border-transparent hover:border-indigo-400 hover:bg-indigo-400/5'} ${draggingField === key ? 'border-indigo-600 bg-indigo-600/20 scale-100' : ''}`}
                style={{
                  left: `${config.x - (key === 'photo' || key === 'qrCode' || key === 'logoLeft' || key === 'logoRight' || key === 'signature' ? 0 : (config.align === 'center' ? 104 : 0))}px`,
                  top: `${config.y - (key === 'photo' || key === 'qrCode' || key === 'logoLeft' || key === 'logoRight' || key === 'signature' ? 0 : config.fontSize)}px`,
                  width: `${key === 'photo' || key === 'signature' ? config.width : (key === 'qrCode' || key === 'logoLeft' || key === 'logoRight' ? config.size : 208)}px`,
                  height: `${key === 'photo' || key === 'signature' ? config.height : (key === 'qrCode' || key === 'logoLeft' || key === 'logoRight' ? config.size : config.fontSize * 1.5)}px`,
                  zIndex: (draggingField === key || isHovered) ? 50 : 10
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Controls Area */}
      <div className="w-full lg:w-80 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar bg-gray-50/50">
          <button 
            onClick={() => setActiveTab('layout')}
            className={`flex-1 min-w-[70px] py-4 text-[10px] font-bold uppercase tracking-widest flex flex-col items-center gap-1 transition-all ${activeTab === 'layout' ? 'text-indigo-600 bg-white border-b-2 border-indigo-600 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Type size={14} /> <span>INFOS</span>
          </button>
          <button 
            onClick={() => setActiveTab('header')}
            className={`flex-1 min-w-[70px] py-4 text-[10px] font-bold uppercase tracking-widest flex flex-col items-center gap-1 transition-all ${activeTab === 'header' ? 'text-indigo-600 bg-white border-b-2 border-indigo-600 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Type size={14} /> <span>TÊTE</span>
          </button>
          <button 
            onClick={() => setActiveTab('logos')}
            className={`flex-1 min-w-[70px] py-4 text-[10px] font-bold uppercase tracking-widest flex flex-col items-center gap-1 transition-all ${activeTab === 'logos' ? 'text-indigo-600 bg-white border-b-2 border-indigo-600 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <ImageIcon size={14} /> <span>LOGOS</span>
          </button>
          <button 
            onClick={() => setActiveTab('footer')}
            className={`flex-1 min-w-[70px] py-4 text-[10px] font-bold uppercase tracking-widest flex flex-col items-center gap-1 transition-all ${activeTab === 'footer' ? 'text-indigo-600 bg-white border-b-2 border-indigo-600 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Type size={14} /> <span>BAS</span>
          </button>
          <button 
            onClick={() => setActiveTab('signature')}
            className={`flex-1 min-w-[70px] py-4 text-[10px] font-bold uppercase tracking-widest flex flex-col items-center gap-1 transition-all ${activeTab === 'signature' ? 'text-indigo-600 bg-white border-b-2 border-indigo-600 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <PenTool size={14} /> <span>SIGN</span>
          </button>
          <button 
            onClick={() => setActiveTab('bg')}
            className={`flex-1 min-w-[70px] py-4 text-[10px] font-bold uppercase tracking-widest flex flex-col items-center gap-1 transition-all ${activeTab === 'bg' ? 'text-indigo-600 bg-white border-b-2 border-indigo-600 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Palette size={14} /> <span>FOND</span>
          </button>
        </div>

        <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
          <div className="p-4 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Édition Rapide</span>
            <button 
              onClick={() => {
                if (confirm('Réinitialiser le modèle aux paramètres par défaut ?')) {
                  onChange({ ...DEFAULT_TEMPLATE, id: template.id });
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-100 text-red-500 rounded-lg text-[10px] font-black hover:bg-red-50 transition-all shadow-sm"
            >
              <RotateCcw size={10} /> RÉINITIALISER
            </button>
          </div>
          {activeTab === 'layout' && template.fields.nom && (
            <>
              <FieldControl name="nom" label="Nom Complet" config={template.fields.nom} />
              <FieldControl name="emploi" label="Emploi / Fonction" config={template.fields.emploi} />
              <FieldControl name="service" label="Service" config={template.fields.service} />
              <FieldControl name="matricule" label="Matricule" config={template.fields.matricule} />
              
              {template.fields.photo && (
                <div 
                  className={`p-4 border-b border-gray-100 transition-colors ${hoveredField === 'photo' ? 'bg-indigo-50/30' : ''}`}
                  onMouseEnter={() => setHoveredField('photo')}
                  onMouseLeave={() => setHoveredField(null)}
                >
                  <span className="font-bold text-xs text-gray-800 uppercase tracking-tight block mb-3">Photo de l'agent</span>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] uppercase font-bold text-gray-400">Largeur (px)</label>
                        <span className="text-[10px] font-mono bg-gray-100 px-1 rounded">{template.fields.photo.width}px</span>
                      </div>
                      <input 
                        type="range" 
                        min="50" 
                        max="150" 
                        value={template.fields.photo.width} 
                        onChange={(e) => handleFieldChange('photo', { width: parseInt(e.target.value) })}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] uppercase font-bold text-gray-400">Hauteur (px)</label>
                        <span className="text-[10px] font-mono bg-gray-100 px-1 rounded">{template.fields.photo.height}px</span>
                      </div>
                      <input 
                        type="range" 
                        min="50" 
                        max="150" 
                        value={template.fields.photo.height} 
                        onChange={(e) => handleFieldChange('photo', { height: parseInt(e.target.value) })}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>
                  </div>
                  <CoordinateInputs name="photo" config={template.fields.photo} />
                </div>
              )}

              {template.fields.qrCode && (
                <div 
                  className={`p-4 transition-colors ${hoveredField === 'qrCode' ? 'bg-indigo-50/30' : ''}`}
                  onMouseEnter={() => setHoveredField('qrCode')}
                  onMouseLeave={() => setHoveredField(null)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-xs text-gray-800 uppercase tracking-tight">QR Code</span>
                    <button 
                      onClick={() => handleFieldChange('qrCode', { visible: !template.fields.qrCode.visible })}
                      className={`p-1 rounded transition-colors ${template.fields.qrCode.visible ? 'text-indigo-600 hover:bg-indigo-100' : 'text-gray-300 hover:bg-gray-100'}`}
                    >
                      {template.fields.qrCode.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] uppercase font-bold text-gray-400">Taille (px)</label>
                      <span className="text-[10px] font-mono bg-gray-100 px-1 rounded">{template.fields.qrCode.size}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="20" 
                      max="100" 
                      value={template.fields.qrCode.size} 
                      onChange={(e) => handleFieldChange('qrCode', { size: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                  <CoordinateInputs name="qrCode" config={template.fields.qrCode} />
                </div>
              )}
            </>
          )}

          {activeTab === 'header' && template.fields.headerText1 && (
            <>
              <HeaderFieldControl name="headerText1" label="Ligne 1" config={template.fields.headerText1} />
              <HeaderFieldControl name="headerText2" label="Ligne 2" config={template.fields.headerText2} />
              <HeaderFieldControl name="headerText3" label="Ligne 3" config={template.fields.headerText3} />
            </>
          )}

          {activeTab === 'logos' && template.fields.logoLeft && (
            <>
              <LogoControl name="logoLeft" label="Logo Gauche" config={template.fields.logoLeft} />
              <LogoControl name="logoRight" label="Logo Droite" config={template.fields.logoRight} />
            </>
          )}

          {activeTab === 'footer' && template.fields.footerText && (
            <HeaderFieldControl name="footerText" label="Zone du Bas" config={template.fields.footerText} />
          )}

          {activeTab === 'signature' && template.fields.signature && (
            <SignatureControl name="signature" label="Signature du DG" config={template.fields.signature} />
          )}

          {activeTab === 'bg' && (
            <div className="p-6 space-y-8">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Couleur de fond</label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <input 
                      type="color" 
                      value={template.backgroundColor || '#ffffff'} 
                      onChange={(e) => onChange({ ...template, backgroundColor: e.target.value })}
                      className="w-12 h-12 border-0 p-0 rounded-xl cursor-pointer overflow-hidden shadow-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <input 
                      type="text" 
                      value={template.backgroundColor || '#ffffff'} 
                      onChange={(e) => onChange({ ...template, backgroundColor: e.target.value })}
                      className="w-full px-3 py-2 text-xs font-mono border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all uppercase"
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Image de fond</label>
                {template.backgroundImage ? (
                  <div className="relative group rounded-xl overflow-hidden border border-gray-100">
                    <img 
                      src={template.backgroundImage} 
                      alt="Fond actuel" 
                      className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                      <label className="px-4 py-2 bg-white text-indigo-600 text-[10px] font-black rounded-lg cursor-pointer hover:bg-indigo-50 transition-colors shadow-lg">
                        CHANGER L'IMAGE
                        <input type="file" accept="image/*" onChange={handleBgUpload} className="hidden" />
                      </label>
                      <button 
                        onClick={() => onChange({ ...template, backgroundImage: undefined })}
                        className="px-4 py-2 bg-red-600 text-white text-[10px] font-black rounded-lg hover:bg-red-700 transition-colors shadow-lg"
                      >
                        SUPPRIMER
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer relative group">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleBgUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <ImageIcon className="text-gray-400 group-hover:text-indigo-500 transition-colors" size={24} />
                    </div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Cliquez pour ajouter un fond</p>
                    <p className="text-[8px] text-gray-400 mt-1 uppercase">Format recommandé: 208x321px</p>
                  </div>
                )}
              </div>
              
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <h4 className="text-[10px] font-black text-indigo-700 uppercase mb-1">Conseil Pro</h4>
                <p className="text-[10px] text-indigo-600 leading-relaxed">
                  Utilisez une image de fond avec des zones claires pour que les textes restent lisibles. Vous pouvez ajuster la position des éléments en les faisant glisser sur l'aperçu.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;
