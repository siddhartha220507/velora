import React, { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ChevronDown, Check, Briefcase, User, Building2 } from 'lucide-react';

const WorkspaceSwitcher = () => {
    const { workspaces, activeWorkspace, switchWorkspace, loading } = useWorkspace();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (loading || !activeWorkspace) return null;

    return (
        <div className="relative z-50 ml-6" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-white/[0.04] transition-colors border border-transparent hover:border-white/[0.04] group"
            >
                <div className="w-6 h-6 rounded-md bg-[#1e1e20] border border-white/[0.06] flex items-center justify-center text-white shrink-0 shadow-elevation-1">
                    {activeWorkspace.type === 'PERSONAL' ? <User size={12} /> : <Building2 size={12} />}
                </div>
                <div className="text-left flex flex-col justify-center">
                    <span className="text-[11px] font-bold text-[#e4e4e7] uppercase tracking-tight leading-none group-hover:text-white transition-colors block max-w-[120px] truncate">
                        {activeWorkspace.name}
                    </span>
                    <span className="text-[9px] text-[#71717a] font-medium uppercase tracking-widest mt-0.5">
                        {activeWorkspace.role}
                    </span>
                </div>
                <ChevronDown size={14} className={`text-[#52525b] ml-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-[#161618] border border-white/[0.08] rounded-2xl shadow-elevation-2 py-2 origin-top-left animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-2 border-b border-white/[0.04] mb-2">
                        <span className="text-[10px] font-black text-[#52525b] uppercase tracking-[0.2em]">Switch Workspace</span>
                    </div>
                    
                    <div className="max-h-[300px] overflow-y-auto px-2 space-y-1">
                        {workspaces.map((workspace) => {
                            const isActive = workspace.id === activeWorkspace.id;
                            return (
                                <button
                                    key={workspace.id}
                                    onClick={() => {
                                        switchWorkspace(workspace.id);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                                        isActive 
                                            ? 'bg-white/[0.06] text-white' 
                                            : 'text-[#a1a1aa] hover:bg-white/[0.02] hover:text-[#e4e4e7]'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                                            isActive 
                                                ? 'bg-[#1e1e20] border-white/10 text-white' 
                                                : 'bg-[#0d0d0f] border-white/[0.04] text-[#71717a]'
                                        }`}>
                                            {workspace.type === 'PERSONAL' ? <User size={14} /> : <Building2 size={14} />}
                                        </div>
                                        <div className="text-left">
                                            <span className="block text-[12px] font-semibold tracking-tight truncate max-w-[130px]">
                                                {workspace.name}
                                            </span>
                                            <span className="block text-[9px] font-medium uppercase tracking-widest text-[#71717a] mt-0.5">
                                                {workspace.type}
                                            </span>
                                        </div>
                                    </div>
                                    {isActive && <Check size={14} className="text-[#22c55e]" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkspaceSwitcher;
