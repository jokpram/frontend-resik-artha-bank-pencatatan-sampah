import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

import toast from 'react-hot-toast';

export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nama: '',
        email: '',
        password: '',
        no_hp: '',
        alamat: '',
        dusun: '',
        rt: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(formData);
            toast.success('Registrasi berhasil! Silakan login.');
            navigate('/login');
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Registrasi gagal.';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '4rem 1rem' }}>
            <div className="form-card" style={{ maxWidth: '500px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center' }}>Daftar Akun Baru</h2>

                {error && (
                    <div style={{ backgroundColor: '#FEE2E2', color: '#B91C1C', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Nama Lengkap</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.nama}
                            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Nomor HP</label>
                        <input
                            type="tel"
                            className="form-input"
                            value={formData.no_hp}
                            onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Dusun</label>
                        <select
                            className="form-input"
                            value={formData.dusun}
                            onChange={(e) => setFormData({ ...formData, dusun: e.target.value })}
                            required
                        >
                            <option value="">Pilih Dusun</option>
                            {[1, 2, 3, 4, 5].map(i => (
                                <option key={i} value={`Dusun ${i}`}>Dusun {i}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">RT</label>
                        <select
                            className="form-input"
                            value={formData.rt}
                            onChange={(e) => setFormData({ ...formData, rt: e.target.value })}
                            required
                        >
                            <option value="">Pilih RT</option>
                            {Array.from({ length: 20 }, (_, i) => i + 1).map(i => (
                                <option key={i} value={`RT ${i}`}>RT {i}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Alamat Lengkap (Jalan/Gang)</label>
                        <textarea
                            className="form-input"
                            value={formData.alamat}
                            onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                            rows={2}
                            placeholder="Contoh: Jl. Mawar No. 12"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
                        {loading ? 'Memproses...' : 'Daftar Sekarang'}
                    </button>
                </form>

                <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Sudah punya akun? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Masuk disini</Link>
                </p>
            </div>
        </div>
    );
}
