import React, { useState, useEffect } from 'react';
import { LayoutDashboard, PlusCircle, PlayCircle, Search, Star, ShieldCheck, X, ExternalLink, Loader2, CheckCircle2, MessageSquare, Camera, Upload, AlertCircle, Settings, LogOut, ShieldAlert } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { db, storage } from './firebase';
import { collection, onSnapshot, query, where, doc, updateDoc, increment, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import Tesseract from 'tesseract.js';

// Yerel Sidebar kaldırıldı

const TestPool = ({ user, credits = 0, onLogout, isAdmin }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string }
    const [testingApp, setTestingApp] = useState(null);
    const [joinedApps, setJoinedApps] = useState([]);
    const [poolApps, setPoolApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [screenshot, setScreenshot] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [aiStatus, setAiStatus] = useState(null); // 'analyzing', 'success', 'failed'

    const filteredApps = poolApps.filter(app => {
        const name = app.name || '';
        const category = app.category || '';
        const search = searchQuery.toLowerCase();
        return name.toLowerCase().includes(search) || category.toLowerCase().includes(search);
    });

    useEffect(() => {
        if (!user) return;

        // 1. Havuzdaki tüm aktif uygulamaları çek
        const q = query(collection(db, 'apps'), where('status', '==', 'active'));
        const unsub = onSnapshot(q, (snapshot) => {
            const apps = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(app => app.ownerId !== user?.uid);
            setPoolApps(apps);
            setLoading(false);
        });

        // 2. Kullanıcının katıldığı testleri detaylı çek
        const qMyTests = query(collection(db, 'tests'), where('testerId', '==', user.uid));
        const unsubTests = onSnapshot(qMyTests, (snapshot) => {
            const myTests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setJoinedApps(myTests);
        });

        return () => { unsub(); unsubTests(); };
    }, [user]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setScreenshot(file);
            setPreviewUrl(URL.createObjectURL(file));

            // AI Analizini Başlat
            setAiStatus('analyzing');
            try {
                const { data: { text } } = await Tesseract.recognize(file, 'eng+tur');
                const rawText = text.toLowerCase();
                const appName = testingApp?.name?.toLowerCase() || '';

                // ESNEK KONTROL: 
                // 1. Uygulama adını kelimelere böl (örn: "Retro Takvim" -> ["retro", "takvim"])
                // 2. OCR bazen 'o' yerine '0' veya 'i' yerine 'l' okuyabilir. 
                // 3. Kelimelerden herhangi biri veya belli bir parçası geçiyorsa kabul et.
                const appWords = appName.split(' ').filter(word => word.length > 2);

                let isMatch = rawText.includes(appName); // Tam eşleşme varsa zaten ok

                if (!isMatch) {
                    // Kelime bazlı kontrol
                    isMatch = appWords.some(word => rawText.includes(word));
                }

                if (isMatch) {
                    setAiStatus('success');
                } else {
                    setAiStatus('failed');
                }
            } catch (err) {
                console.error("AI Analiz hatası:", err);
                setAiStatus(null);
            }
        }
    };

    const handleTestEt = (app) => {
        setTestingApp(app);
    };

    const handleJoinTest = async (app) => {
        if (!user) return;
        setUploading(true);
        try {
            await addDoc(collection(db, 'tests'), {
                appId: app.id,
                appName: app.name,
                testerId: user.uid,
                testerName: user.displayName || user.email.split('@')[0],
                ownerId: app.ownerId,
                status: 'active', // Direkt aktif başlatıyoruz
                proofCount: 0,
                startedAt: serverTimestamp(),
                lastProofAt: null,
                reward: app.reward || 5
            });
            setTestingApp(null);
            setFeedback({ type: 'success', message: "Teste başarıyla katıldınız! Lütfen 14 gün boyunca her gün uygulamayı açıp kanıt gönderin. 🎉" });
            setTimeout(() => setFeedback(null), 5000);
        } catch (error) {
            setFeedback({ type: 'error', message: "Hata: " + error.message });
        } finally {
            setUploading(false);
        }
    };

    const handleUploadProof = async (app, testId) => {
        if (!user || !screenshot || !testId) {
            setFeedback({ type: 'error', message: "Eksik bilgi: Kanıt dosyası veya Test ID bulunamadı." });
            return;
        }

        const myTestData = joinedApps.find(t => t.id === testId);
        const lastProof = myTestData?.lastProofAt?.toDate();
        const isProofToday = lastProof && new Date().toDateString() === lastProof.toDateString();

        if (isProofToday) {
            setFeedback({ type: 'error', message: "Bugün zaten kanıt gönderdiniz! Sayaç günde sadece 1 kez artar. Yarın tekrar bekleriz." });
            return;
        }

        if (aiStatus !== 'success') {
            setFeedback({ type: 'error', message: "AI henüz doğrulamayı tamamlamadı veya görüntüyü tanıyamadı. Lütfen uygulama isminin net göründüğü bir ekran görüntüsü yükleyin." });
            return;
        }

        setUploading(true);
        setFeedback({ type: 'info', message: "Görsel AI tarafından doğrulanıyor..." });

        try {
            // ARTIK GÖRSEL SAKLAMIYORUZ (Sistem otomatik onayladığı için)
            // Sadece test dökümanını güncelliyoruz
            const testRef = doc(db, 'tests', testId);
            const newProofCount = (myTestData?.proofCount || 0) + 1;

            const updateData = {
                lastProofAt: serverTimestamp(),
                proofCount: increment(1),
                aiVerified: true,
                status: newProofCount >= 14 ? 'completed' : 'approved',
                screenshotUrl: "verified_by_ai" // Görsel saklamıyoruz, sadece onay bilgisi
            };

            await updateDoc(testRef, updateData);

            // GÜNLÜK ÖDÜL SİSTEMİ
            const dailyReward = Number(((app.reward || 5) / 14).toFixed(2));
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                credits: increment(dailyReward)
            });

            if (newProofCount >= 14) {
                setFeedback({ type: 'success', message: `TEBRİKLER! 14 günlük testi tamamladınız! 🎁🎉` });
            } else {
                setFeedback({ type: 'success', message: `Günlük ödülünüz (+${dailyReward}) eklendi ve AI tarafından onaylandı! 🚀` });
            }

            setTestingApp(null);
            setScreenshot(null);
            setPreviewUrl(null);
            setAiStatus(null);
        } catch (error) {
            console.error("Doğrulama hatası:", error);
            setFeedback({ type: 'error', message: "Hata: " + error.message });
        } finally {
            setUploading(false);
            setTimeout(() => setFeedback(null), 5000);
        }
    };

    return (
        <div className="dashboard-layout">
            <div className="gradient-bg"></div>

            <Sidebar onLogout={onLogout} location={location} isAdmin={isAdmin} />

            {/* Bildirim Alanı */}
            {feedback && (
                <div style={{
                    position: 'fixed',
                    top: '2rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 9999,
                    padding: '1rem 2rem',
                    borderRadius: '1rem',
                    background: feedback.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : (feedback.type === 'success' ? 'rgba(34, 197, 94, 0.95)' : 'rgba(99, 102, 241, 0.95)'),
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(10px)',
                    animation: 'fadeInOut 5s forwards',
                    fontWeight: 'bold'
                }}>
                    {feedback.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                    {feedback.message}
                    <button onClick={() => setFeedback(null)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '4px' }}>✕</button>
                </div>
            )}

            <main className="dashboard-main">
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Uygulama Havuzu</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Test ederek kredi kazan ve topluluğa destek ol.</p>
                    </div>
                    <div className="glass" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Star size={18} color="#fbbf24" fill="#fbbf24" />
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mevcut Kredi</div>
                            <div style={{ fontWeight: 'bold', color: '#fbbf24' }}>{Number(credits).toFixed(2)} 🪙</div>
                        </div>
                    </div>
                </header>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <div className="glass" style={{ flex: 1, padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderRadius: '0.75rem' }}>
                        <Search size={20} color="var(--text-muted)" />
                        <input
                            type="text"
                            placeholder="Uygulama adı veya kategori ara..."
                            style={{ background: 'transparent', border: 'none', padding: 0, flex: 1, color: 'white', outline: 'none' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {filteredApps.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                        <p>"{searchQuery}" için sonuç bulunamadı.</p>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {filteredApps.map(app => {
                        const myTestData = joinedApps.find(t => t.appId === app.id);
                        const isJoined = !!myTestData;
                        const proofCount = myTestData?.proofCount || 0;
                        const lastProof = myTestData?.lastProofAt?.toDate();
                        const isProofToday = lastProof && new Date().toDateString() === lastProof.toDateString();

                        return (
                            <div key={app.id} className="glass card feature-card" style={{ margin: 0, padding: '1.5rem', opacity: isJoined && proofCount >= 14 ? 0.6 : 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                    <div style={{ fontSize: '2.5rem' }}>{app.icon}</div>
                                    <div style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '2rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                        {app.category}
                                    </div>
                                </div>

                                <h3 style={{ marginBottom: '0.5rem' }}>{app.name}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                    <ShieldCheck size={16} color="#10b981" />
                                    <span>{app.ownerName}</span>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Mevcut Tester:</span>
                                        <span>{app.testersCount || 0}/15</span>
                                    </div>
                                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
                                        <div style={{ width: `${((app.testersCount || 0) / 15) * 100}%`, height: '100%', background: 'var(--primary)', borderRadius: '3px', transition: 'width 0.3s ease' }}></div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>İlerleme (14 Gün):</span>
                                        <span style={{ color: isJoined && !isProofToday ? '#f87171' : 'inherit' }}>
                                            {proofCount}/14 {isJoined && !isProofToday && '⚠️'}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ödül</div>
                                        <div style={{ fontWeight: 'bold', color: '#fbbf24' }}>+{app.reward || 5} Kredi</div>
                                    </div>
                                    {isJoined ? (
                                        <button
                                            onClick={() => !isProofToday && proofCount < 14 && handleTestEt(app)}
                                            className="btn-outline"
                                            disabled={isProofToday || proofCount >= 14}
                                            style={{
                                                padding: '0.6rem 1.2rem',
                                                borderColor: (isProofToday || proofCount >= 14) ? '#10b981' : '#f87171',
                                                color: (isProofToday || proofCount >= 14) ? '#10b981' : '#f87171',
                                                cursor: (isProofToday || proofCount >= 14) ? 'default' : 'pointer',
                                                opacity: (isProofToday || proofCount >= 14) ? 0.7 : 1
                                            }}
                                        >
                                            {proofCount >= 14 ? 'Tamamlandı ✅' : (isProofToday ? 'Günlük Kanıt Tamam' : 'Günlük Kanıt Gerekli!')}
                                        </button>
                                    ) : (
                                        <button onClick={() => handleTestEt(app)} className="btn-primary" style={{ padding: '0.6rem 1.2rem' }}>Teste Katıl</button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            {testingApp && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="glass" style={{ width: '520px', padding: '2.5rem', borderRadius: '1.5rem', position: 'relative' }}>
                        <button onClick={() => { setTestingApp(null); setPreviewUrl(null); setAiStatus(null); }} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>

                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{testingApp.icon}</div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{testingApp.name}</h3>
                            <p style={{ color: 'var(--text-muted)' }}>{joinedApps.find(t => t.appId === testingApp.id) ? 'Günlük Kanıt Gönder' : 'Test etmek için aşağıdaki adımları uygula'}</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                            {/* Adım 1 ve 2 her zaman gösterilir */}
                            <div className="glass" style={{ padding: '1rem', borderRadius: '0.75rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>1</div>
                                <div>
                                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Google Gruba Katıl</div>
                                    <a href={testingApp.groupLink} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        Gruba Git <ExternalLink size={12} />
                                    </a>
                                </div>
                            </div>
                            <div className="glass" style={{ padding: '1rem', borderRadius: '0.75rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>2</div>
                                <div>
                                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Play Store'dan Yükle</div>
                                    <a href={testingApp.storeLink} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        Mağazaya Git <ExternalLink size={12} />
                                    </a>
                                </div>
                            </div>

                            {/* Adım 3: Sadece katıldıktan sonra kanıt ister */}
                            {joinedApps.find(t => t.appId === testingApp.id) && (
                                <div className="glass" style={{ padding: '1rem', borderRadius: '0.75rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                    <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>3</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Günlük Kanıt Yükle</div>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Bugün uygulamayı açtığına dair ekran görüntüsü yükle.</p>

                                        <label className="glass" style={{
                                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                                            padding: '1.5rem', borderRadius: '1rem', border: '2px dashed rgba(255,255,255,0.1)',
                                            cursor: 'pointer', transition: 'all 0.3s'
                                        }}>
                                            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                                            {previewUrl ? (
                                                <div style={{ position: 'relative', width: '100%' }}>
                                                    <img src={previewUrl} alt="Preview" style={{ width: '100%', maxHeight: '150px', objectFit: 'contain', borderRadius: '8px' }} />
                                                    {aiStatus === 'analyzing' && (
                                                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                                            <Loader2 className="animate-spin" size={24} color="white" />
                                                            <span style={{ fontSize: '0.75rem', color: 'white' }}>AI Analiz Ediyor...</span>
                                                        </div>
                                                    )}
                                                    {aiStatus === 'success' && (
                                                        <div style={{ position: 'absolute', bottom: '5px', right: '5px', background: '#4ade80', color: 'black', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                            <CheckCircle2 size={12} /> AI Onaylı
                                                        </div>
                                                    )}
                                                    {aiStatus === 'failed' && (
                                                        <div style={{ position: 'absolute', bottom: '5px', right: '5px', background: '#f87171', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                            <AlertCircle size={12} /> AI Tespit Edemedi
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <>
                                                    <Camera size={24} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
                                                    <span style={{ fontSize: '0.8rem' }}>Ekran Görüntüsü Seç</span>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => { setTestingApp(null); setPreviewUrl(null); }} className="btn-outline" style={{ flex: 1 }}>Vazgeç</button>
                            {joinedApps.find(t => t.appId === testingApp.id) ? (
                                <button
                                    onClick={() => {
                                        const currentTest = joinedApps.find(t => t.appId === testingApp.id);
                                        handleUploadProof(testingApp, currentTest?.id);
                                    }}
                                    className="btn-primary"
                                    style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    disabled={uploading || !screenshot}
                                >
                                    {uploading ? <Loader2 className="animate-spin" size={18} /> : 'Kanıtı Gönder'}
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleJoinTest(testingApp)}
                                    className="btn-primary"
                                    style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    disabled={uploading}
                                >
                                    {uploading ? <Loader2 className="animate-spin" size={18} /> : 'Teste Şimdi Başla'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TestPool;
