import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, initDb, DEFAULT_TEMPLATE } from './db';
import { Agent, BadgeTemplate } from './types';
import { 
  Users, 
  Settings, 
  LayoutDashboard, 
  Plus, 
  Download, 
  Upload, 
  Database,
  Sun,
  Moon,
  ShieldCheck,
  FileText
} from 'lucide-react';
import AgentList from './components/AgentList';
import AgentForm from './components/AgentForm';
import TemplateEditor from './components/TemplateEditor';
import BadgePreview from './components/BadgePreview';
import { generateBadgePDF, generateBulkPDF } from './utils/pdf';

export default function App() {
  const [activeTab, setActiveTab] = useState<'agents' | 'template' | 'settings'>('agents');
  const [isAddingAgent, setIsAddingAgent] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const agents = useLiveQuery(() => db.agents.toArray()) || [];
  const templates = useLiveQuery(() => db.templates.toArray()) || [];
  const rawDefaultTemplate = templates.find(t => t.isDefault) || templates[0];
  
  // Merge with DEFAULT_TEMPLATE to ensure all fields exist (defensive against old DB versions)
  const defaultTemplate = rawDefaultTemplate ? {
    ...DEFAULT_TEMPLATE,
    ...rawDefaultTemplate,
    fields: {
      ...DEFAULT_TEMPLATE.fields,
      ...rawDefaultTemplate.fields
    }
  } : null;

  useEffect(() => {
    initDb().then(() => setIsInitialized(true));
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleAddAgent = async (agentData: Omit<Agent, 'id' | 'dateCreation' | 'dateModification'>) => {
    const now = Date.now();
    await db.agents.add({
      ...agentData,
      dateCreation: now,
      dateModification: now
    });
    setIsAddingAgent(false);
  };

  const handleUpdateAgent = async (agentData: Omit<Agent, 'id' | 'dateCreation' | 'dateModification'>) => {
    if (!editingAgent?.id) return;
    await db.agents.update(editingAgent.id, {
      ...agentData,
      dateModification: Date.now()
    });
    setEditingAgent(null);
  };

  const handleDeleteAgent = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet agent ?')) {
      await db.agents.delete(id);
    }
  };

  const handleUpdateTemplate = async (template: BadgeTemplate) => {
    if (!template.id) return;
    await db.templates.update(template.id, template);
  };

  const handlePrintAgent = async (agent: Agent) => {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    document.body.appendChild(container);

    // Create a temporary React root to render the badge
    // Since we're in a simple app, we can just use a hidden div and a ref
    const badgeId = `badge-print-${agent.id}`;
    const badgeElement = document.createElement('div');
    badgeElement.id = badgeId;
    container.appendChild(badgeElement);

    // We need to render the BadgePreview into this element
    // For simplicity in this demo, we'll use a hidden preview in the main UI
    const hiddenPreview = document.getElementById(`hidden-preview-${agent.id}`);
    if (hiddenPreview) {
      await generateBadgePDF(hiddenPreview, `Badge_${agent.matricule}`);
    }
    
    document.body.removeChild(container);
  };

  const handleExportBulk = async (ids: number[], mode: 'single' | 'grid' = 'single') => {
    setIsGeneratingPDF(true);
    try {
      const selectedAgents = agents.filter(a => ids.includes(a.id!));
      const elements: HTMLElement[] = [];
      
      for (const agent of selectedAgents) {
        const el = document.getElementById(`hidden-preview-${agent.id}`);
        if (el) elements.push(el);
      }

      if (elements.length > 0) {
        await generateBulkPDF(elements, mode === 'single' ? 'Badges_Individuels' : 'Planche_A4', mode);
      }
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Matricule', 'Nom', 'Service', 'Emploi'];
    const rows = agents.map(a => [a.matricule, a.nom, a.service, a.emploi]);
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'agents_export.csv';
    link.click();
  };

  const importCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').slice(1); // Skip header
      for (const line of lines) {
        const [matricule, nom, service, emploi] = line.split(',');
        if (matricule && nom) {
          await db.agents.add({
            matricule: matricule.trim(),
            nom: nom.trim(),
            service: service.trim(),
            emploi: emploi.trim(),
            photo: '',
            dateCreation: Date.now(),
            dateModification: Date.now()
          });
        }
      }
    };
    reader.readAsText(file);
  };

  const backupDatabase = async () => {
    const allAgents = await db.agents.toArray();
    const allTemplates = await db.templates.toArray();
    const data = JSON.stringify({ agents: allAgents, templates: allTemplates });
    const blob = new Blob([data], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `badgemaster_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  if (!isInitialized || !defaultTemplate) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col ${darkMode ? 'dark' : ''}`}>
      {/* Navigation Sidebar (Desktop) / Bottom Bar (Mobile) */}
      <nav className="fixed bottom-0 left-0 w-full md:w-64 md:h-full bg-white border-t md:border-t-0 md:border-r border-gray-200 z-40 flex md:flex-col shadow-lg md:shadow-none">
        <div className="hidden md:flex items-center gap-3 p-8 border-b border-gray-100">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <ShieldCheck size={24} />
          </div>
          <h1 className="font-black text-xl tracking-tight text-gray-900">BadgeMaster</h1>
        </div>

        <div className="flex-1 flex md:flex-col justify-around md:justify-start p-2 md:p-4 gap-1 md:gap-2">
          <button 
            onClick={() => setActiveTab('agents')}
            className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'agents' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Users size={20} />
            <span className="text-[10px] md:text-sm">Agents</span>
          </button>
          <button 
            onClick={() => setActiveTab('template')}
            className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'template' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <FileText size={20} />
            <span className="text-[10px] md:text-sm">Modèle</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Settings size={20} />
            <span className="text-[10px] md:text-sm">Paramètres</span>
          </button>
        </div>

        <div className="hidden md:block p-4 border-t border-gray-100">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl transition-all"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span className="text-sm font-medium">{darkMode ? 'Mode Clair' : 'Mode Sombre'}</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-4 md:p-10 pb-24 md:pb-10">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'agents' && (
            <>
              {isAddingAgent || editingAgent ? (
                <AgentForm 
                  agent={editingAgent || undefined}
                  onSubmit={editingAgent ? handleUpdateAgent : handleAddAgent}
                  onCancel={() => { setIsAddingAgent(false); setEditingAgent(null); }}
                />
              ) : (
                <AgentList 
                  agents={agents}
                  template={defaultTemplate}
                  onAdd={() => setIsAddingAgent(true)}
                  onEdit={setEditingAgent}
                  onDelete={handleDeleteAgent}
                  onPrint={handlePrintAgent}
                  onExportBulk={handleExportBulk}
                />
              )}
            </>
          )}

          {activeTab === 'template' && defaultTemplate && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-gray-900">Configuration du Badge</h2>
                <div className="px-4 py-2 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100">
                  Sauvegarde automatique
                </div>
              </div>
              <TemplateEditor 
                template={defaultTemplate}
                onChange={handleUpdateTemplate}
              />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-black text-gray-900">Paramètres Système</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <Database className="text-indigo-600" size={24} />
                    <h3 className="font-bold text-lg">Données & Sauvegarde</h3>
                  </div>
                  <div className="space-y-4">
                    <button 
                      onClick={exportCSV}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <Download className="text-gray-400 group-hover:text-indigo-600" size={20} />
                        <span className="text-sm font-medium">Exporter les agents (CSV)</span>
                      </div>
                    </button>
                    
                    <label className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Upload className="text-gray-400 group-hover:text-indigo-600" size={20} />
                        <span className="text-sm font-medium">Importer des agents (CSV)</span>
                      </div>
                      <input type="file" accept=".csv" onChange={importCSV} className="hidden" />
                    </label>

                    <button 
                      onClick={backupDatabase}
                      className="w-full flex items-center justify-between p-4 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl transition-all shadow-lg shadow-indigo-100"
                    >
                      <div className="flex items-center gap-3">
                        <Database size={20} />
                        <span className="text-sm font-medium">Sauvegarde complète (JSON)</span>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <ShieldCheck className="text-indigo-600" size={24} />
                    <h3 className="font-bold text-lg">À propos</h3>
                  </div>
                  <div className="space-y-4 text-sm text-gray-600">
                    <p><strong>BadgeMaster Pro v1.0</strong></p>
                    <p>Une solution complète et sécurisée pour la gestion institutionnelle des badges professionnels.</p>
                    <ul className="list-disc pl-5 space-y-2 text-xs text-gray-500">
                      <li>Fonctionnement 100% Hors-ligne</li>
                      <li>Données stockées localement (IndexedDB)</li>
                      <li>Export PDF haute fidélité</li>
                      <li>Conformité Photo Passeport US</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Hidden previews for PDF generation */}
      <div className="fixed -left-[2000px] top-0 pointer-events-none">
        {agents.map(agent => (
          <div key={agent.id} id={`hidden-preview-${agent.id}`}>
            {defaultTemplate && <BadgePreview template={defaultTemplate} agent={agent} />}
          </div>
        ))}
      </div>

      {/* Loading Overlay for PDF Generation */}
      {isGeneratingPDF && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="text-center">
              <h3 className="font-black text-xl text-gray-900">Génération du PDF...</h3>
              <p className="text-gray-500 text-sm">Veuillez patienter quelques instants.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
