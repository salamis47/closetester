import React, { useState } from 'react';
import { LayoutDashboard, PlusCircle, PlayCircle, Settings, LogOut, User, Bell, Shield, ChevronRight, Check, X, AlertTriangle, MessageSquare, ShieldAlert } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import Sidebar from './Sidebar';

// Yerel Sidebar kaldırıldı

const SettingsPage = ({ user, onLogout, credits = 0, isAdmin }) => {
    const location = useLocation();

    const [profile, setProfile] = useState({
        name: user?.displayName || user?.email?.split('@')[0] || 'Kullanıcı',
        email: user?.email || '',
        bio: '',
    });

    const [notifications, setNotifications] = useState({
        newTester: true,
        testComplete: true,
        creditEarned: true,
        weekly: false,
    });

    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const sections = [
        { id: 'profile', label: 'Profil', icon: <User size={18} /> },
        { id: 'notifications', label: 'Bildirimler', icon: <Bell size={18} /> },
        { id: 'security', label: 'Güvenlik', icon: <Shield size={18} /> },
    ];

    const [activeSection, setActiveSection] = useState('profile');
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [deleting, setDeleting] = useState(false);

    const handleDeleteAccount = () => {
        if (deleteConfirmText !== 'SİL') return;
        setDeleting(true);
        setTimeout(() => {
            setDeleting(false);
            setDeleteModal(false);
            if (onLogout) onLogout();
        }, 1500);
    };

    return (
        <div className="dashboard-layout">
            <div className="gradient-bg"></div>

            <Sidebar onLogout={onLogout} location={location} isAdmin={isAdmin} />

            <main className="dashboard-main">
                <header style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Ayarlar</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Hesap ve uygulama tercihlerini yönet.</p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '2rem' }}>
                    {/* Left nav */}
                    <div className="glass" style={{ padding: '1rem', borderRadius: '1rem', height: 'fit-content' }}>
                        {sections.map(s => (
                            <button
                                key={s.id}
                                onClick={() => setActiveSection(s.id)}
                                style={{
                                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '0.75rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer',
                                    background: activeSection === s.id ? 'rgba(99,102,241,0.15)' : 'transparent',
                                    color: activeSection === s.id ? 'var(--primary)' : 'var(--text-muted)',
                                    marginBottom: '0.25rem',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    {s.icon} {s.label}
                                </span>
                                <ChevronRight size={16} />
                            </button>
                        ))}
                    </div>

                    {/* Right content */}
                    <div className="glass" style={{ padding: '2rem', borderRadius: '1rem' }}>
                        {activeSection === 'profile' && (
                            <div>
                                <h3 style={{ marginBottom: '2rem' }}>Profil Bilgileri</h3>

                                {/* Avatar */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--glass-border)' }}>
                                    <div style={{
                                        width: '80px', height: '80px', borderRadius: '50%',
                                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem'
                                    }}>
                                        👤
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{profile.name}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>{profile.email}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99,102,241,0.1)', padding: '0.3rem 0.75rem', borderRadius: '2rem', width: 'fit-content', fontSize: '0.85rem', color: 'var(--primary)' }}>
                                            ⭐ {credits} Kredi
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Ad Soyad</label>
                                    <input
                                        type="text"
                                        value={profile.name}
                                        onChange={e => setProfile({ ...profile, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>E-posta</label>
                                    <input
                                        type="email"
                                        value={profile.email}
                                        disabled
                                        style={{ opacity: 0.5, cursor: 'not-allowed' }}
                                    />
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Google hesabınla bağlı, değiştirilemez.</p>
                                </div>
                                <div className="form-group">
                                    <label>Hakkında</label>
                                    <textarea
                                        placeholder="Kısa bir tanıtım yaz..."
                                        value={profile.bio}
                                        onChange={e => setProfile({ ...profile, bio: e.target.value })}
                                        style={{ minHeight: '100px', resize: 'vertical' }}
                                    />
                                </div>
                                <button onClick={handleSave} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {saved ? <><Check size={16} /> Kaydedildi!</> : 'Kaydet'}
                                </button>
                            </div>
                        )}

                        {activeSection === 'notifications' && (
                            <div>
                                <h3 style={{ marginBottom: '2rem' }}>Bildirim Tercihleri</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    {[
                                        { key: 'newTester', label: 'Yeni Tester', desc: 'Uygulamana yeni biri katıldığında bildir' },
                                        { key: 'testComplete', label: 'Test Tamamlandı', desc: 'Bir tester 14. günü başarıyla geçtiğinde bildir' },
                                        { key: 'creditEarned', label: 'Kredi Kazanıldı', desc: 'Hesabına kredi eklendiğinde bildir' },
                                        { key: 'weekly', label: 'Haftalık Özet', desc: 'Her pazartesi haftalık rapor e-postası gönder' },
                                    ].map(item => (
                                        <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.03)' }}>
                                            <div>
                                                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{item.label}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                                            </div>
                                            <button
                                                onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                                                style={{
                                                    width: '52px', height: '28px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                                                    background: notifications[item.key] ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                                                    position: 'relative', transition: 'all 0.2s ease', flexShrink: 0,
                                                }}
                                            >
                                                <div style={{
                                                    position: 'absolute', top: '4px',
                                                    left: notifications[item.key] ? '28px' : '4px',
                                                    width: '20px', height: '20px', borderRadius: '50%',
                                                    background: 'white', transition: 'all 0.2s ease',
                                                }} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={handleSave} className="btn-primary" style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {saved ? <><Check size={16} /> Kaydedildi!</> : 'Kaydet'}
                                </button>
                            </div>
                        )}

                        {activeSection === 'security' && (
                            <div>
                                <h3 style={{ marginBottom: '2rem' }}>Güvenlik</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div className="glass" style={{ padding: '1.25rem', borderRadius: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Google ile Giriş</div>
                                            <div style={{ fontSize: '0.85rem', color: '#4ade80' }}>✓ Bağlı — {profile.email}</div>
                                        </div>
                                        <div style={{ fontSize: '1.5rem' }}>🔒</div>
                                    </div>
                                    <div className="glass" style={{ padding: '1.25rem', borderRadius: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>İki Faktörlü Doğrulama</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Google hesabın üzerinden yönetilir</div>
                                        </div>
                                        <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" className="btn-outline" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem', textDecoration: 'none' }}>
                                            Yönet
                                        </a>
                                    </div>
                                    <div className="glass" style={{ padding: '1.25rem', borderRadius: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '3px solid #ff6b6b' }}>
                                        <div>
                                            <div style={{ fontWeight: '600', marginBottom: '0.25rem', color: '#ff6b6b' }}>Hesabı Sil</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tüm veriler ve krediler kalıcı olarak silinir</div>
                                        </div>
                                        <button className="btn-outline" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem', color: '#ff6b6b', borderColor: '#ff6b6b' }}
                                            onClick={() => setDeleteModal(true)}>
                                            Sil
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {deleteModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
                    backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="glass" style={{ width: '460px', padding: '2.5rem', borderRadius: '1.5rem', position: 'relative', border: '1px solid rgba(255,107,107,0.3)' }}>
                        <button onClick={() => { setDeleteModal(false); setDeleteConfirmText(''); }}
                            style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>

                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{ width: '64px', height: '64px', background: 'rgba(255,107,107,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                                <AlertTriangle size={32} color="#ff6b6b" />
                            </div>
                            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.75rem', color: '#ff6b6b' }}>Hesabı Sil</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                                Bu işlem <strong style={{ color: 'white' }}>geri alınamaz.</strong> Tüm uygulamaların, kredilerin ve test geçmişin kalıcı olarak silinecek.
                            </p>
                        </div>

                        <div className="form-group">
                            <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Onaylamak için aşağıya <strong style={{ color: 'white' }}>SİL</strong> yaz
                            </label>
                            <input
                                type="text"
                                placeholder="SİL"
                                value={deleteConfirmText}
                                onChange={e => setDeleteConfirmText(e.target.value)}
                                style={{ borderColor: deleteConfirmText === 'SİL' ? '#ff6b6b' : undefined }}
                                autoFocus
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button onClick={() => { setDeleteModal(false); setDeleteConfirmText(''); }} className="btn-outline" style={{ flex: 1 }}>Vazgeç</button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmText !== 'SİL' || deleting}
                                style={{
                                    flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: 'none',
                                    background: deleteConfirmText === 'SİL' ? '#ff6b6b' : 'rgba(255,107,107,0.2)',
                                    color: 'white', cursor: deleteConfirmText === 'SİL' ? 'pointer' : 'not-allowed',
                                    fontWeight: '600', transition: 'all 0.2s ease'
                                }}
                            >
                                {deleting ? 'Siliniyor...' : 'Hesabı Kalıcı Sil'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;
