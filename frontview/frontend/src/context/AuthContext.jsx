import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { getCurrentUser } from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = sessionStorage.getItem('cached_user');
        return saved ? JSON.parse(saved) : null;
    });
    const [loading, setLoading] = useState(!sessionStorage.getItem('cached_user'));

    const refreshUser = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setUser(null);
            setLoading(false);
            sessionStorage.removeItem('cached_user');
            return null;
        }

        try {
            if (!user) setLoading(true);
            const res = await getCurrentUser();
            const userData = res.data.user;
            
            if (userData) {
                if (userData.username && !userData.name) userData.name = userData.username;
                if (userData.avatarUrl && !userData.avatar) userData.avatar = userData.avatarUrl;
            }
            
            setUser(userData);
            if (userData) sessionStorage.setItem('cached_user', JSON.stringify(userData));
            return userData;
        } catch (error) {
            console.error("Auth Refresh Failed:", error);
            if (error.response?.status === 401) {
                setUser(null);
                sessionStorage.removeItem('cached_user');
            }
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshUser();
        
        const handleUnauthorized = () => {
            setUser(null);
            setLoading(false);
        };

        window.addEventListener('auth-unauthorized', handleUnauthorized);
        return () => window.removeEventListener('auth-unauthorized', handleUnauthorized);
    }, [refreshUser]);

    const login = (userData, token) => {
        localStorage.setItem('token', token);
        sessionStorage.setItem('cached_user', JSON.stringify(userData));
        setUser(userData);
        setLoading(false);
    };

    const logout = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('cached_user');
        setUser(null);
        setLoading(false);
    };

    const value = { user, login, logout, loading, refreshUser };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};