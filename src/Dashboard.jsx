import React, { useState, useEffect } from 'react';
import { LayoutDashboard, PlusCircle, PlayCircle, Settings, LogOut, Star, X, Users, CheckCircle2, Clock, MessageSquare, ShieldAlert, Info, ExternalLink } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { db } from './firebase';
import { collection, query, where, onSnapshot, updateDoc, doc, increment } from 'firebase/firestore';

const AppDetailModal = ({ app, onClose }) => (
    <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
        <div className="glass" style={{ width: '500px', padding: '2rem', borderRadius: '1.5rem', position: 'relative' }}>
            <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ width: '60px', height: '60px', background: app.color, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                    {app.icon}
                </div>
                <div>
                    <h3 style={{ fontSize: '1.25rem' }}>{app.name}</h3>
                    <div style={{ color: '#4ade80', fontSize: '0.85rem' }}>✓ {app.status === 'active' ? 'Aktif Test' : 'Tamamlandı'}</div>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Test Günü</span>
                    <span style={{ fontWeight: 'bold' }}>{app.testDay || 0} / 14</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                    <div style={{ width: `${((app.testDay || 0) / 14) * 100}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--secondary))', borderRadius: '4px' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Tester Sayısı</span>
                    <span>{app.testersCount || 0} / 20</span>
                </div>
            </div>
            <button onClick={onClose} className="btn-primary" style={{ width: '100%', marginTop: '2rem' }}>Kapat</button>
        </div>
    </div>
);

const Dashboard = ({ user, credits = 120, onLogout, onAddCredits, isAdmin }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedApp, setSelectedApp] = useState(null);
    const [myApps, setMyApps] = useState([]);
    const [stats, setStats] = useState({ testedByMe: 0, testersForMe: 0 });
    const [incomingTests, setIncomingTests] = useState([]);
    const [selectedTest, setSelectedTest] = useState(null);

    useEffect(() => {
        if (!user) return;

        // 1. Kullanıcının kendi uygulamalarını çek
        const qApps = query(collection(db, 'apps'), where('ownerId', '==', user.uid));
        const unsubApps = onSnapshot(qApps, (snapshot) => {
            setMyApps(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // 2. İstatistikleri çek
        const qTestedByMe = query(collection(db, 'tests'), where('testerId', '==', user.uid));
        const unsubTestedByMe = onSnapshot(qTestedByMe, (snapshot) => {
            setStats(prev => ({ ...prev, testedByMe: snapshot.size }));
        });

        const qTestersForMe = query(collection(db, 'tests'), where('ownerId', '==', user.uid));
        const unsubTestersForMe = onSnapshot(qTestersForMe, (snapshot) => {
            setStats(prev => ({ ...prev, testersForMe: snapshot.size }));
        });

        // 3. Onay bekleyen testleri çek
        const qPending = query(
            collection(db, 'tests'),
            where('ownerId', '==', user.uid),
            where('status', '==', 'pending_approval')
        );
        const unsubPending = onSnapshot(qPending, (snapshot) => {
            setIncomingTests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => {
            unsubApps();
            unsubTestedByMe();
            unsubTestersForMe();
            unsubPending();
        };
    }, [user]);

    const handleApproveTest = async (test) => {
        try {
            // 1. Test durumunu güncelle
            await updateDoc(doc(db, 'tests', test.id), {
                status: 'approved',
                approvedAt: new Date()
            });

            // 2. Tester'a kredisini ver
            const testerRef = doc(db, 'users', test.testerId);
            await updateDoc(testerRef, {
                credits: increment(test.reward || 5)
            });

            // 3. Uygulamanın tester sayısını artır
            const appRef = doc(db, 'apps', test.appId);
            await updateDoc(appRef, {
                testersCount: increment(1)
            });

            alert("Test onaylandı ve krediler gönderildi!");
            setSelectedTest(null);
        } catch (error) {
            console.error("Test onaylama hatası:", error);
            alert("Bir hata oluştu.");
        }
    };

    const handleRejectTest = async (testId) => {
        if (!window.confirm("Bu testi reddetmek istediğinize emin misiniz?")) return;
        try {
            await updateDoc(doc(db, 'tests', testId), {
                status: 'rejected',
                rejectedAt: new Date()
            });
            setSelectedTest(null);
        } catch (error) {
            console.error("Test reddetme hatası:", error);
        }
    };

    const userName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Kullanıcı';

    return (
        <div className="dashboard-layout">
            <div className="gradient-bg"></div>
            <Sidebar onLogout={onLogout} location={location} isAdmin={isAdmin} />

            <main className="dashboard-main">
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                        <h2 style={{ fontSize: '2rem' }}>Merhaba, {userName}! 👋</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Bugün harika bir gün. Haydi uygulama test edelim.</p>
                    </div>
                    <div className="glass" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Star size={18} color="#fbbf24" fill="#fbbf24" />
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mevcut Kredi</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fbbf24' }}>{credits} 🪙</div>
                        </div>
                    </div>
                </header>

                <div className="stat-grid">
                    <div className="feature-card glass" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🧪</div>
                        <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Test Ettiğin</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.testedByMe}</div>
                    </div>
                    <div className="feature-card glass" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👥</div>
                        <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Seni Test Eden</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.testersForMe}</div>
                    </div>
                    <div className="feature-card glass" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📱</div>
                        <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Aktif Uygulama</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{myApps.length}</div>
                    </div>
                </div>

                {incomingTests.length > 0 && (
                    <section style={{ marginBottom: '3rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: '10px', height: '10px', background: '#fbbf24', borderRadius: '50%' }}></div>
                            <h3>Onay Bekleyen Testler ({incomingTests.length})</h3>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                            {incomingTests.map(test => (
                                <div key={test.id} className="glass" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
                                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{test.testerName}</div>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{test.appName} uygulamanı test etti.</p>
                                    <button onClick={() => setSelectedTest(test)} className="btn-primary" style={{ width: '100%', fontSize: '0.85rem' }}>Kanıtı Gör & Onayla</button>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <section>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3>Aktif Testlerin</h3>
                        <button onClick={() => navigate('/add-app')} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>+ Uygulama Ekle</button>
                    </div>

                    {myApps.length === 0 ? (
                        <div className="glass" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                            <p>Henüz test bekleyen uygulaman yok.</p>
                            <button onClick={() => navigate('/add-app')} className="btn-primary" style={{ marginTop: '1rem' }}>İlk Uygulamanı Ekle</button>
                        </div>
                    ) : (
                        <div className="app-list">
                            {myApps.map(app => (
                                <div key={app.id} className="app-item glass">
                                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                        <div style={{ width: '50px', height: '50px', background: app.color, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>{app.icon}</div>
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>{app.name}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tester: {app.testersCount || 0}/20</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div className="glass" style={{ padding: '0.25rem 0.75rem', borderRadius: '2rem', fontSize: '0.8rem', color: '#4ade80', background: 'rgba(74, 222, 128, 0.1)' }}>{app.status === 'active' ? 'Aktif' : 'Tamamlandı'}</div>
                                        <button onClick={() => setSelectedApp(app)} className="btn-outline" style={{ padding: '0.5rem 1rem' }}>Detaylar</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            {selectedApp && <AppDetailModal app={selectedApp} onClose={() => setSelectedApp(null)} />}

            {selectedTest && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
                }}>
                    <div className="glass" style={{ width: '100%', maxWidth: '500px', padding: '2rem', borderRadius: '1.5rem', position: 'relative' }}>
                        <button onClick={() => setSelectedTest(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>

                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>Test Kanıtını İncele</h3>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Gönderen: <strong>{selectedTest.testerName}</strong></div>
                                {selectedTest.aiVerified ? (
                                    <div style={{ background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', border: '1px solid rgba(74, 222, 128, 0.2)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <CheckCircle2 size={14} /> AI Onaylı
                                    </div>
                                ) : (
                                    <div style={{ background: 'rgba(248, 113, 113, 0.1)', color: '#f87171', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', border: '1px solid rgba(248, 113, 113, 0.2)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <Clock size={14} /> Manuel Kontrol Gerekli
                                    </div>
                                )}
                            </div>
                            <div style={{ width: '100%', maxHeight: '350px', overflow: 'hidden', borderRadius: '1rem', border: '1px solid var(--glass-border)' }}>
                                <img src={selectedTest.screenshotUrl} alt="Screenshot Evidence" style={{ width: '100%', display: 'block' }} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => handleRejectTest(selectedTest.id)} className="btn-outline" style={{ flex: 1, color: '#ff6b6b' }}>Reddet</button>
                            <button onClick={() => handleApproveTest(selectedTest)} className="btn-primary" style={{ flex: 2 }}>Onayla & Krediyi Gönder</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
