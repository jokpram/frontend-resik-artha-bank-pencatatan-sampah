import { useState, useEffect } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle, Users, List, Home, LayoutDashboard, FileText, Eye, Edit2, Wallet } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface WasteRecord {
    id_catat: string;
    berat: number;
    total_nilai: string;
    foto_url: string;
    status: 'MENUNGGU_VALIDASI' | 'TERVALIDASI' | 'DIBATALKAN';
    created_at: string;
    id_petugas: string | null;
    pengguna: {
        nama: string;
        email: string;
        dusun?: string;
        rt?: string;
        alamat?: string;
    };
    jenis_sampah: {
        id_jenis: string;
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
    pengguna: {
        nama: string;
        email: string;
        dusun?: string;
        rt?: string;
    };
}

interface UserData {
    id_pengguna: string;
    nama: string;
    email: string;
    no_hp: string;
    alamat: string;
    dusun: string;
    rt: string;
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

export default function DashboardOfficer() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [records, setRecords] = useState<WasteRecord[]>([]);
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [users, setUsers] = useState<UserData[]>([]);
    const [wasteStats, setWasteStats] = useState<WasteStat[]>([]);
    const [activeTab, setActiveTab] = useState('records');
    const [loading, setLoading] = useState(false);

    // Modals
    const [selectedRecord, setSelectedRecord] = useState<WasteRecord | null>(null);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);

    // Edit Form State
    const [editWeight, setEditWeight] = useState('');
    const [editType, setEditType] = useState('');
    const [wasteTypes, setWasteTypes] = useState<any[]>([]);

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isCancelOpen, setIsCancelOpen] = useState(false);
    const [actionMeta, setActionMeta] = useState<{ id: string, type: 'waste' | 'withdrawal' } | null>(null);
    const [cancelReason, setCancelReason] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [recRes, userRes, statRes, withRes, typeRes] = await Promise.all([
                client.get('/waste'),
                client.get('/users'),
                client.get('/waste/stats'),
                client.get('/withdrawals'),
                client.get('/waste/types')
            ]);
            setRecords(recRes.data);
            setUsers(userRes.data);
            setWasteStats(statRes.data);
            setWithdrawals(withRes.data);
            setWasteTypes(typeRes.data);
        } catch (e) {
            console.error(e);
            toast.error('Gagal memuat data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleValidate = (id: string, type: 'waste' | 'withdrawal') => {
        setActionMeta({ id, type });
        setIsConfirmOpen(true);
    };

    const executeValidate = async () => {
        if (!actionMeta) return;
        try {
            const endpoint = actionMeta.type === 'waste' ? `/waste/${actionMeta.id}/validate` : `/withdrawals/${actionMeta.id}/validate`;
            await client.patch(endpoint);
            toast.success('Berhasil divalidasi');
            fetchData();
            setIsConfirmOpen(false);
        } catch (e: any) {
            toast.error(e.response?.data?.message || 'Gagal memvalidasi');
        }
    };

    const handleCancel = (id: string, type: 'waste' | 'withdrawal') => {
        setActionMeta({ id, type });
        setCancelReason('');
        setIsCancelOpen(true);
    };

    const executeCancel = async () => {
        if (!actionMeta || !cancelReason) return;
        try {
            const endpoint = actionMeta.type === 'waste' ? `/waste/${actionMeta.id}/cancel` : `/withdrawals/${actionMeta.id}/cancel`;
            await client.patch(endpoint, { keterangan: cancelReason });
            toast.success('Berhasil dibatalkan');
            fetchData();
            setIsCancelOpen(false);
        } catch (e: any) {
            toast.error(e.response?.data?.message || 'Gagal membatalkan');
        }
    };

    const handleDownloadPDF = async () => {
        try {
            const response = await client.get('/reports/pdf', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'laporan_setoran.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (e) {
            toast.error('Gagal mengunduh PDF');
        }
    };

    const handleDownloadWithdrawalPDF = async () => {
        try {
            const response = await client.get('/reports/withdrawals-pdf', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'laporan_penarikan.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (e) {
            toast.error('Gagal mengunduh PDF');
        }
    };

    const openEdit = (record: WasteRecord) => {
        setSelectedRecord(record);
        setEditWeight(record.berat.toString());
        setEditType(record.jenis_sampah.id_jenis);
        setIsEditOpen(true);
    };

    const handleUpdateRecord = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRecord) return;
        try {
            const formData = new FormData();
            formData.append('berat', editWeight);
            formData.append('id_jenis', editType);

            await client.put(`/waste/${selectedRecord.id_catat}`, formData);
            toast.success('Catatan diperbarui');
            setIsEditOpen(false);
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Gagal memperbarui');
        }
    };

    const menuItems = [
        { id: 'home', icon: Home, label: 'Beranda' },
        { id: 'stats', icon: LayoutDashboard, label: 'Statistik' },
        { id: 'records', icon: List, label: 'Catatan Sampah' },
        { id: 'withdrawals', icon: Wallet, label: 'Penarikan Saldo' },
        { id: 'users', icon: Users, label: 'Data Nasabah' },
    ];

    const getStatusBadge = (status: string) => {
        let color = '#D97706';
        let bg = '#FEF3C7';
        if (status === 'TERVALIDASI' || status === 'BERHASIL') {
            color = '#059669';
            bg = '#ECFDF5';
        } else if (status === 'DIBATALKAN') {
            color = '#DC2626';
            bg = '#FEF2F2';
        }
        return (
            <span style={{
                background: bg, color: color, padding: '0.25rem 0.75rem',
                borderRadius: '999px', fontSize: '0.75rem', fontWeight: 'bold'
            }}>
                {status.replace('_', ' ')}
            </span>
        );
    };

    return (
        <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
            <Sidebar menuItems={menuItems} activeTab={activeTab} setActiveTab={(id) => id === 'home' ? navigate('/') : setActiveTab(id)} title="Menu Petugas" />

            <div style={{ flex: 1, padding: '2rem', background: '#F8FAFC', position: 'relative' }}>
                <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Dashboard Petugas</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Halo, {user?.email}.</p>
                    </div>
                </header>

                {loading && <div className="spinner"></div>}

                {/* Records Tab */}
                {!loading && activeTab === 'records' && (
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h2>Catatan Sampah</h2>
                            <button onClick={handleDownloadPDF} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#DC2626', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
                                <FileText size={16} /> Unduh Laporan PDF
                            </button>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#F3F4F6' }}>
                                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Tanggal</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Nasabah</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Lokasi</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Sampah</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Berat</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Nilai</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Status</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'center' }}>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map(r => (
                                        <tr key={r.id_catat} style={{ borderBottom: '1px solid #E5E7EB' }}>
                                            <td style={{ padding: '0.75rem' }}>{new Date(r.created_at).toLocaleString('id-ID')}</td>
                                            <td style={{ padding: '0.75rem' }}>{r.pengguna?.nama}</td>
                                            <td style={{ padding: '0.75rem' }}>
                                                {r.pengguna?.dusun ? `${r.pengguna.dusun}, ${r.pengguna.rt}` : '-'}
                                            </td>
                                            <td style={{ padding: '0.75rem' }}>{r.jenis_sampah?.nama_jenis}</td>
                                            <td style={{ padding: '0.75rem' }}>{r.berat} kg</td>
                                            <td style={{ padding: '0.75rem' }}>Rp {parseFloat(r.total_nilai).toLocaleString()}</td>
                                            <td style={{ padding: '0.75rem' }}>{getStatusBadge(r.status)}</td>
                                            <td style={{ padding: '0.75rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                <button onClick={() => { setSelectedRecord(r); setIsDetailOpen(true); }} title="Detail Transaksi" style={{ color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer' }}><Eye size={18} /></button>
                                                {r.status === 'MENUNGGU_VALIDASI' && (
                                                    <>
                                                        <button onClick={() => openEdit(r)} title="Edit" style={{ color: '#D97706', background: 'none', border: 'none', cursor: 'pointer' }}><Edit2 size={18} /></button>
                                                        <button onClick={() => handleValidate(r.id_catat, 'waste')} title="Validasi" style={{ color: '#059669', background: 'none', border: 'none', cursor: 'pointer' }}><CheckCircle size={18} /></button>
                                                        <button onClick={() => handleCancel(r.id_catat, 'waste')} title="Batalkan" style={{ color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer' }}><XCircle size={18} /></button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Withdrawals Tab */}
                {!loading && activeTab === 'withdrawals' && (
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h2>Permintaan Penarikan Saldo</h2>
                            <button onClick={handleDownloadWithdrawalPDF} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#DC2626', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>
                                <FileText size={16} /> Unduh Laporan PDF
                            </button>
                        </div>
                        <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#F3F4F6' }}>
                                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Tanggal</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Nasabah</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Lokasi</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Jumlah</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Status</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'center' }}>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {withdrawals.map(w => (
                                        <tr key={w.id_penarikan} style={{ borderBottom: '1px solid #E5E7EB' }}>
                                            <td style={{ padding: '0.75rem' }}>{new Date(w.created_at).toLocaleString('id-ID')}</td>
                                            <td style={{ padding: '0.75rem' }}>{w.pengguna?.nama}</td>
                                            <td style={{ padding: '0.75rem' }}>
                                                {w.pengguna?.dusun ? `${w.pengguna?.dusun}, ${w.pengguna?.rt}` : '-'}
                                            </td>
                                            <td style={{ padding: '0.75rem' }}>Rp {parseFloat(w.jumlah).toLocaleString()}</td>
                                            <td style={{ padding: '0.75rem' }}>{getStatusBadge(w.status)}</td>
                                            <td style={{ padding: '0.75rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                {w.status === 'MENUNGGU_VALIDASI' && (
                                                    <>
                                                        <button onClick={() => handleValidate(w.id_penarikan, 'withdrawal')} title="Validasi" style={{ color: '#059669', background: 'none', border: 'none', cursor: 'pointer' }}><CheckCircle size={18} /></button>
                                                        <button onClick={() => handleCancel(w.id_penarikan, 'withdrawal')} title="Batalkan" style={{ color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer' }}><XCircle size={18} /></button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {!loading && activeTab === 'users' && (
                    <div className="card">
                        <h2>Data Nasabah</h2>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                            <thead>
                                <tr style={{ background: '#F3F4F6' }}>
                                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Nama</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Dusun/RT</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>Saldo</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id_pengguna} style={{ borderBottom: '1px solid #E5E7EB' }}>
                                        <td style={{ padding: '0.75rem' }}>
                                            <div style={{ fontWeight: '500' }}>{u.nama}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
                                        </td>
                                        <td style={{ padding: '0.75rem' }}>
                                            {u.dusun ? `${u.dusun}, ${u.rt}` : '-'}
                                        </td>
                                        <td style={{ padding: '0.75rem' }}>Rp {parseFloat(u.saldo || '0').toLocaleString()}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                            <button
                                                onClick={() => { setSelectedUser(u); setIsUserDetailOpen(true); }}
                                                style={{ background: '#EFF6FF', color: '#2563EB', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                                            >
                                                Lihat Profil
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Stats Tab (Simplified) */}
                {!loading && activeTab === 'stats' && (
                    <div className="card">
                        <h2>Statistik</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                            {wasteStats.map(s => (
                                <div key={s.id_jenis} style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '8px' }}>
                                    <h3>{s.jenis_sampah.nama_jenis}</h3>
                                    <p>Total: {s.total_berat} {s.jenis_sampah.satuan}</p>
                                    <p style={{ color: 'green', fontWeight: 'bold' }}>Rp {parseFloat(s.total_nilai).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Waste Detail Modal */}
            {isDetailOpen && selectedRecord && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2>Detail Setoran</h2>
                        <img src={`${import.meta.env.VITE_API_BASE_URL?.replace('/api', '')}/uploads/${selectedRecord.foto_url}`} alt="Bukti" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', margin: '1rem 0', borderRadius: '8px' }} onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/300?text=No+Image')} />
                        <p><strong>Nasabah:</strong> {selectedRecord.pengguna?.nama} ({selectedRecord.pengguna?.email})</p>
                        <p><strong>Lokasi:</strong> {selectedRecord.pengguna?.dusun || '-'}, {selectedRecord.pengguna?.rt || '-'}</p>
                        <p><strong>Alamat:</strong> {selectedRecord.pengguna?.alamat || '-'}</p>
                        <p><strong>Jenis:</strong> {selectedRecord.jenis_sampah?.nama_jenis}</p>
                        <p><strong>Berat:</strong> {selectedRecord.berat} kg</p>
                        <p><strong>Nilai:</strong> Rp {parseFloat(selectedRecord.total_nilai).toLocaleString()}</p>
                        <p><strong>Status:</strong> {selectedRecord.status}</p>
                        <button onClick={() => setIsDetailOpen(false)} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#374151', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Tutup</button>
                    </div>
                </div>
            )}

            {/* User Profile Modal */}
            {isUserDetailOpen && selectedUser && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '500px', width: '90%' }}>
                        <h2>Profil Nasabah Lengkap</h2>
                        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <p><strong>Nama:</strong> {selectedUser.nama}</p>
                            <p><strong>Email:</strong> {selectedUser.email}</p>
                            <p><strong>No. HP:</strong> {selectedUser.no_hp}</p>
                            <p><strong>Dusun:</strong> {selectedUser.dusun || '-'}</p>
                            <p><strong>RT:</strong> {selectedUser.rt || '-'}</p>
                            <p><strong>Alamat Lengkap:</strong> {selectedUser.alamat || '-'}</p>
                            <hr style={{ margin: '1rem 0', borderTop: '1px solid #eee' }} />
                            <p><strong>Total Sampah:</strong> {selectedUser.total_berat} Kg</p>
                            <p><strong>Total Pendapatan:</strong> Rp {parseFloat(selectedUser.total_nilai).toLocaleString()}</p>
                            <p><strong>Saldo Saat Ini:</strong> Rp {parseFloat(selectedUser.saldo).toLocaleString()}</p>
                        </div>
                        <button onClick={() => setIsUserDetailOpen(false)} style={{ marginTop: '1.5rem', padding: '0.5rem 1rem', background: '#374151', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}>Tutup</button>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {isConfirmOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '400px', width: '90%' }}>
                        <h3>Konfirmasi Validasi</h3>
                        <p style={{ margin: '1rem 0', color: '#4B5563' }}>Apakah Anda yakin ingin memvalidasi permintaan ini?</p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => setIsConfirmOpen(false)} style={{ padding: '0.5rem 1rem', background: '#E5E7EB', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Batal</button>
                            <button onClick={executeValidate} style={{ padding: '0.5rem 1rem', background: '#059669', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Ya, Validasi</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Reason Modal */}
            {isCancelOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '400px', width: '90%' }}>
                        <h3>Pembatalan</h3>
                        <p style={{ margin: '1rem 0 0.5rem', color: '#4B5563' }}>Masukkan alasan pembatalan:</p>
                        <input
                            type="text"
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Contoh: Berat tidak sesuai"
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #D1D5DB', borderRadius: '4px', marginBottom: '1.5rem' }}
                        />
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => setIsCancelOpen(false)} style={{ padding: '0.5rem 1rem', background: '#E5E7EB', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Batal</button>
                            <button
                                onClick={executeCancel}
                                disabled={!cancelReason}
                                style={{ padding: '0.5rem 1rem', background: '#DC2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: !cancelReason ? 0.5 : 1 }}
                            >
                                Batalkan Permintaan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditOpen && selectedRecord && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '400px', width: '90%' }}>
                        <h2>Edit Setoran</h2>
                        <form onSubmit={handleUpdateRecord}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label>Jenis Sampah</label>
                                <select value={editType} onChange={e => setEditType(e.target.value)} style={{ width: '100%', padding: '0.5rem' }}>
                                    {wasteTypes.map(t => (
                                        <option key={t.id_jenis} value={t.id_jenis}>{t.nama_jenis} ({t.nilai_per_unit}/kg)</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label>Berat (kg)</label>
                                <input type="number" step="0.1" value={editWeight} onChange={e => setEditWeight(e.target.value)} style={{ width: '100%', padding: '0.5rem' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setIsEditOpen(false)} style={{ padding: '0.5rem 1rem', background: '#ccc', border: 'none', borderRadius: '4px' }}>Batal</button>
                                <button type="submit" style={{ padding: '0.5rem 1rem', background: '#059669', color: 'white', border: 'none', borderRadius: '4px' }}>Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
