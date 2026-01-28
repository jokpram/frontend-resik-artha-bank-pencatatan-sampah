import { useState, useEffect } from 'react';
import client from '../api/client';
import { Award } from 'lucide-react';

interface LeaderboardUser {
    nama: string;
    total_berat: number;
    total_nilai: string;
}

export default function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await client.get('/users/leaderboard');
                setLeaderboard(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchLeaderboard();
    }, []);

    return (
        <section style={{ padding: '6rem 0', background: 'linear-gradient(to bottom, #ffffff, #F0FDFA)' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div className="feature-icon" style={{ margin: '0 auto 1.5rem', width: '80px', height: '80px', fontSize: '2rem' }}>
                        <Award size={40} />
                    </div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-main)' }}>Pahlawan Lingkungan</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>Mereka yang paling berkontribusi dalam menjaga kebersihan lingkungan.</p>
                </div>

                <div className="card" style={{ maxWidth: '900px', margin: '0 auto', overflow: 'hidden', padding: 0, border: 'none', boxShadow: 'var(--shadow-lg)' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '1rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', background: '#F9FAFB' }}>
                                    <th style={{ padding: '1.25rem', fontWeight: '700', color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rank</th>
                                    <th style={{ padding: '1.25rem', fontWeight: '700', color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nama</th>
                                    <th style={{ padding: '1.25rem', fontWeight: '700', color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Sampah</th>
                                    <th style={{ padding: '1.25rem', fontWeight: '700', color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Poin</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.map((u, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#F0FDFA'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                                        <td style={{ padding: '1.25rem', fontWeight: 'bold', width: '80px', textAlign: 'center', fontSize: '1.25rem' }}>
                                            {index + 1 === 1 ? '🥇' : index + 1 === 2 ? '🥈' : index + 1 === 3 ? '🥉' : index + 1}
                                        </td>
                                        <td style={{ padding: '1.25rem' }}>
                                            <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{u.nama || 'Pengguna'}</div>
                                        </td>
                                        <td style={{ padding: '1.25rem' }}>
                                            <span style={{
                                                background: '#EFF6FF',
                                                color: '#2563EB',
                                                padding: '0.35rem 1rem',
                                                borderRadius: '999px',
                                                fontSize: '0.875rem',
                                                fontWeight: '600'
                                            }}>
                                                {u.total_berat || 0} Kg
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.25rem', fontWeight: '700', color: 'var(--primary)', fontSize: '1.1rem' }}>
                                            Rp {parseFloat(u.total_nilai || '0').toLocaleString('id-ID')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );
}
