import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, getDocs, where, increment, orderBy, setDoc } from 'firebase/firestore';
import {
    ShieldAlert, Users, LayoutDashboard, PlayCircle, PlusCircle,
    MessageSquare, Settings, LogOut, Search, Trash2,
    CheckCircle2, XCircle, DollarSign, TrendingUp, BarChart3, Clock
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

// Yerel Sidebar kaldırıldı

const AdminPanel = ({ user, onLogout }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [users, setUsers] = useState([]);
    const [apps, setApps] = useState([]);
    const [tests, setTests] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalApps: 0,
        totalTests: 0,
        totalCredits: 0
    });
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');

    useEffect(() => {
        if (!user) return;

        // 1. Tüm kullanıcıları çek
        const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
            const userData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(userData);
            const totalCredits = userData.reduce((acc, u) => acc + (u.credits || 0), 0);
            setStats(prev => ({ ...prev, totalUsers: snapshot.size, totalCredits }));
        });

        // 2. Tüm uygulamaları çek
        const unsubApps = onSnapshot(collection(db, 'apps'), (snapshot) => {
            setApps(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setStats(prev => ({ ...prev, totalApps: snapshot.size }));
        });

        // 3. Tüm testleri çek
        const unsubTests = onSnapshot(collection(db, 'tests'), (snapshot) => {
            setTests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });

        // 4. Tüm mesajları çek
        const unsubMessages = onSnapshot(query(collection(db, 'messages'), orderBy('createdAt', 'desc')), (snapshot) => {
            setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => {
            unsubUsers();
            unsubApps();
            unsubTests();
            unsubMessages();
        };
    }, [user]);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            setPasswordMessage('Şifre en az 6 karakter olmalıdır.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordMessage('Şifreler uyuşmuyor.');
            return;
        }
        try {
            const configRef = doc(db, 'site_config', 'admin');
            await setDoc(configRef, { password: newPassword }, { merge: true });
            setPasswordMessage('Yönetici şifresi başarıyla güncellendi!');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => setPasswordMessage(''), 3000);
        } catch (error) {
            setPasswordMessage('Şifre güncellenirken bir hata oluştu.');
            console.error(error);
        }
    };

    const handleUpdateUserCredits = async (userId, amount) => {
        try {
            await updateDoc(doc(db, 'users', userId), {
                credits: increment(amount)
            });
        } catch (error) {
            console.error("Kredi güncelleme hatası:", error);
        }
    };

    const handleBanUser = async (userId, currentStatus) => {
        const action = currentStatus ? "kaldırmak" : "yasaklamak";
        if (!window.confirm(`Bu kullanıcıyı ${action} istediğinize emin misiniz?`)) return;
        try {
            await updateDoc(doc(db, 'users', userId), {
                isBanned: !currentStatus
            });
        } catch (error) {
            console.error("Kullanıcı banlama hatası:", error);
        }
    };

    const handleDeleteMessage = async (msgId) => {
        if (!window.confirm("Bu mesajı silmek istediğinize emin misiniz?")) return;
        try {
            await deleteDoc(doc(db, 'messages', msgId));
        } catch (error) {
            console.error("Mesaj silme hatası:", error);
        }
    };

    const handleDeleteApp = async (appId) => {
        if (!window.confirm("Bu uygulamayı tamamen silmek istediğinize emin misiniz?")) return;
        try {
            await deleteDoc(doc(db, 'apps', appId));
        } catch (error) {
            console.error("Uygulama silme hatası:", error);
        }
    };

    return (
        <div className="dashboard-layout">
            <div className="gradient-bg"></div>
            <Sidebar onLogout={onLogout} location={location} isAdmin={true} />

            <main className="dashboard-main">
                <header style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <ShieldAlert color="#fbbf24" size={28} />
                        <h2 style={{ fontSize: '2rem' }}>Yönetici Paneli</h2>
                    </div>
                    <p style={{ color: 'var(--text-muted)' }}>Tüm platformu, kullanıcıları ve uygulamaları yönetin.</p>
                </header>

                {/* Özet Kartları */}
                <div className="stat-grid" style={{ marginBottom: '3rem' }}>
                    <div className="feature-card glass">
                        <Users size={24} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Toplam Kullanıcı</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{stats.totalUsers}</div>
                    </div>
                    <div className="feature-card glass">
                        <PlayCircle size={24} color="#4ade80" style={{ marginBottom: '1rem' }} />
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Aktif Uygulamalar</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{stats.totalApps}</div>
                    </div>
                    <div className="feature-card glass">
                        <BarChart3 size={24} color="#fbbf24" style={{ marginBottom: '1rem' }} />
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tamamlanan Testler</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{stats.totalTests}</div>
                    </div>
                    <div className="feature-card glass">
                        <DollarSign size={24} color="#a78bfa" style={{ marginBottom: '1rem' }} />
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Toplam Dolaşımdaki Kredi</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{stats.totalCredits}</div>
                    </div>
                </div>

                {/* Sekme Menüsü */}
                <div className="glass" style={{ display: 'flex', padding: '0.5rem', borderRadius: '1rem', marginBottom: '2rem', gap: '0.5rem' }}>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={activeTab === 'users' ? 'btn-primary' : 'btn-outline'}
                        style={{ flex: 1, border: 'none', padding: '0.75rem' }}
                    >
                        Kullanıcılar
                    </button>
                    <button
                        onClick={() => setActiveTab('apps')}
                        className={activeTab === 'apps' ? 'btn-primary' : 'btn-outline'}
                        style={{ flex: 1, border: 'none', padding: '0.75rem' }}
                    >
                        Uygulamalar
                    </button>
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={activeTab === 'chat' ? 'btn-primary' : 'btn-outline'}
                        style={{ flex: 1, border: 'none', padding: '0.75rem' }}
                    >
                        Sohbet Yönetimi
                    </button>
                    <button
                        onClick={() => setActiveTab('tests')}
                        className={activeTab === 'tests' ? 'btn-primary' : 'btn-outline'}
                        style={{ flex: 1, border: 'none', padding: '0.75rem' }}
                    >
                        Testler
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={activeTab === 'settings' ? 'btn-primary' : 'btn-outline'}
                        style={{ flex: 1, border: 'none', padding: '0.75rem' }}
                    >
                        Ayarlar
                    </button>
                </div>

                {/* İçerik */}
                <div className="glass" style={{ padding: '2rem', borderRadius: '1.5rem' }}>
                    {activeTab === 'users' && (
                        <div>
                            <h3 style={{ marginBottom: '1.5rem' }}>Kullanıcı Yönetimi</h3>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                            <th style={{ padding: '1rem' }}>Kullanıcı</th>
                                            <th style={{ padding: '1rem' }}>E-posta</th>
                                            <th style={{ padding: '1rem' }}>Kredi</th>
                                            <th style={{ padding: '1rem' }}>İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '1rem' }}>
                                                    {u.displayName || 'İsimsiz'}
                                                    {u.isBanned && <span style={{ marginLeft: '0.5rem', fontSize: '0.65rem', background: '#f87171', color: 'white', padding: '2px 4px', borderRadius: '4px' }}>YASAKLI</span>}
                                                </td>
                                                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{u.email}</td>
                                                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{u.credits}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button onClick={() => handleUpdateUserCredits(u.id, 10)} style={{ padding: '4px 8px', background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', border: 'none', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>+10</button>
                                                        <button onClick={() => handleUpdateUserCredits(u.id, -10)} style={{ padding: '4px 8px', background: 'rgba(248, 113, 113, 0.1)', color: '#f87171', border: 'none', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>-10</button>
                                                        <button onClick={() => handleBanUser(u.id, u.isBanned)} style={{ padding: '4px 8px', background: u.isBanned ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)', color: u.isBanned ? '#4ade80' : '#f87171', border: 'none', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>
                                                            {u.isBanned ? 'Yasağı Kaldır' : 'Yasakla'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'apps' && (
                        <div>
                            <h3 style={{ marginBottom: '1.5rem' }}>Uygulama Yönetimi</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                                {apps.map(app => (
                                    <div key={app.id} className="glass" style={{ padding: '1.25rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                            <div style={{ fontSize: '1.5rem' }}>{app.icon || '📱'}</div>
                                            <button onClick={() => handleDeleteApp(app.id)} style={{ color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                        <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{app.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Sahip: {app.ownerName}</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                            <span>Tester: <strong>{app.testersCount}</strong></span>
                                            <span style={{ color: '#4ade80' }}>Ödül: <strong>{app.reward} 🪙</strong></span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'chat' && (
                        <div>
                            <h3 style={{ marginBottom: '1.5rem' }}>Sohbet Yönetimi</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {messages.map(msg => (
                                    <div key={msg.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>{msg.userName} <span style={{ color: 'var(--text-muted)', fontWeight: 'normal', fontSize: '0.75rem' }}>({new Date(msg.createdAt?.seconds * 1000).toLocaleString()})</span></div>
                                            <div style={{ fontSize: '0.9rem' }}>{msg.text}</div>
                                        </div>
                                        <button onClick={() => handleDeleteMessage(msg.id)} style={{ color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                                {messages.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Henüz mesaj yok.</p>}
                            </div>
                        </div>
                    )}

                    {activeTab === 'tests' && (
                        <div>
                            <h3 style={{ marginBottom: '1.5rem' }}>Sistemdeki Son Testler</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {tests.slice(0, 20).map(test => (
                                    <div key={test.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{test.testerName} &rarr; {test.appName}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Durum: {test.status}</div>
                                        </div>
                                        {test.screenshotUrl && (
                                            <a href={test.screenshotUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'none' }}>Kanıtı Gör</a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div style={{ maxWidth: '500px' }}>
                            <h3 style={{ marginBottom: '1.5rem' }}>Yönetici Ayarları</h3>
                            <form onSubmit={handlePasswordChange} className="glass" style={{ padding: '2rem', borderRadius: '1rem' }}>
                                <div className="form-group">
                                    <label>Yeni Yönetici Şifresi</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Min. 6 karakter"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Şifreyi Onayla</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Şifreyi tekrar girin"
                                    />
                                </div>
                                {passwordMessage && <p style={{ color: passwordMessage.includes('başarıyla') ? '#4ade80' : '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>{passwordMessage}</p>}
                                <button type="submit" className="btn-primary" style={{ width: '100%' }}>Şifreyi Güncelle</button>
                            </form>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminPanel;
