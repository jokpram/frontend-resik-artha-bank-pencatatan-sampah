import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import client from '../api/client';

interface User {
    id: string;
    role: 'user' | 'officer' | 'admin';
    email: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (data: any) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        try {
            const res = await client.get('/auth/me');
            // res.data.user contains the payload
            setUser(res.data.user);
        } catch (error) {
            setUser(null);
            sessionStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (data: any) => {
        const res = await client.post('/auth/login', data);
        if (res.data.token) {
            sessionStorage.setItem('token', res.data.token);
        }
        await checkAuth(); // Refresh user state
    };

    const register = async (data: any) => {
        await client.post('/auth/register', data);
        // Optionally auto-login or redirect
    };

    const logout = async () => {
        try {
            await client.post('/auth/logout');
        } finally {
            sessionStorage.removeItem('token');
            setUser(null);
            // Optional: window.location.href = '/'; 
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
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
