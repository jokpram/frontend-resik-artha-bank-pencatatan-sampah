import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardUser from './pages/DashboardUser';
import DashboardOfficer from './pages/DashboardOfficer';
import React from 'react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                <div style={{
                    width: '2rem', height: '2rem',
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid var(--primary)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;

    return <>{children}</>;
}

function Dashboard() {
    const { user } = useAuth();
    if (user?.role === 'officer') {
        return <DashboardOfficer />;
    }
    return <DashboardUser />;
}

import { Toaster, toast } from 'react-hot-toast';
import InstallPWA from './components/InstallPWA';

import { useEffect } from 'react';
import { initDB } from './utils/db';

export default function App() {
    useEffect(() => {
        // Initialize IndexedDB
        initDB().then(() => {
            console.log('IndexedDB initialized');
        });

        // Offline/Online handlers
        const handleOnline = () => toast.success('Kembali online!');
        const handleOffline = () => toast.error('Anda sedang offline. Aplikasi berjalan dalam mode offline.');

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <BrowserRouter>
            <AuthProvider>
                <Toaster position="top-right" />
                <InstallPWA />
                <Routes>
                    <Route element={<Layout />}>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } />
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}
