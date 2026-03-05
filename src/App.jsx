import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { logOut } from './firebase';
import { doc, getDoc, setDoc, onSnapshot, updateDoc, arrayUnion, query, collection, where, getDocs } from 'firebase/firestore';
import Login from './Login';
import Dashboard from './Dashboard';
import AddApp from './AddApp';
import TestPool from './TestPool';
import SettingsPage from './SettingsPage';
import Chat from './Chat';
import AdminPanel from './AdminPanel';
import AdminAuth from './AdminAuth';

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
          Google Play'in 14 gün ve 15 test kullanıcısı kuralını aşmak artık çok kolay.
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
            Google Play Store, yeni geliştiricilerin uygulamalarını yayınlamadan önce <strong>14 gün boyunca aralıksız en az 15 farklı kullanıcı</strong> tarafından test edilmesini şart koşar. PlayTester Community, geliştiricilerin bir araya gelerek birbirlerinin uygulamalarını test ettiği, bu sayede herkesin engelleri ücretsiz ve güvenli bir şekilde aşmasını sağlayan yardımlaşma kapısıdır.
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
            <li style={{ marginBottom: '0.5rem' }}><strong>Başlangıç Hediyesi:</strong> Kayıt olan her kullanıcıya ilk desteğini alıp verebilmesi için başlangıç kredisi tanımlanır.</li>
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
            <li>14 gün kesintisiz tamamlandığında büyük ödül hesaba geçer ve uygulama sahibi Play Store Console'daki zorunluluğu güvenle doldurmuş olur.</li>
          </ul>
        </div>
      </section>
    </main>

    <footer className="container" style={{ padding: '4rem 2rem', borderTop: '1px solid var(--glass-border)', marginTop: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
      <p>© 2026 PlayTester Community. Geliştiriciler tarafından geliştiriciler için yapıldı.</p>
    </footer>
  </div>
);

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [credits, setCredits] = useState(() => {
    // Cache'den başla (hız için)
    const saved = localStorage.getItem('user_credits');
    return saved ? parseFloat(saved) : 0;
  });
  const [myApps, setMyApps] = useState([]);
  const [isBanned, setIsBanned] = useState(false);
  const [blacklistData, setBlacklistData] = useState(null); // { email, deletedAt }

  useEffect(() => {
    let unsubFirestore = () => { };

    // Bakım modunu dinle
    const settingsRef = doc(db, 'settings', 'site_settings');
    const unsubSettings = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        setMaintenanceMode(docSnap.data().maintenanceMode || false);
      }
    });

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      // KRİTİK: Giriş durumunu anladığımız an yükleme ekranını hemen kapatıyoruz.
      // Veritabanı verileri (kredi vb.) arkadan sessizce yüklenecek.
      setAuthLoading(false);

      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);

        // 1. Canlı takibi (real-time sync) hemen başlat
        unsubFirestore = onSnapshot(userRef, async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setCredits(data.credits || 0);
            setMyApps(data.myApps || []);
            setIsBanned(data.isBanned || false);
            localStorage.setItem('user_credits', data.credits || 0);
          } else {
            // KRİTİK: Yeni kullanıcı dökümanı oluşturmadan önce blacklist kontrolü yap
            const blacklistRef = collection(db, 'blacklist');
            const qB = query(blacklistRef, where('email', '==', firebaseUser.email), where('status', '==', 'active'));
            const bSnap = await getDocs(qB);

            if (!bSnap.empty) {
              const bDoc = bSnap.docs[0].data();
              setBlacklistData({ ...bDoc, id: bSnap.docs[0].id });
              return; // Kullanıcı dökümanı oluşturma, aşağıda engel ekranı gösterilecek
            }

            // Yeni kullanıcı dökümanını oluştur (asenkron, arayüzü kilitlemez)
            setDoc(userRef, {
              credits: 20,
              myApps: [],
              isBanned: false,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              createdAt: new Date()
            });
          }
        }, (error) => {
          console.error("Firestore sync error:", error);
        });
      } else {
        setCredits(0);
        setMyApps([]);
        setBlacklistData(null);
        localStorage.removeItem('user_credits');
        unsubFirestore();
      }
    });

    return () => {
      unsubAuth();
      unsubFirestore();
      unsubSettings();
    };
  }, []);

  const handleLogin = (firebaseUser) => setUser(firebaseUser);
  const handleLogout = async () => {
    await logOut();
    setUser(null);
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

  const sharedProps = {
    user,
    credits,
    myApps,
    onLogout: handleLogout,
    onAddCredits: handleAddCredits,
    onAddApp: handleAddApp,
    isAdmin: user?.email === ADMIN_EMAIL,
    isBanned: isBanned,
  };

  if (maintenanceMode && user?.email !== ADMIN_EMAIL) {
    const MaintenanceScreen = () => (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
        <div className="gradient-bg"></div>
        <div className="glass" style={{ padding: '3rem', borderRadius: '2rem', textAlign: 'center', maxWidth: '500px', width: '90%' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🛠️</div>
          <h1 style={{ color: '#fbbf24', marginBottom: '1rem' }}>Sistem Bakımda</h1>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Sitemizde şu an planlı bir kalite ve performans güncellemesi yapılmaktadır. En kısa sürede yenilenmiş haliyle geri döneceğiz.
          </p>
          {user ? (
            <button onClick={handleLogout} className="btn-outline" style={{ color: '#fbbf24', borderColor: '#fbbf24' }}>Çıkış Yap</button>
          ) : (
            <Link to="/admin-login" style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.08)', textDecoration: 'none' }}>·</Link>
          )}
        </div>
      </div>
    );
    return (
      <Router>
        <Routes>
          <Route path="/admin-login" element={<Login onLogin={handleLogin} />} />
          <Route path="*" element={<MaintenanceScreen />} />
        </Routes>
      </Router>
    );
  }

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

  if (blacklistData) {
    const deletedDate = blacklistData.deletedAt?.toDate() || new Date();
    const unlockDate = new Date(deletedDate.getTime() + 14 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const diffDays = Math.ceil((unlockDate - now) / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
          <div className="gradient-bg"></div>
          <div className="glass" style={{ padding: '3rem', borderRadius: '2rem', textAlign: 'center', maxWidth: '500px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>⏳</div>
            <h1 style={{ color: '#fbbf24', marginBottom: '1rem' }}>Hesap Bekleme Süresinde</h1>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '2rem' }}>
              Daha önce hesabınızı sildiğiniz için topluluk güvenliği gereği yeni hesap açabilmek için <strong>{diffDays} gün</strong> daha beklemeniz gerekiyor. 🛡️
            </p>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)', marginBottom: '1.5rem' }}>
              Bu sistem, kredi ve test süreçlerinin suistimal edilmesini önlemek için 14 günlük bir koruma sağlar.
            </div>
            <button onClick={handleLogout} className="btn-outline" style={{ color: '#fbbf24', borderColor: '#fbbf24' }}>Çıkış Yap</button>
          </div>
        </div>
      );
    }
  }

  if (isBanned) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
        <div className="gradient-bg"></div>
        <div className="glass" style={{ padding: '3rem', borderRadius: '2rem', textAlign: 'center', maxWidth: '500px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🚫</div>
          <h1 style={{ color: '#f87171', marginBottom: '1rem' }}>Erişim Yasaklandı</h1>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '2rem' }}>
            Hesabınız topluluk kurallarını ihlal ettiği gerekçesiyle yönetici tarafından askıya alınmıştır.
            Eğer bir hata olduğunu düşünüyorsanız lütfen destek ekibiyle iletişime geçin.
          </p>
          <button onClick={handleLogout} className="btn-outline" style={{ color: '#f87171', borderColor: '#f87171' }}>Çıkış Yap</button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />}
        />
        <Route
          path="/dashboard"
          element={user ? <Dashboard {...sharedProps} /> : <Navigate to="/login" />}
        />
        <Route
          path="/test-pool"
          element={user ? <TestPool {...sharedProps} /> : <Navigate to="/login" />}
        />
        <Route
          path="/add-app"
          element={user ? <AddApp {...sharedProps} /> : <Navigate to="/login" />}
        />
        <Route
          path="/settings"
          element={user ? <SettingsPage {...sharedProps} /> : <Navigate to="/login" />}
        />
        <Route
          path="/chat"
          element={user ? <Chat {...sharedProps} /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin"
          element={user && sharedProps.isAdmin ? <AdminAuth {...sharedProps} /> : <Navigate to="/dashboard" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
