import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'; // Corrected imports
// import { api } from '../api/client'; // api is not directly used here after refactor

interface User {
    id: string;
    username: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null; 
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isLoginModalOpen: boolean;
    openLoginModal: () => void;
    closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const authService = {
    _user: null as User | null,
    _token: localStorage.getItem('token'),
    _isLoginModalOpen: false,
    _listeners: [] as ((user: User | null, token: string | null) => void)[],
    _modalListeners: [] as ((isOpen: boolean) => void)[],

    init() {
        const savedUser = localStorage.getItem('user');
        if (this._token && savedUser) {
            this._user = JSON.parse(savedUser);
        }
    },

    login(token: string, userData: User) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        this._token = token;
        this._user = userData;
        this._notifyListeners();
        this.closeLoginModal();
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this._token = null;
        this._user = null;
        this._notifyListeners();
        // Redirect to home if on a protected route
        if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
            window.location.href = '/';
        }
    },

    openLoginModal() {
        this._isLoginModalOpen = true;
        this._notifyModalListeners();
    },

    closeLoginModal() {
        this._isLoginModalOpen = false;
        this._notifyModalListeners();
    },

    subscribe(listener: (user: User | null, token: string | null) => void) {
        this._listeners.push(listener);
        listener(this._user, this._token); // Notify immediately
        return () => {
            this._listeners = this._listeners.filter(l => l !== listener);
        };
    },

    subscribeModal(listener: (isOpen: boolean) => void) {
        this._modalListeners.push(listener);
        listener(this._isLoginModalOpen); // Notify immediately
        return () => {
            this._modalListeners = this._modalListeners.filter(l => l !== listener);
        };
    },

    _notifyListeners() {
        this._listeners.forEach(listener => listener(this._user, this._token));
    },

    _notifyModalListeners() {
        this._modalListeners.forEach(listener => listener(this._isLoginModalOpen));
    },

    get user() { return this._user; },
    get token() { return this._token; },
    get isAuthenticated() { return !!this._user; },
    get isLoginModalOpen() { return this._isLoginModalOpen; }
};

authService.init(); // Initialize the service when the module loads

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    useEffect(() => {
        // Sync internal state with authService on mount
        const unsubscribe = authService.subscribe((u, t) => {
            setUser(u);
            setToken(t);
        });
        const unsubscribeModal = authService.subscribeModal((isOpen) => {
            setIsLoginModalOpen(isOpen);
        });
        return () => { unsubscribe(); unsubscribeModal(); };
    }, []);

    const contextValue = useMemo(() => ({
        user: user,
        token: token,
        login: authService.login.bind(authService),
        logout: authService.logout.bind(authService),
        isAuthenticated: !!user,
        isLoginModalOpen: isLoginModalOpen,
        openLoginModal: authService.openLoginModal.bind(authService),
        closeLoginModal: authService.closeLoginModal.bind(authService),
    }), [user, token, isLoginModalOpen]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
