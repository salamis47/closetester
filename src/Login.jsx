import React, { useState } from 'react';
import { auth, googleProvider } from './firebase';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

const Login = ({ onLogin }) => {
    const [mode, setMode] = useState('login'); // 'login' | 'register'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            onLogin(result.user);
        } catch (err) {
            setError(getErrorMessage(err.code));
        } finally {
            setLoading(false);
        }
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setError('');

        if (mode === 'reset') {
            if (!email) {
                setError('Lütfen e-posta adresinizi girin.');
                return;
            }
            setLoading(true);
            try {
                await sendPasswordResetEmail(auth, email);
                setMode('login');
                setError('Şifre sıfırlama e-postası gönderildi! Lütfen e-postanı kontrol et.');
            } catch (err) {
                setError(getErrorMessage(err.code));
            } finally {
                setLoading(false);
            }
            return;
        }

        if (mode === 'register') {
            if (password !== confirmPassword) {
                setError('Şifreler eşleşmiyor.');
                return;
            }
            if (password.length < 6) {
                setError('Şifre en az 6 karakter olmalı.');
                return;
            }
        }

        setLoading(true);
        try {
            let result;
            if (mode === 'register') {
                result = await createUserWithEmailAndPassword(auth, email, password);
            } else {
                result = await signInWithEmailAndPassword(auth, email, password);
            }
            onLogin(result.user);
        } catch (err) {
            setError(getErrorMessage(err.code));
        } finally {
            setLoading(false);
        }
    };

    const getErrorMessage = (code) => {
        const messages = {
            'auth/email-already-in-use': 'Bu e-posta zaten kullanımda. Eğer daha önce verilerini sildiyseniz bile, lütfen aynı şifreyle "Giriş Yap" butonunu kullanarak devam edin.',
            'auth/invalid-email': 'Geçersiz e-posta adresi.',
            'auth/user-not-found': 'Bu e-posta ile kayıtlı kullanıcı bulunamadı.',
            'auth/wrong-password': 'Hatalı şifre.',
            'auth/too-many-requests': 'Çok fazla deneme. Lütfen biraz bekle.',
            'auth/popup-closed-by-user': 'Google girişi iptal edildi.',
            'auth/invalid-credential': 'E-posta veya şifre hatalı.',
            'auth/configuration-not-found': 'Firebase yapılandırması eksik. Lütfen daha sonra tekrar deneyin.',
            'auth/operation-not-allowed': 'E-posta/Şifre girişi Firebase Console üzerinden henüz aktif edilmemiş.',
            'auth/unauthorized-domain': 'Giriş Başarısız: Bu web adresi Firebase üzerinde yetkilendirilmemiş. Lütfen "closetester-v1dh.vercel.app" adresini Firebase => Authentication => Settings => Authorized domains bölümüne ekleyin.',
        };
        return messages[code] || `Bir hata oluştu: ${code}`;
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="gradient-bg"></div>

            <div className="glass" style={{ padding: '2.5rem', width: '100%', maxWidth: '420px', margin: '1rem' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                            <span style={{ color: 'var(--primary)' }}>Play</span>Tester
                        </div>
                    </Link>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        {mode === 'login' ? 'Hesabına giriş yap' : 'Yeni hesap oluştur'}
                    </p>
                </div>

                {/* Google */}
                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    style={{
                        width: '100%', padding: '0.875rem', borderRadius: '0.625rem',
                        border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.08)',
                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: '0.75rem', cursor: loading ? 'wait' : 'pointer',
                        fontSize: '0.95rem', fontWeight: '500', transition: 'all 0.2s ease',
                        marginBottom: '1.5rem',
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    </svg>
                    {loading ? 'Bağlanıyor...' : 'Google ile Devam Et'}
                </button>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>VEYA</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
                </div>

                {/* Form */}
                <form onSubmit={handleEmailAuth}>
                    {mode === 'register' && (
                        <div className="form-group">
                            <label>Ad Soyad</label>
                            <input
                                type="text"
                                placeholder="Adın ve soyadın"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                            />
                        </div>
                    )}
                    <div className="form-group">
                        <label>E-posta</label>
                        <input
                            type="email"
                            placeholder="ornek@mail.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    {mode !== 'reset' && (
                        <div className="form-group">
                            <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                                Şifre
                                {mode === 'login' && (
                                    <button
                                        type="button"
                                        onClick={() => { setMode('reset'); setError(''); }}
                                        style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}
                                    >
                                        Şifremi Unuttum?
                                    </button>
                                )}
                            </label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    )}
                    {mode === 'register' && (
                        <div className="form-group">
                            <label>Şifre Tekrar</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    {error && (
                        <div style={{ background: 'rgba(255,107,107,0.15)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '0.5rem', padding: '0.75rem 1rem', color: '#ff6b6b', fontSize: '0.9rem', marginBottom: '1rem' }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{ width: '100%', padding: '0.875rem', fontSize: '0.95rem' }}
                    >
                        {loading ? 'Lütfen bekle...' :
                            mode === 'login' ? 'Giriş Yap' :
                                mode === 'register' ? 'Kayıt Ol' : 'Şifreyi Sıfırla'}
                    </button>
                </form>

                {/* Toggle */}
                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    {mode === 'login' ? (
                        <>Hesabın yok mu?{' '}
                            <button onClick={() => { setMode('register'); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: '600', padding: 0 }}>
                                Kayıt Ol
                            </button>
                        </>
                    ) : mode === 'register' ? (
                        <>Zaten hesabın var mı?{' '}
                            <button onClick={() => { setMode('login'); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: '600', padding: 0 }}>
                                Giriş Yap
                            </button>
                        </>
                    ) : (
                        <button onClick={() => { setMode('login'); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: '600', padding: 0 }}>
                            ← Giriş Ekranına Dön
                        </button>
                    )}
                </p>
            </div>
        </div>
    );
};

export default Login;
