import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Menu, X, Leaf } from 'lucide-react';
import { useState } from 'react';

import toast from 'react-hot-toast';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        toast((t) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '200px' }}>
                <span style={{ fontWeight: '600' }}>Anda yakin mau logout?</span>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        style={{ padding: '0.25rem 0.75rem', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer' }}
                    >
                        Batal
                    </button>
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            await logout();
                            toast.success('Logout berhasil');
                            navigate('/login');
                        }}
                        style={{ padding: '0.25rem 0.75rem', border: 'none', borderRadius: '4px', background: '#DC2626', color: 'white', cursor: 'pointer' }}
                    >
                        Ya, Logout
                    </button>
                </div>
            </div>
        ), { duration: 5000 });
    };

    return (
        <nav className="navbar">
            <div className="container navbar-content">
                <Link to="/" className="brand">
                    <Leaf size={28} />
                    <span>Resik Artha</span>
                </Link>

                {/* Always show Mobile/Menu Toggle now as per request to hide items in hamburger */}
                <button className="mobile-toggle" style={{ display: 'block' }} onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Menu Content */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '72px', // Match new navbar height
                    left: 0,
                    right: 0,
                    background: 'white',
                    padding: '1.5rem',
                    borderBottom: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-lg)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    zIndex: 1000
                }} className="mobile-menu">
                    <Link to="/" onClick={() => setIsOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
                        Beranda
                    </Link>

                    {user ? (
                        <>
                            <Link to="/dashboard" onClick={() => setIsOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>
                                Dashboard
                            </Link>
                            <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                                    <UserIcon size={16} />
                                    <span>{user.email}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        textAlign: 'left',
                                        color: '#EF4444',
                                        background: 'none',
                                        border: 'none',
                                        padding: 0,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        fontWeight: '600'
                                    }}
                                >
                                    <LogOut size={16} /> Keluar
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                            <Link to="/login" onClick={() => setIsOpen(false)} className="btn btn-outline" style={{ justifyContent: 'center' }}>
                                Masuk
                            </Link>
                            <Link to="/register" onClick={() => setIsOpen(false)} className="btn btn-primary" style={{ justifyContent: 'center' }}>
                                Daftar
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
}
