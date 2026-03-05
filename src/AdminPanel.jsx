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
    const [blacklist, setBlacklist] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(null); // Silinen mesajın ID'sini tutar
    const [confirmDeleteId, setConfirmDeleteId] = useState(null); // Onay bekleyen mesaj ID
    const [confirmDeleteUserId, setConfirmDeleteUserId] = useState(null); // Onay bekleyen kullanıcı ID
    const [deleteFeedback, setDeleteFeedback] = useState(''); // Silme geri bildirimi
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalApps: 0,
        totalTests: 0,
        totalCredits: 0
    });
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');
    const [maintenanceMode, setMaintenanceMode] = useState(false);

    useEffect(() => {
        if (!user) return;

        // 1. Tüm kullanıcıları çek
        const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
            const userData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(userData);
            const totalCredits = userData.reduce((acc, u) => acc + (u.credits || 0), 0);
            setStats(prev => ({ ...prev, totalUsers: snapshot.size, totalCredits: Number(totalCredits).toFixed(2) }));
        });

        // 2. Tüm uygulamaları çek
        const unsubApps = onSnapshot(collection(db, 'apps'), (snapshot) => {
            setApps(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setStats(prev => ({ ...prev, totalApps: snapshot.size }));
        });

        // 3. Tüm testleri çek
        const unsubTests = onSnapshot(collection(db, 'tests'), (snapshot) => {
            setTests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setStats(prev => ({ ...prev, totalTests: snapshot.size }));
            setLoading(false);
        });

        // 4. Tüm mesajları çek
        const unsubMessages = onSnapshot(query(collection(db, 'messages'), orderBy('createdAt', 'desc')), (snapshot) => {
            setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // 5. Kara listeyi çek
        const unsubBlacklist = onSnapshot(collection(db, 'blacklist'), (snapshot) => {
            setBlacklist(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // 6. Bakım Modu durumunu çek
        const unsubSettings = onSnapshot(doc(db, 'settings', 'site_settings'), (docSnap) => {
            if (docSnap.exists()) {
                setMaintenanceMode(docSnap.data().maintenanceMode || false);
            }
        });

        return () => {
            unsubUsers();
            unsubApps();
            unsubTests();
            unsubMessages();
            unsubBlacklist();
            unsubSettings();
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

    const handleEmergencyCleanup = async () => {
        if (!window.confirm("DİKKAT! Kendiniz hariç TÜM kullanıcıları, uygulamaları, testleri ve mesajları silmek üzeresiniz. Bu işlem GERİ ALINAMAZ. Onaylıyor musunuz?")) return;
        if (!window.confirm("SON UYARI: Veritabanı tamamen sıfırlanacak. Devam edilsin mi?")) return;

        setLoading(true);
        try {
            console.log("Acil temizlik başlatıldı...");

            // 1. Mesajları sil
            for (const msg of messages) {
                await deleteDoc(doc(db, 'messages', msg.id));
            }

            // 2. Testleri sil
            for (const test of tests) {
                await deleteDoc(doc(db, 'tests', test.id));
            }

            // 3. Uygulamaları sil (Yönetici hariç)
            for (const app of apps) {
                if (app.ownerId !== user.uid) {
                    await deleteDoc(doc(db, 'apps', app.id));
                }
            }

            // 4. Diğer kullanıcıları sil
            for (const u of users) {
                if (u.id !== user.uid) {
                    await deleteDoc(doc(db, 'users', u.id));
                }
            }

            alert("Sistem başarıyla sıfırlandı! (Yönetici kaydı korundu)");
        } catch (error) {
            console.error("Temizlik hatası:", error);
            alert("Temizlik sırasında bir hata oluştu: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId, userEmail) => {
        setLoading(true);
        setDeleteFeedback('Kullanıcı ve tüm verileri siliniyor...');
        try {
            // 1. Kullanıcının uygulamalarını sil
            const qApps = query(collection(db, 'apps'), where('ownerId', '==', userId));
            const appsSnap = await getDocs(qApps);
            for (const appDoc of appsSnap.docs) {
                await deleteDoc(doc(db, 'apps', appDoc.id));
            }

            // 2. Kullanıcının testlerini sil
            const qTests1 = query(collection(db, 'tests'), where('testerId', '==', userId));
            const qTests2 = query(collection(db, 'tests'), where('ownerId', '==', userId));
            const [s1, s2] = await Promise.all([getDocs(qTests1), getDocs(qTests2)]);
            const allTests = [...s1.docs, ...s2.docs];
            for (const tDoc of allTests) {
                await deleteDoc(doc(db, 'tests', tDoc.id));
            }

            // 3. Mesajları sil
            const qMsgs = query(collection(db, 'messages'), where('senderId', '==', userId));
            const msgsSnap = await getDocs(qMsgs);
            for (const mDoc of msgsSnap.docs) {
                await deleteDoc(doc(db, 'messages', mDoc.id));
            }

            // 4. Kullanıcı dökümanını sil
            await deleteDoc(doc(db, 'users', userId));

            setDeleteFeedback('Kullanıcı ve tüm verileri başarıyla temizlendi.');
            setConfirmDeleteUserId(null);
            setTimeout(() => setDeleteFeedback(''), 3000);
        } catch (error) {
            console.error("Kullanıcı silme hatası:", error);
            setDeleteFeedback("Silme hatası: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveBlacklist = async (id) => {
        if (!window.confirm("Bu kullanıcının bekleme süresi cezasını kaldırmak istediğinize emin misiniz?")) return;
        try {
            await deleteDoc(doc(db, 'blacklist', id));
            setDeleteFeedback('Ceza başarıyla kaldırıldı.');
            setTimeout(() => setDeleteFeedback(''), 3000);
        } catch (error) {
            console.error("Ceza kaldırma hatası:", error);
        }
    };

    const handleDeleteMessage = async (msgId) => {
        if (!msgId || isDeleting) return;

        setIsDeleting(msgId);
        setDeleteFeedback('Siliniyor...');

        try {
            await deleteDoc(doc(db, 'messages', msgId));
            setDeleteFeedback('Mesaj başarıyla silindi.');
            setConfirmDeleteId(null);
            setTimeout(() => setDeleteFeedback(''), 3000);
        } catch (error) {
            console.error("Silme hatası:", error);
            setDeleteFeedback('Hata: ' + error.message);
            setTimeout(() => setDeleteFeedback(''), 5000);
        } finally {
            setIsDeleting(null);
        }
    };

    const refreshChat = async () => {
        try {
            const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            alert("Sohbet listesi güncellendi.");
        } catch (error) {
            alert("Güncellenirken hata oluştu: " + error.message);
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
                        onClick={() => setActiveTab('blacklist')}
                        className={activeTab === 'blacklist' ? 'btn-primary' : 'btn-outline'}
                        style={{ flex: 1, border: 'none', padding: '0.75rem' }}
                    >
                        Cezalar
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
                    {deleteFeedback && (
                        <div style={{
                            padding: '0.75rem',
                            marginBottom: '1.5rem',
                            background: deleteFeedback.includes('Hata') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(74, 222, 128, 0.2)',
                            color: deleteFeedback.includes('Hata') ? '#fca5a5' : '#86efac',
                            borderRadius: '0.5rem',
                            fontSize: '0.9rem',
                            textAlign: 'center',
                            border: '1px solid currentColor'
                        }}>
                            {deleteFeedback}
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div>
                            <h3 style={{ marginBottom: '0.5rem' }}>Kullanıcı Yönetimi</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
                                Not: Buradan bir kullanıcıyı silmek sadece verilerini (kredi, uygulama vb.) temizler. Kullanıcı aynı şifreyle tekrar "Giriş" yaparsa sistemi sıfırdan başlar. Tamamen engellemek için "Yasakla" butonunu kullanın.
                            </p>
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
                                                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{Number(u.credits || 0).toFixed(2)}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button onClick={() => handleUpdateUserCredits(u.id, 10)} style={{ padding: '4px 8px', background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', border: 'none', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>+10</button>
                                                        <button onClick={() => handleUpdateUserCredits(u.id, -10)} style={{ padding: '4px 8px', background: 'rgba(248, 113, 113, 0.1)', color: '#f87171', border: 'none', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>-10</button>
                                                        <button onClick={() => handleBanUser(u.id, u.isBanned)} style={{ padding: '4px 8px', background: u.isBanned ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)', color: u.isBanned ? '#4ade80' : '#f87171', border: 'none', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>
                                                            {u.isBanned ? 'Yasağı Kaldır' : 'Yasakla'}
                                                        </button>
                                                        {confirmDeleteUserId === u.id ? (
                                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                                <button
                                                                    onClick={() => handleDeleteUser(u.id, u.email)}
                                                                    disabled={loading}
                                                                    style={{ background: '#ef4444', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
                                                                >
                                                                    {loading ? '...' : 'EVET'}
                                                                </button>
                                                                <button
                                                                    onClick={() => setConfirmDeleteUserId(null)}
                                                                    style={{ background: '#4b5563', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
                                                                >
                                                                    İPTAL
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => setConfirmDeleteUserId(u.id)}
                                                                disabled={loading}
                                                                style={{
                                                                    padding: '4px 8px',
                                                                    background: 'rgba(248, 113, 113, 0.1)',
                                                                    color: '#f87171',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    cursor: loading ? 'not-allowed' : 'pointer',
                                                                    opacity: loading ? 0.5 : 1
                                                                }}
                                                                title="Kullanıcıyı ve Tüm Verilerini Sil"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: 0 }}>Sohbet Yönetimi</h3>
                                <button onClick={refreshChat} className="btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Clock size={16} /> Listeyi Yenile
                                </button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {messages.map(msg => (
                                    <div key={msg.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                                                {msg.displayName || msg.userName || 'İsimsiz'}
                                                <span style={{ color: 'var(--text-muted)', fontWeight: 'normal', fontSize: '0.75rem', marginLeft: '0.5rem' }}>
                                                    ({msg.createdAt ? new Date(msg.createdAt.seconds * 1000).toLocaleString() : 'Tarih Bilgisi Yok'})
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '0.9rem' }}>{msg.text}</div>
                                            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)' }}>ID: {msg.id}</div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {confirmDeleteId === msg.id ? (
                                                <>
                                                    <button
                                                        onClick={() => handleDeleteMessage(msg.id)}
                                                        disabled={isDeleting === msg.id}
                                                        style={{ background: '#ef4444', color: 'white', padding: '8px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
                                                    >
                                                        EVET SİL
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmDeleteId(null)}
                                                        style={{ background: '#4b5563', color: 'white', padding: '8px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
                                                    >
                                                        İPTAL
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => setConfirmDeleteId(msg.id)}
                                                    disabled={isDeleting !== null}
                                                    style={{
                                                        background: '#ef4444',
                                                        color: 'white',
                                                        padding: '8px 16px',
                                                        borderRadius: '8px',
                                                        fontWeight: 'bold',
                                                        cursor: 'pointer',
                                                        border: '2px solid white',
                                                        fontSize: '14px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '5px'
                                                    }}
                                                >
                                                    <Trash2 size={16} /> SİL
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {messages.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Henüz mesaj yok.</p>}
                            </div>
                        </div>
                    )}


                    {activeTab === 'blacklist' && (
                        <div>
                            <h3 style={{ marginBottom: '1.5rem' }}>Ceza Yönetimi (Kara Liste)</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                                Hesabını silen ve 14 günlük bekleme süresine giren kullanıcılar burada listelenir.
                            </p>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                            <th style={{ padding: '1rem' }}>E-posta</th>
                                            <th style={{ padding: '1rem' }}>Silme Tarihi</th>
                                            <th style={{ padding: '1rem' }}>Kalan Gün</th>
                                            <th style={{ padding: '1rem' }}>İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {blacklist.length === 0 && (
                                            <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Aktif ceza bulunmuyor.</td></tr>
                                        )}
                                        {blacklist.map(item => {
                                            const deletedDate = item.deletedAt?.toDate() || new Date();
                                            const unlockDate = new Date(deletedDate.getTime() + 14 * 24 * 60 * 60 * 1000);
                                            const now = new Date();
                                            const diffDays = Math.ceil((unlockDate - now) / (1000 * 60 * 60 * 24));

                                            return (
                                                <tr key={item.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td style={{ padding: '1rem' }}>{item.email}</td>
                                                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{deletedDate.toLocaleString()}</td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <span style={{ color: diffDays > 0 ? '#fbbf24' : '#4ade80' }}>
                                                            {diffDays > 0 ? `${diffDays} Gün` : 'Süre Doldu'}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <button
                                                            onClick={() => handleRemoveBlacklist(item.id)}
                                                            style={{ padding: '6px 12px', background: '#4ade80', color: '#0f172a', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}
                                                        >
                                                            Cezayı Kaldır
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div style={{ maxWidth: '600px' }}>
                            {/* Bakım Modu Kartı */}
                            <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', marginBottom: '2rem', borderLeft: maintenanceMode ? '4px solid #f87171' : '4px solid #4ade80' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div>
                                        <h3 style={{ color: maintenanceMode ? '#f87171' : '#4ade80', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <ShieldAlert size={20} />
                                            {maintenanceMode ? 'Sistem Bakımda (Kapalı)' : 'Sistem Yayında (Açık)'}
                                        </h3>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            {maintenanceMode
                                                ? "Şu anda adminler hariç kimse siteye giremez veya işlem yapamaz. Sadece bakım erkanı görünür."
                                                : "Site şu an tüm kullanıcılara açık ve normal şekilde çalışıyor."}
                                        </p>
                                    </div>
                                    <button
                                        onClick={toggleMaintenanceMode}
                                        className={maintenanceMode ? "btn-outline" : "btn-primary"}
                                        style={{ borderColor: maintenanceMode ? '#f87171' : '', color: maintenanceMode ? '#f87171' : '' }}
                                    >
                                        {maintenanceMode ? 'Bakım Modunu Kapat' : 'Bakım Modunu Aç'}
                                    </button>
                                </div>
                            </div>

                            <h3 style={{ marginBottom: '1.5rem' }}>Yönetici Şifre Yenileme</h3>
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

                            <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', marginTop: '2rem', border: '1px solid rgba(248, 113, 113, 0.2)' }}>
                                <h4 style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <ShieldAlert size={20} /> Kritik İşlemler
                                </h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                                    Bu işlem kendiniz hariç tüm kullanıcı verilerini, uygulamaları, testleri ve mesajları kalıcı olarak siler. Test aşamasından canlıya geçerken kullanılması önerilir.
                                </p>
                                <button
                                    onClick={handleEmergencyCleanup}
                                    className="btn-outline"
                                    style={{ width: '100%', borderColor: '#f87171', color: '#f87171' }}
                                    disabled={loading}
                                >
                                    {loading ? 'Temizleniyor...' : 'Sistemi Sıfırla (Yönetici Hariç)'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main >
        </div >
    );
};

export default AdminPanel;
