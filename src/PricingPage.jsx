import React, { useState } from 'react';
import { ShoppingCart, Star, Zap, ShieldCheck, Crown, ArrowRight, Building2, Copy, CheckCircle2, X, AlertCircle, Loader2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const Sidebar = ({ onLogout, location }) => (
    <aside className="sidebar glass">
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '3rem' }}>
            <span style={{ color: 'var(--primary)' }}>Play</span>Tester
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            <Link to="/dashboard" className={`sidebar-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                <ShoppingCart size={20} /> Dashboard
            </Link>
            <Link to="/test-pool" className={`sidebar-link ${location.pathname === '/test-pool' ? 'active' : ''}`}>
                <Zap size={20} /> Uygulama Havuzu
            </Link>
            <Link to="/add-app" className={`sidebar-link ${location.pathname === '/add-app' ? 'active' : ''}`}>
                <Zap size={20} /> Uygulama Ekle
            </Link>
            <Link to="/pricing" className={`sidebar-link ${location.pathname === '/pricing' ? 'active' : ''}`}>
                <ShoppingCart size={20} /> Kredi Satın Al
            </Link>
        </nav>
    </aside>
);

const BankTransferModal = ({ plan, user, onClose }) => {
    const [copied, setCopied] = useState(false);
    const [notified, setNotified] = useState(false);
    const [loading, setLoading] = useState(false);

    // Rastgele referans kodu üret (PT-XXXX)
    const [refCode] = useState(() => 'PT-' + Math.floor(1000 + Math.random() * 9000));

    const bankInfo = {
        bankName: 'İş Bankası',
        accountHolder: 'AD SOYAD (Burayı Güncelle)',
        iban: 'TR00 0000 0000 0000 0000 0000 00', // Burayı Güncelle
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleNotify = async () => {
        if (!user) return;
        setLoading(true);
        try {
            await addDoc(collection(db, 'payments'), {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || user.email.split('@')[0],
                planId: plan.id,
                planName: plan.name,
                price: plan.price,
                credits: plan.credits,
                refCode: refCode,
                status: 'pending',
                createdAt: serverTimestamp(),
                bankName: bankInfo.bankName
            });
            setNotified(true);
        } catch (error) {
            console.error("Ödeme bildirimi hatası:", error);
            alert("Bildirim gönderilirken bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
        }}>
            <div className="glass" style={{ width: '100%', maxWidth: '500px', padding: '2rem', borderRadius: '1.5rem', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <X size={20} />
                </button>

                {!notified ? (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{
                                width: '60px', height: '60px', background: 'rgba(99, 102, 241, 0.1)',
                                borderRadius: '50%', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', margin: '0 auto 1rem'
                            }}>
                                <Building2 size={30} color="var(--primary)" />
                            </div>
                            <h3 style={{ fontSize: '1.5rem' }}>Havale / EFT ile Öde</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Lütfen aşağıdaki hesaba <strong>₺{plan.price}</strong> gönderin.
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                            <div className="glass" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Banka</div>
                                <div style={{ fontWeight: '600' }}>{bankInfo.bankName}</div>
                            </div>
                            <div className="glass" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Alıcı</div>
                                <div style={{ fontWeight: '600' }}>{bankInfo.accountHolder}</div>
                            </div>
                            <div className="glass" style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>IBAN</div>
                                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{bankInfo.iban}</div>
                                </div>
                                <button onClick={() => handleCopy(bankInfo.iban)} style={{ background: 'none', border: 'none', color: 'var(--primary)', padding: '0.5rem' }}>
                                    {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                                </button>
                            </div>
                            <div className="glass" style={{ padding: '1rem', border: '1px dashed var(--primary)', background: 'rgba(99, 102, 241, 0.05)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold', marginBottom: '0.25rem' }}>ÖNEMLİ: AÇIKLAMA KODU</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.25rem', letterSpacing: '2px', color: 'white' }}>{refCode}</div>
                                    <button onClick={() => handleCopy(refCode)} style={{ background: 'var(--primary)', border: 'none', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                                        Kodu Kopyala
                                    </button>
                                </div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                    * Otomatik onay için bu kodu transfer açıklamasına mutlaka yazın.
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', background: 'rgba(251, 191, 36, 0.05)', borderRadius: '0.75rem', marginBottom: '2rem' }}>
                            <AlertCircle size={20} color="#fbbf24" style={{ flexShrink: 0 }} />
                            <p style={{ fontSize: '0.8rem', color: '#fbbf24' }}>
                                Ödeme yaptıktan sonra aşağıdaki butona basarak bize bildirmeyi unutmayın.
                            </p>
                        </div>

                        <button
                            onClick={handleNotify}
                            className="btn-primary"
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Ödemeyi Yaptım, Bildir'}
                        </button>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                        <CheckCircle2 size={80} color="#4ade80" style={{ margin: '0 auto 1.5rem' }} />
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Bildirim Alındı!</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                            Ödemeniz kontrol edildikten sonra (yaklaşık 5-10 dk) kredileriniz hesabınıza tanımlanacaktır.
                            Referans Kodunuz: <strong>{refCode}</strong>
                        </p>
                        <button onClick={onClose} className="btn-outline" style={{ width: '100%' }}>Kapat</button>
                    </div>
                )}
            </div>
        </div>
    );
};

const PricingPage = ({ user, credits = 20 }) => {
    const location = useLocation();
    const [selectedPlan, setSelectedPlan] = useState(null);

    const plans = [
        {
            id: 'starter',
            name: 'Başlangıç',
            credits: 50,
            price: '49',
            icon: <Star size={32} color="#94a3b8" />,
            description: '3 adet uygulama eklemek için ideal.',
            features: ['50 Kredi', 'Anında Yükleme', '7/24 Destek'],
            color: 'rgba(148, 163, 184, 0.1)',
            link: '#' // Iyziko linki buraya gelecek
        },
        {
            id: 'developer',
            name: 'Geliştirici',
            credits: 150,
            price: '129',
            icon: <Zap size={32} color="var(--primary)" />,
            description: '10 adet uygulama eklemek için.',
            features: ['150 Kredi', 'Anında Yükleme', 'Öncelikli Destek'],
            color: 'rgba(99, 102, 241, 0.1)',
            link: '#' // Iyziko linki buraya gelecek
        },
        {
            id: 'full',
            name: 'Tam Onay',
            credits: 400,
            price: '249',
            icon: <Crown size={32} color="#fbbf24" />,
            description: '26 adet uygulama gereksinimini karşılar.',
            popular: true,
            features: ['400 Kredi', 'Anında Yükleme', 'Vip Destek Hattı'],
            color: 'rgba(251, 191, 36, 0.1)',
            link: '#' // Iyziko linki buraya gelecek
        },
        {
            id: 'pro',
            name: 'Profesyonel',
            credits: 1000,
            price: '499',
            icon: <ShieldCheck size={32} color="#4ade80" />,
            description: '66 adet uygulama eklemek için avantajlı.',
            features: ['1000 Kredi', 'Anında Yükleme', 'Hesap Yöneticisi'],
            color: 'rgba(74, 222, 128, 0.1)',
            link: '#' // Iyziko linki buraya gelecek
        }
    ];

    return (
        <div className="dashboard-layout">
            <div className="gradient-bg"></div>

            <aside className="sidebar glass">
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '3rem' }}>
                    <span style={{ color: 'var(--primary)' }}>Play</span>Tester
                </div>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    <Link to="/dashboard" className="sidebar-link">
                        Dashboard
                    </Link>
                    <Link to="/test-pool" className="sidebar-link">
                        Uygulama Havuzu
                    </Link>
                    <Link to="/add-app" className="sidebar-link">
                        Uygulama Ekle
                    </Link>
                    <Link to="/pricing" className="sidebar-link active">
                        Kredi Satın Al
                    </Link>
                </nav>
            </aside>

            <main className="dashboard-main">
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Kredi Satın Al</h2>
                        <p style={{ color: 'var(--text-muted)' }}>İhtiyacın olan paketi seç, test sürecini hızlandır.</p>
                    </div>
                    <div className="glass" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Star size={18} color="#fbbf24" fill="#fbbf24" />
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mevcut Kredi</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fbbf24' }}>{credits} 🪙</div>
                        </div>
                    </div>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
                    {plans.map((plan) => (
                        <div key={plan.id} className="glass card" style={{
                            padding: '2rem',
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                            border: plan.popular ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                            background: plan.popular ? 'rgba(99, 102, 241, 0.05)' : 'var(--glass)'
                        }}>
                            {plan.popular && (
                                <div style={{
                                    position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                                    background: 'var(--primary)', color: 'white', padding: '4px 12px',
                                    borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold'
                                }}>
                                    EN POPÜLER
                                </div>
                            )}

                            <div style={{
                                width: '60px', height: '60px', borderRadius: '16px',
                                background: plan.color, display: 'flex',
                                alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem'
                            }}>
                                {plan.icon}
                            </div>

                            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{plan.name}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', minHeight: '40px' }}>{plan.description}</p>

                            <div style={{ marginBottom: '2rem' }}>
                                <span style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>₺{plan.price}</span>
                                <span style={{ color: 'var(--text-muted)' }}> / Tek Seferlik</span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem', flex: 1 }}>
                                {plan.features.map((feature, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                        <div style={{ color: '#4ade80' }}>✓</div>
                                        {feature}
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setSelectedPlan(plan)}
                                className={plan.popular ? 'btn-primary' : 'btn-outline'}
                                style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%' }}
                            >
                                Satın Al <ArrowRight size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            </main>

            {selectedPlan && (
                <BankTransferModal
                    plan={selectedPlan}
                    user={user}
                    onClose={() => setSelectedPlan(null)}
                />
            )}
        </div>
    );
};

export default PricingPage;
