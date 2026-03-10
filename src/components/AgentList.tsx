import React, { useState } from 'react';
import { Agent, BadgeTemplate } from '../types';
import { Search, UserPlus, FileDown, Trash2, Edit, Printer, Download, MoreVertical } from 'lucide-react';
import BadgePreview from './BadgePreview';

interface AgentListProps {
  agents: Agent[];
  onAdd: () => void;
  onEdit: (agent: Agent) => void;
  onDelete: (id: number) => void;
  onPrint: (agent: Agent) => void;
  onExportBulk: (ids: number[]) => void;
  template: BadgeTemplate;
}

const AgentList: React.FC<AgentListProps> = ({ agents, onAdd, onEdit, onDelete, onPrint, onExportBulk, template }) => {
  const [search, setSearch] = useState('');
  const [selectedAgents, setSelectedAgents] = useState<number[]>([]);

  const filteredAgents = agents.filter(a => 
    a.nom.toLowerCase().includes(search.toLowerCase()) || 
    a.matricule.toLowerCase().includes(search.toLowerCase())
  );

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
        
        <div className="flex gap-2 w-full md:w-auto">
          {selectedAgents.length > 0 && (
            <button 
              onClick={() => onExportBulk(selectedAgents)}
              className="flex-1 md:flex-none px-4 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-100 transition-all border border-indigo-100"
            >
              <FileDown size={18} /> PDF Groupé ({selectedAgents.length})
            </button>
          )}
          <button 
            onClick={onAdd}
            className="flex-1 md:flex-none px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
          >
            <UserPlus size={18} /> Nouvel Agent
          </button>
        </div>
      </div>

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
                      <button 
                        onClick={() => onPrint(agent)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Imprimer le badge"
                      >
                        <Printer size={18} />
                      </button>
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
