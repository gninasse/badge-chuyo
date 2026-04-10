import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import Cropper from 'react-easy-crop';
import { Agent } from '../types';
import { Camera, Upload, X, Check, RotateCcw, Copy, ZoomIn, RotateCw } from 'lucide-react';
import { fileToBase64, optimizeImage, getCroppedImg } from '../utils/image';

interface AgentFormProps {
  agent?: Agent;
  onSubmit: (agent: Omit<Agent, 'id' | 'dateCreation' | 'dateModification'>) => void;
  onCancel: () => void;
}

const AgentForm: React.FC<AgentFormProps> = ({ agent, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    matricule: agent?.matricule || '',
    nom: agent?.nom || '',
    service: agent?.service || '',
    emploi: agent?.emploi || '',
    photo: agent?.photo || ''
  });

  const [isCropping, setIsCropping] = useState(false);
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [copied, setCopied] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const base64 = await fileToBase64(acceptedFiles[0]);
      setRawImage(base64);
      setIsCropping(true);
      setZoom(1);
      setRotation(0);
    }
  }, []);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false
  });

  const handleCrop = async () => {
    if (rawImage && croppedAreaPixels) {
      try {
        const cropped = await getCroppedImg(rawImage, croppedAreaPixels, rotation);
        setFormData({ ...formData, photo: cropped });
        setIsCropping(false);
        setRawImage(null);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-w-2xl mx-auto">
      <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between">
        <h2 className="text-white font-bold text-lg">
          {agent ? 'Modifier l\'agent' : 'Ajouter un nouvel agent'}
        </h2>
        <button onClick={onCancel} className="text-indigo-100 hover:text-white">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Photo Section */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-32 h-40 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center transition-all group-hover:border-indigo-400">
                {formData.photo ? (
                  <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <Camera className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-[10px] uppercase font-bold text-gray-400">Photo Passeport</p>
                  </div>
                )}
              </div>
              
              <div {...getRootProps()} className="absolute inset-0 cursor-pointer opacity-0">
                <input {...getInputProps()} />
              </div>

              {formData.photo && (
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, photo: '' })}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <p className="mt-4 text-xs text-gray-500 text-center">
              Format 4:5 (Passeport)<br />
              Cliquez pour changer la photo
            </p>
          </div>

          {/* Fields Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Matricule</label>
              <input 
                required
                type="text"
                value={formData.matricule}
                onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="Ex: 239 781 N"
              />
              <button 
                type="button"
                onClick={() => {
                  const cleanMatricule = formData.matricule.replace(/\s+/g, '');
                  navigator.clipboard.writeText(cleanMatricule);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className={`mt-1 flex items-center gap-1 text-[10px] font-bold transition-all ${copied ? 'text-green-600' : 'text-indigo-600 hover:text-indigo-800'}`}
                title="Copier le matricule sans les espaces"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span className="underline">{copied ? 'Copié !' : 'Copier sans espaces'}</span>
              </button>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nom Complet</label>
              <input 
                required
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="Ex: WANGRAWA W. Justine"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Service</label>
              <input 
                required
                type="text"
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="Ex: MATERNITE"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Emploi / Fonction</label>
              <input 
                required
                type="text"
                value={formData.emploi}
                onChange={(e) => setFormData({ ...formData, emploi: e.target.value })}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="Ex: Infirmière Diplômée d'Etat"
              />
            </div>
          </div>
        </div>

        <div className="mt-10 flex gap-4">
          <button 
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all"
          >
            Annuler
          </button>
          <button 
            type="submit"
            className="flex-1 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
          >
            {agent ? 'Mettre à jour' : 'Enregistrer l\'agent'}
          </button>
        </div>
      </form>

      {/* Advanced Crop Modal */}
      {isCropping && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="bg-gray-900 p-4 flex items-center justify-between text-white">
              <h3 className="font-bold">Ajuster la photo</h3>
              <button onClick={() => { setIsCropping(false); setRawImage(null); }}>
                <X size={24} />
              </button>
            </div>
            
            <div className="relative h-[400px] bg-gray-100">
              <Cropper
                image={rawImage!}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={4 / 5}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                cropShape="rect"
                showGrid={true}
              />
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <ZoomIn size={20} className="text-gray-400" />
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <span className="text-xs font-bold text-gray-500 w-8">{zoom.toFixed(1)}x</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <RotateCw size={20} className="text-gray-400" />
                  <input
                    type="range"
                    value={rotation}
                    min={0}
                    max={360}
                    step={1}
                    aria-labelledby="Rotation"
                    onChange={(e) => setRotation(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <span className="text-xs font-bold text-gray-500 w-8">{rotation}°</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => { setIsCropping(false); setRawImage(null); }}
                  className="flex-1 py-3 text-gray-600 font-bold border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleCrop}
                  className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
                >
                  <Check size={20} /> Appliquer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentForm;
