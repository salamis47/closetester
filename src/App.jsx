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

      <section style={{ padding: '4rem 1rem', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.5rem' }}>Sistem Nasıl Çalışır?</h2>

        <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', marginBottom: '2rem', borderLeft: '4px solid var(--primary)' }}>
          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem' }}>
            🎯 Platformun Amacı
          </h3>
          <p style={{ lineHeight: '1.7', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            Google Play Store, yeni geliştiricilerin uygulamalarını yayınlamadan önce <strong>14 gün boyunca aralıksız en az 12 farklı kullanıcı</strong> tarafından test edilmesini şart koşar. PlayTester Community, geliştiricilerin bir araya gelerek birbirlerinin uygulamalarını test ettiği, bu sayede herkesin engelleri ücretsiz ve güvenli bir şekilde aşmasını sağlayan yardımlaşma kapısıdır.
          </p>
        </div>

        <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', marginBottom: '2rem', borderLeft: '4px solid #a855f7' }}>
          <h3 style={{ color: '#a855f7', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem' }}>
            📢 Topluluk Grubu Sistemi
          </h3>
          <p style={{ lineHeight: '1.7', color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '1rem' }}>
            Kendi Google Grubu'nuzu kurmak ve yönetmekle uğraşmak istemiyor musunuz? Platformumuzun size özel sunduğu <strong>Ortak Topluluk Grubu</strong> ile süreci hızlandırın:
          </p>
          <ul style={{ lineHeight: '1.7', color: 'var(--text-muted)', marginLeft: '1.5rem', fontSize: '1.05rem' }}>
            <li style={{ marginBottom: '0.5rem' }}><strong>Hazır Altyapı:</strong> Uygulama eklerken tek tıkla topluluk grubumuzu seçebilirsiniz.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Geniş Erişim:</strong> Binlerce tester'ın zaten üye olduğu bu grubu kullanarak tester bulma aşamasını saniyelere indirin.</li>
            <li><strong>Kolay Kurulum:</strong> Play Console'da tek bir e-posta adresini (playtester_community_tr@googlegroups.com) eklemeniz yeterlidir.</li>
          </ul>
        </div>

        <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', marginBottom: '2rem', borderLeft: '4px solid #06b6d4' }}>
          <h3 style={{ color: '#06b6d4', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem' }}>
            🛠️ Google Play Console Kurulumu (Nasıl Eklenir?)
          </h3>
          <p style={{ lineHeight: '1.7', color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
            Topluluk grubumuzu kullanmak için Play Console panelinizde şu basit 3 adımı yapmanız yeterlidir:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div className="glass" style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '0.5rem' }}>1. Adım</div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Play Console'da <strong>"Test" &gt; "Kapalı Test"</strong> bölümüne gidin ve ilgili kanalı yönetin.</p>
            </div>
            <div className="glass" style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '0.5rem' }}>2. Adım</div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}><strong>"Test Kullanıcıları"</strong> sekmesine tıklayın ve "E-posta Listesi Oluştur" deyin.</p>
            </div>
            <div className="glass" style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '0.5rem' }}>3. Adım</div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Grup e-postasını ekleyin: <br /><code style={{ color: 'var(--primary)', wordBreak: 'break-all', display: 'block', marginTop: '0.5rem' }}>playtester_community_tr@googlegroups.com</code></p>
            </div>
          </div>
          <p style={{ marginTop: '1.5rem', fontSize: '0.95rem', color: '#fbbf24', fontStyle: 'italic' }}>
            * Not: Google Grubu'nun console'a eklendikten sonra yayına alınması (review) gerekebilir. Bu normal bir süreçtir.
          </p>
        </div>

        <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', marginBottom: '2rem', borderLeft: '4px solid #fbbf24' }}>
          <h3 style={{ color: '#fbbf24', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem' }}>
            💰 Kredi ve Ödül Sistemi
          </h3>
          <p style={{ lineHeight: '1.7', color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '1rem' }}>
            Sistem tamamen <strong>Kredi (Puan)</strong> mantığıyla çalışır. Sistemi ayakta tutan şey birbirimize sağladığımız karşılıklı katkıdır:
          </p>
          <ul style={{ lineHeight: '1.7', color: 'var(--text-muted)', marginLeft: '1.5rem', fontSize: '1.05rem' }}>
            <li style={{ marginBottom: '0.5rem' }}><strong>Başlangıç Hediyesi:</strong> Kayıt olan her kullanıcılara ilk desteğini alıp verebilmesi için başlangıç kredisi tanımlanır.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Uygulama Eklerken:</strong> Kendi uygulamanızı test havuzuna eklediğinizde, test edecek kişilere dağıtılmak üzere kendi bakiyenizden belli bir kredi ayırırsınız.</li>
            <li><strong>Test Ederken:</strong> Havuzdaki başka geliştiricilerin uygulamalarını test ederek her gün kendi bakiyenizi artırırsınız (Kredi Kazanırsınız).</li>
          </ul>
        </div>

        <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', borderLeft: '4px solid #10b981' }}>
          <h3 style={{ color: '#10b981', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem' }}>
            🔄 14 Günlük Kontrollü Süreç
          </h3>
          <p style={{ lineHeight: '1.7', color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '1rem' }}>
            Sistemin Play Store onayında sorun yaşamaması için disiplin şarttır:
          </p>
          <ul style={{ lineHeight: '1.7', color: 'var(--text-muted)', marginLeft: '1.5rem', fontSize: '1.05rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>Test sürecine katılarak uygulamayı telefonunuza indirdiğinizde, 14 gün boyunca <strong>her gün</strong> panele girerek AI tarafından doğrulanan bir onay (kanıt) göndermelisiniz.</li>
            <li style={{ marginBottom: '0.5rem' }}>Sistemdeki Yapay Zeka anlık olarak kontrolü sağlar ve o günkü ilerlemenizi onaylayıp günlük ödülünüzü yansıtır.</li>
            <li><strong>Hatırlatma:</strong> 14 günü tamamlamadan testi bırakmak veya uygulamayı silmek ceza puanı almanıza veya sistemden uzaklaştırılmanıza neden olabilir.</li>
            <li>14 gün kesintisiz tamamlandığında büyük ödül hesaba geçer ve uygulama sahibi Play Store Console'daki zorunluluğu güvenle doldurmuş olur.</li>
          </ul>
        </div>

        <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', borderLeft: '4px solid #f87171' }}>
          <h3 style={{ color: '#f87171', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem' }}>
            🚫 Adil Kullanım ve Ceza Sistemi
          </h3>
          <p style={{ lineHeight: '1.7', color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '1rem' }}>
            Topluluğun güvenliğini ve yardımlaşmanın sürekliliğini korumak amacıyla katı bir <strong>Anti-Suistimal</strong> politikası uygulanır:
          </p>
          <ul style={{ lineHeight: '1.7', color: 'var(--text-muted)', marginLeft: '1.5rem', fontSize: '1.05rem' }}>
            <li style={{ marginBottom: '0.5rem' }}><strong>Hesap Silme Cezası:</strong> Sistemdeki kuralları aşmak veya verileri temizlemek amacıyla hesabını silen kullanıcılar 14 gün boyunca aynı bilgilerle (e-posta vb.) tekrar kayıt olamazlar.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Yanıltıcı Kanıtlar:</strong> Sahte ekran görüntüsü veya alakasız kanıt gönderen hesaplar, admin incelemesi sonrası kalıcı olarak yasaklanabilir.</li>
            <li><strong>Dürüstlük İlkesi:</strong> Bu platform geliştiricilerin birbirine zaman ayırdığı bir yerdir. Başkasının emeğine saygı göstermeyenler topluluktan uzaklaştırılır.</li>
          </ul>
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
          try {
            if (docSnap.exists()) {
              const data = docSnap.data();
              setCredits(data.credits || 0);
              setMyApps(data.myApps || []);
              setIsBanned(data.isBanned || false);
              setProfileData({
                name: data.displayName || firebaseUser.displayName || firebaseUser.email.split('@')[0],
                bio: data.bio || ''
              });
              localStorage.setItem('user_credits', data.credits || 0);
            } else {
              // Karaliste kontrolü
              const blacklistRef = collection(db, 'blacklist');
              const qB = query(blacklistRef, where('email', '==', firebaseUser.email), where('status', '==', 'active'));
              const bSnap = await getDocs(qB);

              if (!bSnap.empty) {
                const bDoc = bSnap.docs[0].data();
                setBlacklistData({ ...bDoc, id: bSnap.docs[0].id });
              } else {
                // Yeni kullanıcı oluştur
                await setDoc(userRef, {
                  credits: 20,
                  myApps: [],
                  isBanned: false,
                  email: firebaseUser.email,
                  displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                  lastSeen: serverTimestamp(),
                  createdAt: serverTimestamp()
                });
              }
            }
          } catch (err) {
            console.error("User data sync error:", err);
          }
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
