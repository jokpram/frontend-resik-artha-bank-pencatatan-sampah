import { useState, useEffect } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, XCircle, History, Upload, User as UserIcon, Wallet, Weight, Home, LayoutDashboard, ArrowUpFromLine } from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';

interface WasteType {
    id_jenis: string;
    nama_jenis: string;
    satuan: string;
    nilai_per_unit: string;
}

interface WasteRecord {
    id_catat: string;
    berat: number;
    total_nilai: string;
    foto_url: string;
    status: 'MENUNGGU_VALIDASI' | 'TERVALIDASI' | 'DIBATALKAN';
    created_at: string;
    jenis_sampah: {
        nama_jenis: string;
        satuan: string;
        nilai_per_unit: string;
    };
}

interface Withdrawal {
    id_penarikan: string;
    jumlah: string;
    status: 'MENUNGGU_VALIDASI' | 'BERHASIL' | 'DIBATALKAN';
    created_at: string;
}

interface UserProfile {
    nama: string;
    email: string; // added
    alamat: string;
    no_hp: string;
    dusun: string; // added
    rt: string; // added
    total_berat: number;
    total_nilai: string;
    saldo: string;
}

interface WasteStat {
    id_jenis: string;
    total_berat: string;
    total_nilai: string;
    jenis_sampah: {
        nama_jenis: string;
        satuan: string;
    };
}

export default function DashboardUser() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [types, setTypes] = useState<WasteType[]>([]);
    const [records, setRecords] = useState<WasteRecord[]>([]);
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [wasteStats, setWasteStats] = useState<WasteStat[]>([]);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(false);

    // Form State
    const [items, setItems] = useState<{ id_jenis: string, berat: string }[]>([{ id_jenis: '', berat: '' }]);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [message, setMessage] = useState('');

    const addItem = () => {
        setItems([...items, { id_jenis: '', berat: '' }]);
    };

    const removeItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const updateItem = (index: number, field: 'id_jenis' | 'berat', value: string) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => {
            const type = types.find(t => t.id_jenis === item.id_jenis);
            const val = type ? parseFloat(type.nilai_per_unit) : 0;
            const w = parseFloat(item.berat) || 0;
            return sum + (val * w);
        }, 0);
    };

    // Withdrawal Form State
    const [withdrawAmount, setWithdrawAmount] = useState('');

    // Profile Form State
    const [pNama, setPNama] = useState('');
    const [pEmail, setPEmail] = useState('');
    const [pAlamat, setPAlamat] = useState('');
    const [pNoHp, setPNoHp] = useState('');
    const [pDusun, setPDusun] = useState('');
    const [pRt, setPRt] = useState('');
    const [pMsg, setPMsg] = useState('');

    const fetchData = async () => {
        try {
            const [typeRes, recRes, profRes, statRes, withRes] = await Promise.all([
                client.get('/waste/types'),
                client.get('/waste'),
                client.get('/users/profile'),
                client.get('/waste/stats'),
                client.get('/withdrawals')
            ]);
            setTypes(typeRes.data);
            setRecords(recRes.data);

            setProfile(profRes.data);
            // Sync form state
            setPNama(profRes.data.nama || '');
            setPEmail(profRes.data.email || '');
            setPAlamat(profRes.data.alamat || '');
            setPNoHp(profRes.data.no_hp || '');
            setPDusun(profRes.data.dusun || '');
            setPRt(profRes.data.rt || '');

            setWasteStats(statRes.data);
            setWithdrawals(withRes.data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const f = e.target.files[0];
            setFile(f);
            setPreview(URL.createObjectURL(f));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        const validItems = items.filter(i => i.id_jenis && i.berat);

        if (!file || validItems.length === 0) {
            setMessage('Mohon lengkapi data dan foto bukti');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('items', JSON.stringify(validItems));
        formData.append('foto', file);

        try {
            await client.post('/waste', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Sampah berhasil dicatat!');
            setFile(null);
            setPreview(null);
            setItems([{ id_jenis: '', berat: '' }]);
            fetchData();
            setActiveTab('history');
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Gagal mencatat sampah';
            setMessage(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await client.post('/withdrawals', { jumlah: withdrawAmount });
            toast.success('Permintaan penarikan dikirim');
            setWithdrawAmount('');
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Gagal mengirim permintaan');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await client.put('/users/profile', {
                nama: pNama,
                email: pEmail,
                alamat: pAlamat,
                no_hp: pNoHp,
                dusun: pDusun,
                rt: pRt
            });
            toast.success('Profil berhasil diperbarui');
            setPMsg('Profil berhasil diperbarui');
            fetchData();
        } catch (err: any) {
            toast.error('Gagal memperbarui profil');
            setPMsg('Gagal memperbarui profil');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleTabChange = (id: string) => {
        if (id === 'home') {
            navigate('/');
        } else {
            setActiveTab(id);
        }
    };

    const menuItems = [
        { id: 'home', icon: Home, label: 'Beranda' },
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'record', icon: PlusCircle, label: 'Setor Sampah' },
        { id: 'withdraw', icon: ArrowUpFromLine, label: 'Penarikan' },
        { id: 'history', icon: History, label: 'Riwayat' },
        { id: 'profile', icon: UserIcon, label: 'Profil' }
    ];

    const getStatusParams = (status: string) => {
        if (status === 'TERVALIDASI' || status === 'BERHASIL') return { bg: '#ECFDF5', color: '#047857', label: 'SUKSES' };
        if (status === 'DIBATALKAN') return { bg: '#FEF2F2', color: '#B91C1C', label: 'BATAL' };
        return { bg: '#FEF3C7', color: '#D97706', label: 'PROSES' };
    };

    return (
        <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
            <Sidebar menuItems={menuItems} activeTab={activeTab} setActiveTab={handleTabChange} />

            <div style={{ flex: 1, padding: '2rem', background: '#F8FAFC' }}>
                <header style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Dashboard Nasabah</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Hai, {profile?.nama || user?.email}. Selamat datang kembali!</p>
                </header>

                {activeTab === 'dashboard' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ padding: '0.75rem', background: '#ECFDF5', borderRadius: '50%', color: '#059669' }}>
                                    <Wallet size={24} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Saldo Saat Ini</p>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>
                                        Rp {parseFloat(profile?.saldo || '0').toLocaleString('id-ID')}
                                    </p>
                                    {records.some(r => r.status === 'MENUNGGU_VALIDASI') && (
                                        <p style={{ fontSize: '0.75rem', color: '#D97706', marginTop: '0.25rem' }}>
                                            + Rp {records.filter(r => r.status === 'MENUNGGU_VALIDASI').reduce((sum, r) => sum + parseFloat(r.total_nilai), 0).toLocaleString('id-ID')} (Menunggu Validasi)
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ padding: '0.75rem', background: '#EFF6FF', borderRadius: '50%', color: '#2563EB' }}>
                                    <Weight size={24} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Berat Sampah</p>
                                    <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2563EB' }}>
                                        {profile?.total_berat || 0} Kg
                                    </p>
                                    {records.some(r => r.status === 'MENUNGGU_VALIDASI') && (
                                        <p style={{ fontSize: '0.75rem', color: '#D97706', marginTop: '0.25rem' }}>
                                            + {records.filter(r => r.status === 'MENUNGGU_VALIDASI').reduce((sum, r) => sum + parseFloat(r.berat.toString()), 0).toFixed(1)} Kg (Menunggu)
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Statistik Jenis Sampah</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                                {wasteStats.map(stat => (
                                    <div key={stat.id_jenis} style={{ padding: '1rem', border: '1px solid #E5E7EB', borderRadius: '0.5rem', background: '#FAFAFA' }}>
                                        <p style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '0.5rem' }}>{stat.jenis_sampah.nama_jenis}</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                                            <span style={{ color: '#6B7280' }}>Berat:</span>
                                            <span style={{ fontWeight: '600' }}>{parseFloat(stat.total_berat).toLocaleString('id-ID')} {stat.jenis_sampah.satuan}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                            <span style={{ color: '#6B7280' }}>Nilai:</span>
                                            <span style={{ fontWeight: '600', color: '#059669' }}>Rp {parseFloat(stat.total_nilai).toLocaleString('id-ID')}</span>
                                        </div>
                                    </div>
                                ))}
                                {/* If no stats yet, but we have pending records, show them as 'In Progress' stats maybe? or just keep the empty message */}
                                {wasteStats.length === 0 && records.length > 0 && (
                                    <p style={{ color: '#D97706', fontStyle: 'italic' }}>
                                        Menunggu validasi {records.filter(r => r.status === 'MENUNGGU_VALIDASI').length} setoran untuk masuk ke statistik.
                                    </p>
                                )}
                                {wasteStats.length === 0 && records.length === 0 && <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Belum ada data setoran.</p>}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'withdraw' && (
                    <div className="form-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Penarikan Saldo</h2>
                        <div style={{ textAlign: 'center', marginBottom: '2rem', padding: '1rem', background: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
                            <p>Saldo Tersedia</p>
                            <h1 style={{ color: '#166534', fontSize: '2rem', fontWeight: 'bold' }}>Rp {parseFloat(profile?.saldo || '0').toLocaleString('id-ID')}</h1>
                        </div>
                        <form onSubmit={handleWithdraw}>
                            <div className="form-group">
                                <label className="form-label">Jumlah Penarikan (Rp)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    placeholder="Contoh: 50000"
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                                {loading ? 'Memproses...' : 'Ajukan Penarikan'}
                            </button>
                        </form>

                        <div style={{ marginTop: '3rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem' }}>Riwayat Penarikan</h3>
                            {withdrawals.length === 0 ? <p style={{ color: '#6B7280' }}>Belum ada riwayat.</p> : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {withdrawals.map(w => {
                                        const status = getStatusParams(w.status);
                                        return (
                                            <div key={w.id_penarikan} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'white', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                                                <div>
                                                    <p style={{ fontWeight: 'bold' }}>Rp {parseFloat(w.jumlah).toLocaleString('id-ID')}</p>
                                                    <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>{new Date(w.created_at).toLocaleString('id-ID')}</p>
                                                </div>
                                                <div>
                                                    <span style={{ background: status.bg, color: status.color, padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>{status.label}</span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                        {/* Profile Preview Card */}
                        <div className="card" style={{ height: 'fit-content' }}>
                            <div style={{ textAlign: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #E5E7EB' }}>
                                <div style={{ width: '80px', height: '80px', background: '#DBEAFE', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#2563EB' }}>
                                    <UserIcon size={40} />
                                </div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{profile?.nama}</h2>
                                <p style={{ color: 'var(--text-muted)' }}>Nasabah</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email</p>
                                    <p style={{ fontWeight: '500' }}>{profile?.email || '-'}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nomor HP</p>
                                    <p style={{ fontWeight: '500' }}>{profile?.no_hp || '-'}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Lokasi</p>
                                    <p style={{ fontWeight: '500' }}>{profile?.dusun || '-'}, {profile?.rt || '-'}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Alamat Lengkap</p>
                                    <p style={{ fontWeight: '500' }}>{profile?.alamat || '-'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Edit Form */}
                        <div className="form-card">
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Edit Data Profil</h2>
                            {pMsg && <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#EFF6FF', color: '#1E40AF', borderRadius: '0.5rem' }}>{pMsg}</div>}
                            <form onSubmit={handleProfileUpdate}>
                                <div className="form-group">
                                    <label className="form-label">Nama Lengkap</label>
                                    <input type="text" className="form-input" value={pNama} onChange={(e) => setPNama(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input type="email" className="form-input" value={pEmail} onChange={(e) => setPEmail(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Nomor HP</label>
                                    <input type="text" className="form-input" value={pNoHp} onChange={(e) => setPNoHp(e.target.value)} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label className="form-label">Dusun</label>
                                        <select
                                            className="form-input"
                                            value={pDusun}
                                            onChange={(e) => setPDusun(e.target.value)}
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
                                            value={pRt}
                                            onChange={(e) => setPRt(e.target.value)}
                                        >
                                            <option value="">Pilih RT</option>
                                            {Array.from({ length: 20 }, (_, i) => i + 1).map(i => (
                                                <option key={i} value={`RT ${i}`}>RT {i}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Alamat Lengkap</label>
                                    <textarea className="form-input" rows={3} value={pAlamat} onChange={(e) => setPAlamat(e.target.value)} />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                                    {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {activeTab === 'record' && (
                    <div className="form-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Form Setor Sampah</h2>
                        {message && <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#ECFDF5', color: '#047857', borderRadius: '0.5rem' }}>{message}</div>}

                        <form onSubmit={handleSubmit}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem' }}>Identitas Sampah</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {items.map((item, index) => (
                                    <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', padding: '1rem', background: '#F9FAFB', borderRadius: '0.5rem', border: '1px solid #E5E7EB' }}>
                                        <div style={{ flex: 1 }}>
                                            <label className="form-label" style={{ fontSize: '0.8rem' }}>Jenis</label>
                                            <select
                                                className="form-input"
                                                value={item.id_jenis}
                                                onChange={(e) => updateItem(index, 'id_jenis', e.target.value)}
                                                required
                                            >
                                                <option value="">Pilih Jenis</option>
                                                {types.map(t => (
                                                    <option key={t.id_jenis} value={t.id_jenis}>{t.nama_jenis} (Rp {t.nilai_per_unit}/{t.satuan})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div style={{ width: '100px' }}>
                                            <label className="form-label" style={{ fontSize: '0.8rem' }}>Berat (Kg)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                className="form-input"
                                                value={item.berat}
                                                onChange={(e) => updateItem(index, 'berat', e.target.value)}
                                                required
                                                placeholder="0.0"
                                            />
                                        </div>
                                        {items.length > 1 && (
                                            <button type="button" onClick={() => removeItem(index)} style={{ marginTop: '1.7rem', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                <XCircle size={20} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button type="button" onClick={addItem} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', background: 'none', border: 'none', color: '#2563EB', cursor: 'pointer', fontWeight: '500' }}>
                                <PlusCircle size={18} /> Tambah Jenis Lain
                            </button>

                            <div className="form-group" style={{ marginTop: '1.5rem' }}>
                                <label className="form-label">Foto Bukti (Semua item)</label>
                                <div
                                    style={{
                                        border: '2px dashed var(--border)',
                                        borderRadius: 'var(--radius)',
                                        padding: '2rem',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        backgroundColor: '#F9FAFB'
                                    }}
                                    onClick={() => document.getElementById('file-upload')?.click()}
                                >
                                    {preview ? (
                                        <img src={preview} alt="Preview" style={{ maxHeight: '200px', margin: '0 auto', borderRadius: '0.5rem' }} />
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                                            <Upload size={32} />
                                            <span>Klik untuk upload foto</span>
                                        </div>
                                    )}
                                    <input
                                        id="file-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginTop: '1rem', padding: '1rem', background: '#F3F4F6', borderRadius: '0.5rem' }}>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Estimasi Total Nilai:</p>
                                <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                                    Rp {calculateTotal().toLocaleString('id-ID')}
                                </p>
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
                                {loading ? 'Mengirim...' : 'Kirim Setoran'}
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="records-grid">
                        {records.length === 0 ? (
                            <p style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Belum ada riwayat setoran.</p>
                        ) : (
                            records.map(record => {
                                const status = getStatusParams(record.status);
                                return (
                                    <div key={record.id_catat} className="card">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <span style={{
                                                background: status.bg,
                                                color: status.color,
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '999px',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold'
                                            }}>
                                                {status.label}
                                            </span>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                {new Date(record.created_at).toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <div style={{ width: '4rem', height: '4rem', background: '#f3f4f6', borderRadius: '0.5rem', overflow: 'hidden' }}>
                                                <img
                                                    src={`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '')}/uploads/${record.foto_url}`}
                                                    alt="Foto"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    onError={(e) => { (e.target as HTMLImageElement).style.backgroundColor = '#ccc' }}
                                                />
                                            </div>
                                            <div>
                                                <h3 style={{ fontWeight: 'bold' }}>{record.jenis_sampah?.nama_jenis || 'Sampah'}</h3>
                                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{record.berat} Kg x {record.jenis_sampah?.nilai_per_unit || 0}</p>
                                                <p style={{ fontWeight: 'bold', color: 'var(--primary)', marginTop: '0.25rem' }}>Rp {parseFloat(record.total_nilai).toLocaleString('id-ID')}</p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
