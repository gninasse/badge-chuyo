import React, { useState } from 'react';
import { Agent, BadgeTemplate } from '../types';
import { Search, UserPlus, FileDown, Trash2, Edit, Printer, Download, MoreVertical } from 'lucide-react';
import BadgePreview from './BadgePreview';

interface AgentListProps {
  agents: Agent[];
  onAdd: () => void;
  onEdit: (agent: Agent) => void;
  onDelete: (id: number) => void;
  onPrint: (agent: Agent, side: 'recto' | 'verso' | 'both') => void;
  onExportBulk: (ids: number[], mode: 'single' | 'grid', side: 'recto' | 'verso' | 'both') => void;
  onDeleteBulk: (ids: number[]) => void;
  template: BadgeTemplate;
}

const AgentList: React.FC<AgentListProps> = ({ agents, onAdd, onEdit, onDelete, onPrint, onExportBulk, onDeleteBulk, template }) => {
  const [search, setSearch] = useState('');
  const [selectedAgents, setSelectedAgents] = useState<number[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  React.useEffect(() => {
    const handleGlobalClick = () => {
      setActiveDropdown(null);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const filteredAgents = agents
    .filter(a => 
      a.nom.toLowerCase().includes(search.toLowerCase()) || 
      a.matricule.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const timeA = Math.max(a.dateModification || 0, a.dateCreation || 0, a.id || 0);
      const timeB = Math.max(b.dateModification || 0, b.dateCreation || 0, b.id || 0);
      return timeB - timeA;
    });

  const toggleSelect = (id: number) => {
    setSelectedAgents(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedAgents.length === filteredAgents.length) {
      setSelectedAgents([]);
    } else {
      setSelectedAgents(filteredAgents.map(a => a.id!));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher un agent ou matricule..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
        
        <div className="flex gap-3 items-center w-full md:w-auto justify-end">
          <button 
            onClick={onAdd}
            className="w-full md:w-auto px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all text-xs"
          >
            <UserPlus size={16} /> Nouvel Agent
          </button>
        </div>
      </div>

      {/* Selected Action Bar */}
      {selectedAgents.length > 0 && (
        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-xl border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/20 text-indigo-400 p-2 rounded-xl">
              <UserPlus size={18} />
            </div>
            <div>
              <div className="font-bold text-sm text-white">
                {selectedAgents.length} {selectedAgents.length > 1 ? 'agents sélectionnés' : 'agent sélectionné'}
              </div>
              <button 
                onClick={() => setSelectedAgents([])}
                className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium transition-colors text-left"
              >
                Annuler la sélection
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
            {/* Export Recto */}
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(prev => prev === 'bulk-recto' ? null : 'bulk-recto');
                }}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl flex items-center gap-2 border border-slate-700 transition-all text-indigo-300 shadow-sm"
              >
                <FileDown size={14} /> RECTOS (COULEUR)
              </button>
              {activeDropdown === 'bulk-recto' && (
                <div className="absolute right-0 lg:left-0 mt-2 w-48 bg-white text-gray-800 border border-gray-100 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-gray-50">
                  <button 
                    onClick={() => onExportBulk(selectedAgents, 'single', 'recto')}
                    className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 font-semibold flex items-center gap-2 transition-colors"
                  >
                    <span>📇 Format Badge (PDF)</span>
                  </button>
                  <button 
                    onClick={() => onExportBulk(selectedAgents, 'grid', 'recto')}
                    className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 font-semibold flex items-center gap-2 transition-colors"
                  >
                    <span>📋 Planche A4 (PDF)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Export Verso */}
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(prev => prev === 'bulk-verso' ? null : 'bulk-verso');
                }}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl flex items-center gap-2 border border-slate-700 transition-all text-gray-300 shadow-sm"
              >
                <FileDown size={14} /> VERSOS (N&B)
              </button>
              {activeDropdown === 'bulk-verso' && (
                <div className="absolute right-0 lg:left-0 mt-2 w-48 bg-white text-gray-800 border border-gray-100 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-gray-50">
                  <button 
                    onClick={() => onExportBulk(selectedAgents, 'single', 'verso')}
                    className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-semibold flex items-center gap-2 transition-colors"
                  >
                    <span>📇 Format Badge (PDF)</span>
                  </button>
                  <button 
                    onClick={() => onExportBulk(selectedAgents, 'grid', 'verso')}
                    className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-semibold flex items-center gap-2 transition-colors"
                  >
                    <span>📋 Planche A4 (PDF)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Export Both */}
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(prev => prev === 'bulk-both' ? null : 'bulk-both');
                }}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl flex items-center gap-2 border border-slate-700 transition-all text-amber-300 shadow-sm"
              >
                <Printer size={14} /> RECTO + VERSO
              </button>
              {activeDropdown === 'bulk-both' && (
                <div className="absolute right-0 mt-2 w-52 bg-white text-gray-800 border border-gray-100 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-gray-50">
                  <button 
                    onClick={() => onExportBulk(selectedAgents, 'single', 'both')}
                    className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-amber-50 hover:text-amber-700 font-semibold flex items-center gap-2 transition-colors"
                  >
                    <span>📇 Format Badge (2 PDFs)</span>
                  </button>
                  <button 
                    onClick={() => onExportBulk(selectedAgents, 'grid', 'both')}
                    className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-amber-50 hover:text-amber-700 font-semibold flex items-center gap-2 transition-colors"
                  >
                    <span>📋 Planche A4 (2 PDFs)</span>
                  </button>
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-slate-800 hidden lg:block mx-1"></div>

            {/* Delete button */}
            <button 
              onClick={() => {
                onDeleteBulk(selectedAgents);
                setSelectedAgents([]);
              }}
              className="px-3.5 py-2 bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 text-xs font-bold rounded-xl flex items-center gap-2 border border-red-900/50 transition-all"
              title="Supprimer la sélection"
            >
              <Trash2 size={14} /> SUPPRIMER
            </button>
          </div>
        </div>
      )}

      {/* Table / Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4">
                  <input 
                    type="checkbox" 
                    checked={selectedAgents.length === filteredAgents.length && filteredAgents.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Agent</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Service / Emploi</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Aperçu Badge</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAgents.map(agent => (
                <tr key={agent.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      checked={selectedAgents.includes(agent.id!)}
                      onChange={() => toggleSelect(agent.id!)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        {agent.photo ? (
                          <img src={agent.photo} alt={agent.nom} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Edit size={20} />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{agent.nom}</div>
                        <div className="text-xs font-mono text-gray-500">{agent.matricule}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700">{agent.emploi}</div>
                    <div className="text-xs text-gray-400">{agent.service}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="scale-[0.15] origin-left">
                      <BadgePreview template={template} agent={agent} />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdown(prev => prev === `agent-${agent.id}` ? null : `agent-${agent.id}`);
                          }}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center"
                          title="Imprimer"
                        >
                          <Printer size={18} />
                        </button>
                        {activeDropdown === `agent-${agent.id}` && (
                          <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden text-left">
                            <button 
                              onClick={() => onPrint(agent, 'recto')}
                              className="w-full text-left px-3 py-1.5 text-[10px] font-black text-indigo-700 hover:bg-indigo-50"
                            >
                              FACE (COULEUR)
                            </button>
                            <button 
                              onClick={() => onPrint(agent, 'verso')}
                              className="w-full text-left px-3 py-1.5 text-[10px] font-black text-gray-700 hover:bg-gray-50"
                            >
                              DOS (N&B)
                            </button>
                            <button 
                              onClick={() => onPrint(agent, 'both')}
                              className="w-full text-left px-3 py-1.5 text-[10px] font-black text-amber-700 hover:bg-amber-50"
                            >
                              LES DEUX (RECTO+VERSO)
                            </button>
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={() => onEdit(agent)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => onDelete(agent.id!)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAgents.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Aucun agent trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AgentList;
