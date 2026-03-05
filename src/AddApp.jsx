import React, { useState } from 'react';
import { Globe, Users, Info, LayoutDashboard, PlusCircle, PlayCircle, CheckCircle2, MessageSquare, Settings, LogOut, RefreshCw, ShieldAlert } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

import { db } from './firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, arrayUnion, runTransaction, setDoc } from 'firebase/firestore';

const Sidebar = ({ onLogout, location, isAdmin }) => (
    <aside className="sidebar glass">
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '3rem' }}>
            <span style={{ color: 'var(--primary)' }}>Play</span>Tester
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            <Link to="/dashboard" className={`sidebar-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                <LayoutDashboard size={20} /> Dashboard
            </Link>
            <Link to="/test-pool" className={`sidebar-link ${location.pathname === '/test-pool' ? 'active' : ''}`}>
                <PlayCircle size={20} /> Uygulama Havuzu
            </Link>
            <Link to="/add-app" className={`sidebar-link ${location.pathname === '/add-app' ? 'active' : ''}`}>
                <PlusCircle size={20} /> Uygulama Ekle
            </Link>
            <Link to="/chat" className={`sidebar-link ${location.pathname === '/chat' ? 'active' : ''}`}>
                <MessageSquare size={20} /> Topluluk Sohbet
            </Link>
            {isAdmin && (
                <Link to="/admin" className={`sidebar-link ${location.pathname === '/admin' ? 'active' : ''}`} style={{ color: '#fbbf24', background: 'rgba(251, 191, 36, 0.05)' }}>
                    <ShieldAlert size={20} /> Admin Paneli
                </Link>
            )}
        </nav>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link to="/settings" className={`sidebar-link ${location.pathname === '/settings' ? 'active' : ''}`}>
                <Settings size={20} /> Ayarlar
            </Link>
            <button onClick={onLogout} className="sidebar-link" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ff6b6b', justifyContent: 'flex-start' }}>
                <LogOut size={20} /> Çıkış Yap
            </button>
        </div>
    </aside>
);

const AddApp = ({ user, onLogout, credits = 0, isAdmin }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [step, setStep] = useState(1);
    const [done, setDone] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        category: 'Oyun',
        storeLink: '',
        groupLink: ''
    });

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const handleSubmit = async () => {
        if (!user || loading) return;
        
        setLoading(true);
        const userRef = doc(db, 'users', user.uid);
        const appsCollectionRef = collection(db, 'apps');

        try {
            await runTransaction(db, async (transaction) => {
                // 1. Kullanıcı dökümanını kontrol et
                const userSnap = await transaction.get(userRef);
                
                if (!userSnap.exists()) {
                    throw new Error("Kullanıcı kaydınız bulunamadı. Lütfen tekrar giriş yapın.");
                }

                const userData = userSnap.data();
                const currentCredits = userData.credits || 0;

                // 2. Kredi kontrolü
                if (currentCredits < 20) {
                    throw new Error(`Yetersiz kredi! Gereken: 20, Mevcut: ${currentCredits}`);
                }

                // 3. Uygulama dökümanı ID'sini önceden al
                const newAppRef = doc(appsCollectionRef);

                // 4. Uygulamayı havuza ekle
                transaction.set(newAppRef, {
                    ownerId: user.uid,
                    ownerName: user.displayName || user.email.split('@')[0],
                    name: formData.title,
                    category: formData.category,
                    storeLink: formData.storeLink,
                    groupLink: formData.groupLink,
                    icon: '🚀',
                    color: 'var(--primary)',
                    testDay: 0,
                    testersCount: 0,
                    createdAt: serverTimestamp(),
                    status: 'active',
                    reward: 5
                });

                // 5. Kullanıcı kredisini düş ve listesine ekle
                transaction.update(userRef, {
                    credits: increment(-20),
                    myApps: arrayUnion({
                        id: newAppRef.id,
                        name: formData.title,
                        icon: '🚀',
                        color: 'var(--primary)',
                        testDay: 0,
                        testersCount: 0,
                        status: 'active'
                    })
                });
            });

            console.log("İşlem başarıyla tamamlandı!");
            setDone(true);
        } catch (error) {
            console.error("İŞLEM HATASI:", error);
            alert("Hata: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (done) {
        return (
            <div className="dashboard-layout">
                <div className="gradient-bg"></div>
                <Sidebar onLogout={onLogout} location={location} isAdmin={isAdmin} />
                <main className="dashboard-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                        <CheckCircle2 size={80} color="#4ade80" style={{ marginBottom: '1.5rem' }} />
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Uygulama Eklendi! 🎉</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '400px' }}>
                            <strong style={{ color: 'white' }}>{formData.title}</strong> başarıyla havuza eklendi. Test süreci başladı!
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button onClick={() => navigate('/dashboard')} className="btn-primary">Dashboard'a Git</button>
                            <button onClick={() => { setDone(false); setStep(1); setFormData({ title: '', category: 'Oyun', storeLink: '', groupLink: '' }); }} className="btn-outline">Yeni Ekle</button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            <div className="gradient-bg"></div>

            <Sidebar onLogout={onLogout} location={location} isAdmin={isAdmin} />

            <main className="dashboard-main">
                <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                    <header style={{ marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Uygulamanı Ekle</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Test sürecini başlatmak için uygulama bilgilerini gir.</p>
                    </header>

                    {/* Steps indicator */}
                    <div style={{ display: 'flex', gap: '0', marginBottom: '3rem' }}>
                        {[
                            { n: 1, label: 'Temel Bilgi', icon: <Info size={16} /> },
                            { n: 2, label: 'Store Linki', icon: <Globe size={16} /> },
                            { n: 3, label: 'Tester Erişimi', icon: <Users size={16} /> },
                        ].map((s, i) => (
                            <React.Fragment key={s.n}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '50%',
                                        background: step >= s.n ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'all 0.3s ease', fontWeight: 'bold',
                                        border: step === s.n ? '2px solid rgba(255,255,255,0.4)' : 'none'
                                    }}>
                                        {s.icon}
                                    </div>
                                    <span style={{ fontSize: '0.75rem', color: step >= s.n ? 'var(--text-main)' : 'var(--text-muted)' }}>{s.label}</span>
                                </div>
                                {i < 2 && (
                                    <div style={{ flex: 2, height: '2px', background: step > s.n ? 'var(--primary)' : 'rgba(255,255,255,0.1)', alignSelf: 'flex-start', marginTop: '20px', transition: 'all 0.3s ease' }} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    <div className="glass card" style={{ padding: '2.5rem' }}>
                        {step === 1 && (
                            <div>
                                <h3 style={{ marginBottom: '2rem' }}>Temel Bilgiler</h3>
                                <div className="form-group">
                                    <label>Uygulama Adı *</label>
                                    <input
                                        type="text"
                                        placeholder="Örn: My Super App"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        autoFocus
                                    />
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>Kategori</label>
                                        <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                                            <option>Oyun</option>
                                            <option>Araçlar</option>
                                            <option>Sosyal</option>
                                            <option>Eğitim</option>
                                            <option>Eğlence</option>
                                            <option>Finans</option>
                                            <option>Sağlık ve Fitness</option>
                                            <option>Alışveriş</option>
                                            <option>Yaşam Tarzı</option>
                                            <option>İş</option>
                                            <option>Müzik</option>
                                            <option>Fotoğrafçılık</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Platform</label>
                                        <input type="text" value="Android (Google Play)" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                    <button className="btn-primary" onClick={nextStep} disabled={!formData.title}>Devam Et →</button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div>
                                <h3 style={{ marginBottom: '2rem' }}>Google Play Store Linki</h3>
                                <div className="form-group">
                                    <label>Kapalı Test Linki *</label>
                                    <input
                                        type="url"
                                        placeholder="https://play.google.com/store/apps/details?id=..."
                                        value={formData.storeLink}
                                        onChange={(e) => setFormData({ ...formData, storeLink: e.target.value })}
                                        autoFocus
                                    />
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                        Uygulamanın Play Console'da "Kapalı Test" aşamasında olması gerekir.
                                    </p>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                                    <button className="btn-outline" onClick={prevStep}>← Geri</button>
                                    <button className="btn-primary" onClick={nextStep} disabled={!formData.storeLink}>Devam Et →</button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div>
                                <h3 style={{ marginBottom: '2rem' }}>Tester Erişimi</h3>
                                <div className="form-group">
                                    <label>Google Group Katılım Linki</label>
                                    <input
                                        type="url"
                                        placeholder="https://groups.google.com/g/..."
                                        value={formData.groupLink}
                                        onChange={(e) => setFormData({ ...formData, groupLink: e.target.value })}
                                        autoFocus
                                    />
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                        Testerlar bu link üzerinden gruba katılarak uygulamanı indirebilir.
                                    </p>
                                </div>

                                <div className="glass" style={{ padding: '1.25rem', marginBottom: '1.5rem', borderLeft: '3px solid var(--primary)', borderRadius: '0.5rem' }}>
                                    <strong>Özet</strong>
                                    <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                        <div>📱 <strong style={{ color: 'white' }}>{formData.title}</strong> — {formData.category}</div>
                                        <div>🏪 Play Store linki eklendi</div>
                                        <div>💸 20 kredi havuza gönderilecek</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <button className="btn-outline" onClick={prevStep}>← Geri</button>
                                    <button 
                                        className="btn-primary" 
                                        onClick={handleSubmit} 
                                        disabled={loading}
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                    >
                                        {loading ? 'Bekleyin...' : '🚀 Yayına Al'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AddApp;
