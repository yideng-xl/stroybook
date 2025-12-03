import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

interface User {
    id: string;
    username: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null; // Added token to interface
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isLoginModalOpen: boolean;
    openLoginModal: () => void;
    closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token')); // Initialize token state
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (storedToken && savedUser) {
            setToken(storedToken); // Ensure state is synced
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const login = (newToken: string, userData: User) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(newToken); // Update state
        setUser(userData);
        setIsLoginModalOpen(false); // Close modal on success
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null); // Update state
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ 
            user, token, login, logout, isAuthenticated: !!user, // Provide token
            isLoginModalOpen,
            openLoginModal: () => setIsLoginModalOpen(true),
            closeLoginModal: () => setIsLoginModalOpen(false)
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
