import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { logOut } from './firebase';
import { doc, getDoc, setDoc, onSnapshot, updateDoc, arrayUnion, query, collection, where, getDocs, serverTimestamp } from 'firebase/firestore';
import Login from './Login';
import Dashboard from './Dashboard';
import AddApp from './AddApp';
import TestPool from './TestPool';
import SettingsPage from './SettingsPage';
import Chat from './Chat';
import AdminPanel from './AdminPanel';
import AdminAuth from './AdminAuth';
import Support from './Support';
import { updateProfile } from 'firebase/auth';

const ADMIN_EMAIL = "farukrmak75@gmail.com";

const LandingPage = () => (
  <div className="app">
    <div className="gradient-bg"></div>

    <nav className="container" style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ color: 'var(--primary)' }}>Play</span>Tester
      </div>
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <a href="#how-it-works" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Nasıl Çalışır?</a>
        <Link to="/login" className="btn-primary" style={{ textDecoration: 'none' }}>Giriş Yap</Link>
      </div>
    </nav>

    <main className="container">
      <section className="hero">
        <h1>Uygulamanı Birlikte <br /> <span style={{ color: 'var(--primary)' }}>Yayınlayalım</span></h1>
        <p>
          Google Play'in 14 gün ve 12 test kullanıcısı kuralını aşmak artık çok kolay.
          Geliştiriciler birbirlerine yardım eder, uygulamalar yayına hazır hale gelir.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/login" className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', textDecoration: 'none' }}>Test Etmeye Başla</Link>
          <Link to="/login" className="btn-outline" style={{ padding: '1rem 2rem', fontSize: '1.1rem', textDecoration: 'none' }}>Uygulamamı Ekle</Link>
        </div>
      </section>

      <section id="how-it-works" className="features">
        <div className="feature-card glass">
          <div className="feature-icon">👥</div>
          <h3>P2P Yardımlaşma</h3>
          <p>Bir başkasının uygulamasını test et, karşılığında kendi uygulaman için test kullanıcıları kazan.</p>
        </div>
        <div className="feature-card glass">
          <div className="feature-icon">🛡️</div>
          <h3>Güvenli Doğrulama</h3>
          <p>Test süreçleri ekran görüntüleri ve günlük check-in'ler ile sistem tarafından takip edilir.</p>
        </div>
        <div className="feature-card glass">
          <div className="feature-icon">⚡</div>
          <h3>Hızlı Onay</h3>
          <p>14 günlük süreci eksiksiz tamamla, Play Store Console'da kapalı test aşamasını başarıyla geç.</p>
        </div>
      </section>

      <section style={{ padding: '6rem 1rem', maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '4rem', fontSize: '2.5rem' }}>Sistem Nasıl Çalışır?</h2>

        <style>
          {`
            .zigzag-row { display: flex; align-items: center; gap: 4rem; margin-bottom: 5rem; }
            .zigzag-row.reverse { flex-direction: row-reverse; }
            .zigzag-content { flex: 1; }
            .zigzag-image { flex: 0.8; display: flex; justify-content: center; position: relative; }
            .zigzag-icon { 
              width: 140px; height: 140px; 
              background: rgba(255, 255, 255, 0.03); 
              border-radius: 50%; 
              display: flex; align-items: center; justify-content: center; 
              font-size: 4rem; 
              box-shadow: 0 8px 32px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.1); 
              position: relative;
              z-index: 2;
            }
            .glow-effect {
              position: absolute;
              width: 100%; height: 100%;
              border-radius: 50%;
              filter: blur(40px);
              z-index: 1;
              opacity: 0.4;
            }
            .step-badge {
              display: inline-block; padding: 0.25rem 0.75rem; 
              border-radius: 2rem; font-size: 0.8rem; font-weight: bold; 
              margin-bottom: 1rem;
              background: rgba(255,255,255,0.1);
            }
            @media (max-width: 768px) {
              .zigzag-row, .zigzag-row.reverse { flex-direction: column; text-align: center; gap: 2rem; margin-bottom: 4rem; }
              .zigzag-image { order: -1; } /* Always show image first on mobile */
              .step-badge { margin-left: auto; margin-right: auto; }
            }
          `}
        </style>

        {/* 1. Step: Kurulum & Topluluk */}
        <div className="zigzag-row">
          <div className="zigzag-content">
            <div className="step-badge" style={{ color: '#06b6d4', background: 'rgba(6, 182, 212, 0.1)' }}>1. ADIM</div>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Topluluk Grubu Stresine Son</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', fontSize: '1.1rem', marginBottom: '1rem' }}>
              Test kullanıcılarını toplamak için kendi grubunuzu kurmanız gerekmez. Platformun sunduğu <strong>Ortak Topluluk Grubunu</strong> (playtester_community_tr@googlegroups.com) Play Console'a ekleyin. Havuzdaki herkes uygulamanıza tek tıkla entegre olsun.
            </p>
          </div>
          <div className="zigzag-image">
            <div className="glow-effect" style={{ background: '#06b6d4' }}></div>
            <div className="zigzag-icon">👥</div>
          </div>
        </div>

        {/* 2. Step: Senkronizasyon (Pending Review) */}
        <div className="zigzag-row reverse">
          <div className="zigzag-content">
            <div className="step-badge" style={{ color: '#fbbf24', background: 'rgba(251, 191, 36, 0.1)' }}>2. ADIM</div>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Play Store Onay Senkronizasyonu</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', fontSize: '1.1rem', marginBottom: '1rem' }}>
              Uygulamanız Google tarafından onaylanıp teste açılana kadar süreci donduruyoruz. Test kullanıcıları havuzunuzda toplanır ancak siz panelinizden <strong>"Testi Başlat"</strong> diyene kadar kimse sistemden kanıt yollayıp süreci başlatamaz. 14 günlük zorunlu takvimi tam siz istediğiniz an başlatırız.
            </p>
          </div>
          <div className="zigzag-image">
            <div className="glow-effect" style={{ background: '#fbbf24' }}></div>
            <div className="zigzag-icon">⏳</div>
          </div>
        </div>

        {/* 3. Step: AI ve Hile Koruması */}
        <div className="zigzag-row">
          <div className="zigzag-content">
            <div className="step-badge" style={{ color: '#4ade80', background: 'rgba(74, 222, 128, 0.1)' }}>3. ADIM</div>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Yapay Zeka (AI) Doğrulaması</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', fontSize: '1.1rem', marginBottom: '1rem' }}>
              Eski tip manuel ekran görüntüsü onaylamalarına veda edin. Test eden kişilerin gönderdiği her ekran görüntüsü <strong>Tesseract AI Motoru</strong> tarafından OCR ile okunur. Yapay zeka, uygulamanızın ismini görselde bulur ve onayı otomatik verir. Sahte veya eski fotoğraflar anında reddedilir.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
              <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.8rem', borderRadius: '1rem' }}>Kriptografik Görsel Hash'leme</span>
              <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.8rem', borderRadius: '1rem' }}>24 Saat Zaman Damgası Kontrolü</span>
            </div>
          </div>
          <div className="zigzag-image">
            <div className="glow-effect" style={{ background: '#4ade80' }}></div>
            <div className="zigzag-icon">🤖</div>
          </div>
        </div>

        {/* 4. Step: Kredi ve Ödül */}
        <div className="zigzag-row reverse">
          <div className="zigzag-content">
            <div className="step-badge" style={{ color: '#a855f7', background: 'rgba(168, 85, 247, 0.1)' }}>4. ADIM</div>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Otomatik Kredi ve Ödül Sistemi</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', fontSize: '1.1rem', marginBottom: '1rem' }}>
              Testerlar 14 gün boyunca her gün uygulamayı açar ve AI destekli panele kanıt düşer. Günlük görev tamamlandıkça krediler testerların hesaplarına <strong>otomatik yatar</strong>. Siz arkanıza yaslanırsınız, 14 gün bittiğinde uygulamanız yayınlamaya hazır hale gelir!
            </p>
          </div>
          <div className="zigzag-image">
            <div className="glow-effect" style={{ background: '#a855f7' }}></div>
            <div className="zigzag-icon">💎</div>
          </div>
        </div>
      </section>

      {/* Ek Bilgilendirme ve Kurallar Bölümü (Zigzag) */}
      <section style={{ padding: '0 1rem 6rem 1rem', maxWidth: '1000px', margin: '0 auto' }}>

        {/* 5. Step: Google Konsol Kurulumu */}
        <div className="zigzag-row">
          <div className="zigzag-content">
            <div className="step-badge" style={{ color: '#06b6d4', background: 'rgba(6, 182, 212, 0.1)' }}>5. ADIM</div>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Play Console Kurulumu (3 Basit Adım)</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
              Topluluk grubumuzu kullanmak ve havuzdaki testerları uygulamanıza entegre etmek için Play Console panelinizde şu işlemleri yapmanız yeterlidir:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem', borderLeft: '3px solid #06b6d4' }}>
                <strong style={{ color: '#06b6d4' }}>1. Adım:</strong> Play Console'da <strong>"Test" &gt; "Kapalı Test"</strong> bölümüne gidin ve ilgili kanalı yönetin.
              </div>
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem', borderLeft: '3px solid #06b6d4' }}>
                <strong style={{ color: '#06b6d4' }}>2. Adım:</strong> <strong>"Test Kullanıcıları"</strong> sekmesine tıklayın ve "E-posta Listesi Oluştur" deyin.
              </div>
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem', borderLeft: '3px solid #06b6d4' }}>
                <strong style={{ color: '#06b6d4' }}>3. Adım:</strong> E-posta listesine şunu ekleyin: <br />
                <code style={{ display: 'inline-block', marginTop: '0.5rem', padding: '0.4rem 0.8rem', background: 'rgba(0,0,0,0.3)', borderRadius: '0.5rem', color: '#06b6d4' }}>playtester_community_tr@googlegroups.com</code>
              </div>
            </div>
          </div>
          <div className="zigzag-image">
            <div className="glow-effect" style={{ background: '#06b6d4' }}></div>
            <div className="zigzag-icon">⚙️</div>
          </div>
        </div>

        {/* 6. Step: Kurallar ve Cezalar */}
        <div className="zigzag-row reverse">
          <div className="zigzag-content">
            <div className="step-badge" style={{ color: '#f87171', background: 'rgba(248, 113, 113, 0.1)' }}>ÖNEMLİ KURALLAR</div>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Adil Kullanım ve Cezalar</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
              Topluluğun emeğini korumak için katı kurallarımız vardır. 14 günü tamamlamadan testi bırakmak veya uygulamayı silmek ceza puanı almanıza neden olur.
            </p>
            <ul style={{ lineHeight: '1.7', color: 'var(--text-muted)', marginLeft: '1.2rem', fontSize: '1.05rem' }}>
              <li style={{ marginBottom: '0.8rem' }}><strong>Hesap Silme:</strong> Kuralları aşmak amacıyla hesabını silenler 14 gün boyunca aynı e-posta ile kayıt olamazlar.</li>
              <li style={{ marginBottom: '0.8rem' }}><strong>Yanıltıcı Kanıt:</strong> Sahte veya alakasız ekran görüntüsü gönderen hesaplar süresiz yasaklanabilir.</li>
              <li>Süreç kesintisiz tamamlandığında testerlar büyük ödüllerini alır, geliştirici Play Store onayını sorunsuz alır. Birlikte kazanırız!</li>
            </ul>
          </div>
          <div className="zigzag-image">
            <div className="glow-effect" style={{ background: '#f87171' }}></div>
            <div className="zigzag-icon">⚖️</div>
          </div>
        </div>

      </section>
    </main >

    <footer className="container" style={{ padding: '4rem 2rem', borderTop: '1px solid var(--glass-border)', marginTop: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
      <p>© 2026 PlayTester Community. Geliştiriciler tarafından geliştiriciler için yapıldı.</p>
    </footer>
  </div >
);

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(() => {
    return localStorage.getItem('maintenance_mode') === 'true';
  });
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [credits, setCredits] = useState(() => {
    const saved = localStorage.getItem('user_credits');
    return saved ? parseFloat(saved) : 0;
  });
  const [myApps, setMyApps] = useState([]);
  const [isBanned, setIsBanned] = useState(false);
  const [blacklistData, setBlacklistData] = useState(null);
  const [profileData, setProfileData] = useState({ name: '', bio: '' });

  // 1. Bakım Modu Dinleyicisi (Bağımsız + Anlık Event)
  useEffect(() => {
    // Firestore Dinleyicisi
    const settingsRef = doc(db, 'settings', 'site_settings');
    const unsubFirestore = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        const mode = docSnap.data().maintenanceMode || false;
        setMaintenanceMode(mode);
        localStorage.setItem('maintenance_mode', mode);
      }
    });

    // Anlık Event Dinleyicisi (AdminPanel'den gelen)
    const handleInstantUpdate = (e) => {
      const mode = e.detail;
      setMaintenanceMode(mode);
      localStorage.setItem('maintenance_mode', mode);
      console.log("Anlık bakım modu güncellemesi:", mode);
    };

    window.addEventListener('maintenance_update', handleInstantUpdate);

    return () => {
      unsubFirestore();
      window.removeEventListener('maintenance_update', handleInstantUpdate);
    };
  }, []);

  // 2. Auth ve Kullanıcı Verisi Dinleyicisi
  useEffect(() => {
    let unsubFirestore = null;

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Önceki listener'ı temizle
      if (unsubFirestore) {
        unsubFirestore();
        unsubFirestore = null;
      }

      setUser(firebaseUser);
      setAuthLoading(false);

      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);

        unsubFirestore = onSnapshot(userRef, async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();

            // Eğer admin tarafından silinmişse anında oturumu kapat
            if (data.isDeleted) {
              logOut();
              return;
            }

            setCredits(data.credits || 0);
            setMyApps(data.myApps || []);
            setIsBanned(data.isBanned || false);
            setProfileData({
              name: data.displayName || firebaseUser.displayName || firebaseUser.email.split('@')[0],
              bio: data.bio || ''
            });
            localStorage.setItem('user_credits', data.credits || 0);
          } else {
            // Belge yoksa veya silinmişse otomatik oluşturmayı dene (Sadece bir kez)
            try {
              console.log("Kullanıcı kaydı eksik, oluşturuluyor...");
              // Karaliste kontrolü (küçük harf ile)
              const qB = query(collection(db, 'blacklist'), where('email', '==', firebaseUser.email.toLowerCase()), where('status', '==', 'active'));
              const bSnap = await getDocs(qB);

              if (bSnap.empty) {
                await setDoc(userRef, {
                  credits: 20,
                  myApps: [],
                  isBanned: false,
                  email: firebaseUser.email.toLowerCase(),
                  displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                  lastSeen: serverTimestamp(),
                  createdAt: serverTimestamp()
                });
              } else {
                // Eğer kara listedeyse oturumu kapat
                console.log("Kullanıcı kara listede, erişim reddedildi.");
                logOut();
              }
            } catch (err) {
              console.error("Otomatik kullanıcı oluşturma hatası:", err);
            }
          }
        }, (err) => {
          console.error("User data sync error:", err);
        });

      } else {
        setCredits(0);
        setMyApps([]);
        setIsBanned(false);
        setBlacklistData(null);
        localStorage.removeItem('user_credits');
      }
    });

    const onlineTimer = setInterval(() => {
      if (auth.currentUser) {
        updateDoc(doc(db, 'users', auth.currentUser.uid), {
          lastSeen: serverTimestamp()
        }).catch(err => console.error("lastSeen update failed:", err));
      }
    }, 120000);

    return () => {
      unsubAuth();
      if (unsubFirestore) unsubFirestore();
      clearInterval(onlineTimer);
    };
  }, []);

  const handleLogin = (firebaseUser) => setUser(firebaseUser);

  const handleLogout = async () => {
    sessionStorage.removeItem('admin-auth');
    await logOut();
  };

  const handleAddCredits = async (amount) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      credits: (credits || 0) + amount
    });
  };

  const handleAddApp = async (app) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      myApps: arrayUnion(app)
    });
  };

  const isActuallyAdmin = user?.email === ADMIN_EMAIL;

  const sharedProps = {
    user,
    credits,
    myApps,
    onLogout: handleLogout,
    onAddCredits: handleAddCredits,
    onAddApp: handleAddApp,
    isAdmin: isActuallyAdmin,
    isBanned: isBanned,
    profile: profileData,
  };

  const MaintenanceScreen = () => (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
      <div className="gradient-bg"></div>
      <div className="glass" style={{ padding: '3rem', borderRadius: '2rem', textAlign: 'center', maxWidth: '500px', width: '90%' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🛠️</div>
        <h1 style={{ color: '#fbbf24', marginBottom: '1rem' }}>Sistem Bakımda</h1>
        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '2rem', fontSize: '1.1rem' }}>
          Sitemizde şu an planlı bir kalite ve performans güncellemesi yapılmaktadır. En kısa sürede yenilenmiş haliyle geri döneceğiz.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          {user ? (
            <button onClick={handleLogout} className="btn-outline" style={{ color: '#fbbf24', borderColor: '#fbbf24' }}>Çıkış Yap</button>
          ) : (
            <Link to="/admin-login" className="btn-primary" style={{ textDecoration: 'none', background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', border: '1px solid #fbbf24', padding: '0.75rem 1.5rem', borderRadius: '0.75rem' }}>
              Yönetici Girişi
            </Link>
          )}
        </div>
      </div>
    </div>
  );

  // Korunmuş Rota Bileşeni
  const ProtectedRoute = ({ children }) => {
    if (authLoading) return null; // Yüklenme anında bir şey gösterme (App loading zaten üstte)
    if (!user) return <Navigate to="/login" replace />;
    if (isBanned || blacklistData) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: 'white', textAlign: 'center', padding: '2rem' }}>
          <div className="gradient-bg"></div>
          <div className="glass" style={{ padding: '2rem' }}>
            <h2 style={{ color: '#f87171', marginBottom: '1rem' }}>Erişim Engellendi</h2>
            <p>Hesabınız askıya alınmıştır veya kurallar gereği bekleme süresindedir.</p>
            <button onClick={handleLogout} className="btn-outline" style={{ marginTop: '1.5rem' }}>Çıkış Yap</button>
          </div>
        </div>
      );
    }
    if (maintenanceMode && !isActuallyAdmin) return <Navigate to="/maintenance" replace />;
    return children;
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="gradient-bg"></div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--primary)' }}>Play</span>Tester
          </div>
          <p style={{ color: 'var(--text-muted)' }}>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Her zaman açık olan rotalar */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/maintenance" element={maintenanceMode && !isActuallyAdmin ? <MaintenanceScreen /> : <Navigate to="/" />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} />
        <Route path="/admin-login" element={user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} />

        {/* Korunan rotalar */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard {...sharedProps} /></ProtectedRoute>} />
        <Route path="/test-pool" element={<ProtectedRoute><TestPool {...sharedProps} /></ProtectedRoute>} />
        <Route path="/add-app" element={<ProtectedRoute><AddApp {...sharedProps} /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage {...sharedProps} /></ProtectedRoute>} />
        <Route path="/support" element={<ProtectedRoute><Support {...sharedProps} /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat {...sharedProps} /></ProtectedRoute>} />
        <Route path="/admin" element={user && isActuallyAdmin ? <AdminAuth {...sharedProps} /> : <Navigate to="/dashboard" />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
