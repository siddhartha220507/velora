import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from './AuthContext';

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
    const { user } = useAuth();
    const [workspaces, setWorkspaces] = useState([]);
    const [activeWorkspace, setActiveWorkspace] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    // Agar tumhare paas koi token condition hai ya direct fetch karna hai
    const token = localStorage.getItem('token');
    
    if (token) {
        fetchWorkspaces();
    } else {
        setWorkspaces([]);
        setActiveWorkspace(null);
    }
}, []);

    const fetchWorkspaces = async () => {
        try {
            setLoading(true);
            const res = await api.get('/workspaces');
            const fetchedWorkspaces = res.data.data;
            setWorkspaces(fetchedWorkspaces);

            const savedId = localStorage.getItem('activeWorkspaceId');
            if (savedId && fetchedWorkspaces.find(w => w.id === savedId)) {
                setActiveWorkspace(fetchedWorkspaces.find(w => w.id === savedId));
            } else if (fetchedWorkspaces.length > 0) {
                // Default to Personal Workspace
                const personal = fetchedWorkspaces.find(w => w.type === 'PERSONAL');
                setActiveWorkspace(personal || fetchedWorkspaces[0]);
                localStorage.setItem('activeWorkspaceId', (personal || fetchedWorkspaces[0]).id);
            }
        } catch (error) {
            console.error("Failed to fetch workspaces:", error);
        } finally {
            setLoading(false);
        }
    };

    const switchWorkspace = (workspaceId) => {
        const workspace = workspaces.find(w => w.id === workspaceId);
        if (workspace) {
            setActiveWorkspace(workspace);
            localStorage.setItem('activeWorkspaceId', workspaceId);
            // Reload the page to reset all project states in other components,
            // or we could just let React reactivity handle it.
            // For a complete state refresh, window.location.reload() is robust.
            window.location.reload();
        }
    };

    return (
        <WorkspaceContext.Provider value={{ workspaces, activeWorkspace, switchWorkspace, loading, refreshWorkspaces: fetchWorkspaces }}>
            {children}
        </WorkspaceContext.Provider>
    );
}

export function useWorkspace() {
    const context = useContext(WorkspaceContext);
    if (!context) {
        throw new Error('useWorkspace must be used within a WorkspaceProvider');
    }
    return context;
}
