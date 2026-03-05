import React, { useState } from 'react';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import AdminPanel from './AdminPanel';
import { ShieldCheck, Loader2 } from 'lucide-react';

const AdminAuth = (props) => {
    const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem('admin-auth') === 'true');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAuth = async (e) => {
        e.preventDefault();
        if (!password) {
            setError('Şifre boş olamaz.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const configRef = doc(db, 'site_config', 'admin');
            const configSnap = await getDoc(configRef);
            let correctPassword = 'admin123'; // Veritabanında şifre yoksa varsayılan

            if (configSnap.exists() && configSnap.data().password) {
                correctPassword = configSnap.data().password;
            } else {
                // İlk kurulum: Eğer veritabanında şifre yoksa, varsayılanı ayarla
                await setDoc(configRef, { password: correctPassword });
            }

            if (password === correctPassword) {
                sessionStorage.setItem('admin-auth', 'true');
                setIsAuthenticated(true);
            } else {
                setError('Yönetici şifresi yanlış.');
            }
        } catch (err) {
            setError('Doğrulama sırasında bir hata oluştu.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (isAuthenticated) {
        return <AdminPanel {...props} />;
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--background)' }}>
            <div className="glass" style={{ padding: '3rem', borderRadius: '1.5rem', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                <ShieldCheck size={48} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
                <h2 style={{ marginBottom: '1rem' }}>Yönetici Doğrulaması</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Bu alana erişmek için lütfen yönetici şifresini girin.</p>
                <form onSubmit={handleAuth}>
                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Yönetici Şifresi"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoFocus
                        />
                    </div>
                    {error && <p style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}
                    <button type="submit" className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} disabled={loading}>
                        {loading ? <><Loader2 className="animate-spin" size={18} /> Doğrulanıyor...</> : 'Giriş Yap'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminAuth;
