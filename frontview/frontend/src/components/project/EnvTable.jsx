import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Plus, Key, Shield, Trash2, RefreshCw, Loader2 } from 'lucide-react';
import GlassButton from '../ui/GlassButton';
import { getEnvVars, addEnvVar, deleteEnvVar } from '../../api/api';

export default function EnvTable({ projectId }) {
  const [envs, setEnvs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");

  // Initial Fetch
  const fetchEnvs = async () => {
    if (!projectId) return;
    setIsLoading(true);
    setError("");
    try {
      const { data } = await getEnvVars(projectId);
      setEnvs((data.data || []).map(env => ({ ...env, id: env.key, isRevealed: false, value: env.masked })));
    } catch (error) {
      console.error('Failed to fetch envs:', error);
      setError("Failed to load environment variables.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnvs();
  }, [projectId]);

  // Reveal Logic (Masked on backend, so we can't truly reveal without a separate decrypt endpoint)
  const toggleReveal = (id) => {
    // For now, since they are masked, we just show a message or do nothing
    // Unless we implement a decrypt endpoint
  };

  // Add New Key
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newKey || !newValue || !projectId) return;

    setIsAdding(true);
    setError("");
    try {
      await addEnvVar(projectId, newKey.toUpperCase().replace(/\s+/g, '_'), newValue);
      setNewKey('');
      setNewValue('');
      fetchEnvs();
    } catch (error) {
      console.error('Failed to add env:', error);
      setError("Failed to add secret.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (key) => {
    if (!window.confirm(`Delete ${key}?`)) return;
    try {
      await deleteEnvVar(projectId, key);
      setEnvs(prev => prev.filter(env => env.key !== key));
    } catch (error) {
      console.error('Failed to delete env:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#111113] border border-white/[0.06] rounded-xl overflow-hidden shadow-elevation-1">

      {/* Header */}
      <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between shrink-0 bg-[#09090b]">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-[#22c55e]" />
          <p className="text-[14px] font-medium text-white">Secrets Vault</p>
          <span className="text-[11px] text-[#71717a] bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/[0.06] ml-2">
            AES-256 Encrypted
          </span>
        </div>
        <button onClick={fetchEnvs} className="p-1.5 rounded-md text-[#71717a] hover:text-white hover:bg-white/[0.06] transition-colors" title="Refresh secrets">
          <RefreshCw size={14} className={isLoading ? "animate-spin text-[#3b82f6]" : ""} />
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-[#09090b] z-10 border-b border-white/[0.04]">
            <tr>
              <th className="px-6 py-3 text-[12px] font-medium text-[#71717a] tracking-wide">Key</th>
              <th className="px-6 py-3 text-[12px] font-medium text-[#71717a] tracking-wide">Value</th>
              <th className="px-6 py-3 text-[12px] font-medium text-[#71717a] tracking-wide text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {isLoading && envs.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-[#71717a] text-[13px]">
                  <Loader2 size={16} className="animate-spin inline mr-2" /> Decrypting vault...
                </td>
              </tr>
            ) : envs.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-[#71717a] text-[13px]">
                  Vault is empty
                </td>
              </tr>
            ) : (
              envs.map((env) => (
                <tr key={env.key} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-[#3b82f6] text-[13px] font-mono flex items-center gap-2">
                      <Key size={12} className="text-[#71717a]" />
                      {env.key}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[13px] font-mono text-[#71717a]`}>
                      {env.masked}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleDelete(env.key)}
                        className="p-1.5 rounded-md text-[#71717a] hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors ml-1"
                        title="Delete Secret"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add New Form */}
      <div className="p-5 border-t border-white/[0.06] bg-[#09090b] shrink-0">
        <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-[12px] font-medium text-[#a1a1aa] mb-1.5">New Key</label>
            <input 
              placeholder="e.g. DATABASE_URL" 
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              className="w-full h-9 px-3 bg-[#111113] border border-white/[0.06] rounded-md text-[13px] text-white placeholder:text-[#71717a] focus:outline-none focus:border-white/[0.12] transition-colors font-mono uppercase"
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-[12px] font-medium text-[#a1a1aa] mb-1.5">Secret Value</label>
            <input 
              placeholder="e.g. your_secret_string" 
              type="password"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="w-full h-9 px-3 bg-[#111113] border border-white/[0.06] rounded-md text-[13px] text-white placeholder:text-[#71717a] focus:outline-none focus:border-white/[0.12] transition-colors font-mono"
            />
          </div>
          <GlassButton 
            variant="primary" 
            type="submit" 
            disabled={isAdding || !newKey || !newValue}
            className="w-full md:w-auto h-9 px-4 text-xs"
          >
            {isAdding ? (
              <><RefreshCw size={14} className="animate-spin mr-1.5" /> Encrypting...</>
            ) : (
              <><Plus size={14} className="mr-1.5" /> Encrypt & Add</>
            )}
          </GlassButton>
        </form>
        {error && <p className="text-[11px] text-[#ef4444] mt-2">{error}</p>}
      </div>

    </div>
  );
}
