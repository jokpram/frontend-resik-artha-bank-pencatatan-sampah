import { Link } from 'react-router-dom';
import { Recycle, Truck, Coins, ArrowRight, ShieldCheck } from 'lucide-react';
import Leaderboard from '../components/Leaderboard';

export default function LandingPage() {
    return (
        <div>
            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
                        <div style={{
                            background: 'var(--primary-light)',
                            padding: '1.5rem',
                            borderRadius: '1.5rem',
                            marginBottom: '2rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 0 0 8px rgba(209, 250, 229, 0.4)'
                        }}>
                            <Recycle size={64} color="var(--primary)" />
                        </div>
                    </div>

                    <h1 className="hero-title">
                        Ubah Masalah Menjadi <span className="text-gradient">Cuan</span>
                    </h1>
                    <p className="hero-subtitle">
                        Resik Artha membantu Anda mengelola sampah rumah tangga menjadi sumber penghasilan tambahan.
                        Bersih lingkungannya, tebal dompetnya.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/register" className="btn btn-primary btn-lg">
                            Mulai Sekarang <ArrowRight size={20} />
                        </Link>
                        <Link to="/login" className="btn btn-outline btn-lg">
                            Masuk Akun
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section style={{ background: '#fff' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-main)' }}>Mengapa Resik Artha?</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>Solusi pengelolaan sampah modern yang menguntungkan semua pihak.</p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">
                                <Recycle size={32} />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>Daur Ulang Mudah</h3>
                            <p style={{ color: 'var(--text-muted)' }}>
                                Tidak perlu repot memilah yang rumit. Kami bantu proses pengelompokan sampah Anda secara efisien.
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <Truck size={32} />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>Penjemputan Cepat</h3>
                            <p style={{ color: 'var(--text-muted)' }}>
                                Tim kami siap menjemput sampah daur ulang langsung ke lokasi Anda dengan jadwal fleksibel.
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <Coins size={32} />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>Harga Kompetitif</h3>
                            <p style={{ color: 'var(--text-muted)' }}>
                                Dapatkan harga terbaik untuk setiap kilogram sampah yang Anda setorkan. Transparan & Langsung Cair.
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <ShieldCheck size={32} />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>Terpercaya</h3>
                            <p style={{ color: 'var(--text-muted)' }}>
                                Telah melayani ribuan nasabah dan bekerja sama dengan mitra daur ulang bersertifikasi.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Leaderboard Section */}
            <Leaderboard />

            {/* FAQ Section */}
            <section style={{ padding: '6rem 0' }}>
                <div className="container">
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '3rem', textAlign: 'center', color: 'var(--text-main)' }}>Pertanyaan Umum</h2>
                    <div className="faq-grid">
                        <div className="card">
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--primary)' }}>Apa itu Resik Artha?</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Platform bank sampah digital yang memudahkan anda mengelola sampah menjadi uang tunai dengan sistem yang transparan dan efisien.</p>
                        </div>
                        <div className="card">
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--primary)' }}>Bagaimana cara setor?</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Cukup daftar akun, pilih menu setor sampah, isi formulir, dan petugas kami akan segera memproses penjemputan atau validasi.</p>
                        </div>
                        <div className="card">
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--primary)' }}>Apa keuntungan saya?</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Anda mendapatkan penghasilan tambahan dan berkontribusi menjaga kelestarian lingkungan.</p>
                        </div>
                        <div className="card">
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--primary)' }}>Apakah ada minimal berat?</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Tidak ada minimal berat, namun kami sarankan mengumpulkan jumlah yang cukup agar efisien.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)', padding: '6rem 0', color: 'white', textAlign: 'center' }}>
                <div className="container">
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1.5rem' }}>Siap untuk Berubah?</h2>
                    <p style={{ fontSize: '1.25rem', marginBottom: '3rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto 3rem' }}>
                        Jangan biarkan sampah menumpuk. Jadikan nilai ekonomis sekarang juga. Gabung bersama ribuan pahlawan lingkungan lainnya.
                    </p>
                    <Link to="/register" className="btn" style={{ background: 'white', color: 'var(--primary)', padding: '1rem 3rem', fontSize: '1.125rem', borderRadius: '100px', fontWeight: '700', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                        Daftar Gratis
                    </Link>
                </div>
            </section>

            {/* Footer Section */}
            <footer className="footer" style={{ borderTop: 'none', background: '#F8FAFC' }}>
                <div className="container">
                    <div className="footer-grid">
                        <div style={{ textAlign: 'center', width: '100%' }}>
                            <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', fontWeight: '800', fontSize: '1.5rem' }}>Resik Artha</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
                                Mengubah sampah menjadi berkah.
                            </p>
                        </div>
                    </div>
                    <div style={{ borderTop: '1px solid var(--border)', marginTop: '3rem', paddingTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        &copy; {new Date().getFullYear()} Resik Artha. Hak Cipta Dilindungi.
                    </div>
                </div>
            </footer>
        </div>
    );
}
