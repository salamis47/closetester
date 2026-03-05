import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { db } from './firebase';
import { collection, addDoc, query, where, onSnapshot, orderBy, serverTimestamp } from 'firebase/firestore';
import { LifeBuoy, Send, MessageSquare, Clock, CheckCircle2, ChevronRight } from 'lucide-react';

const Support = ({ user, onLogout, isAdmin, profile }) => {
    const location = useLocation();
    const [message, setMessage] = useState('');
    const [subject, setSubject] = useState('Genel Destek');
    const [sending, setSending] = useState(false);
    const [tickets, setTickets] = useState([]);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, 'support_tickets'),
            where('uid', '==', user.uid),
            orderBy('createdAt', 'desc')
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setTickets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim() || !user) return;

        setSending(true);
        try {
            await addDoc(collection(db, 'support_tickets'), {
                uid: user.uid,
                email: user.email,
                userName: profile?.name || user.displayName || user.email.split('@')[0],
                subject: subject,
                message: message.trim(),
                status: 'open',
                createdAt: serverTimestamp()
            });
            setMessage('');
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("Destek talebi gönderilemedi:", error);
            alert("Bir hata oluştu: " + error.message);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="dashboard-layout">
            <div className="gradient-bg"></div>

            <Sidebar onLogout={onLogout} location={location} isAdmin={isAdmin} />

            <main className="dashboard-main">
                <header style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <LifeBuoy color="var(--primary)" size={32} />
                        <h2 style={{ fontSize: '2rem' }}>Destek Merkezi</h2>
                    </div>
                    <p style={{ color: 'var(--text-muted)' }}>Bir sorunun mu var? Bizimle doğrudan iletişime geçebilirsin.</p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                    {/* Ticket Form */}
                    <div className="glass" style={{ padding: '2rem', borderRadius: '1.5rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Send size={20} /> Yeni Talep Oluştur
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Konu</label>
                                <select
                                    value={subject}
                                    onChange={e => setSubject(e.target.value)}
                                    style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}
                                >
                                    <option value="Genel Destek">Genel Destek</option>
                                    <option value="Kredi Sorunu">Kredi Sorunu</option>
                                    <option value="Uygulama Havuzu">Uygulama Havuzu</option>
                                    <option value="Hata Bildirimi">Hata Bildirimi</option>
                                    <option value="Diğer">Diğer</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Mesajın</label>
                                <div style={{ position: 'relative' }}>
                                    <textarea
                                        value={message}
                                        onChange={e => setMessage(e.target.value.slice(0, 1000))}
                                        placeholder="Lütfen sorunu detaylı bir şekilde açıkla..."
                                        style={{
                                            minHeight: '180px',
                                            resize: 'none',
                                            padding: '1.25rem',
                                            borderRadius: '1.25rem',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            transition: 'all 0.3s ease'
                                        }}
                                        required
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '12px',
                                        right: '18px',
                                        fontSize: '0.8rem',
                                        color: message.length >= 1000 ? '#ff6b6b' : 'var(--text-muted)',
                                        background: 'rgba(15, 23, 42, 0.7)',
                                        padding: '4px 8px',
                                        borderRadius: '6px'
                                    }}>
                                        {message.length}/1000
                                    </div>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="btn-primary"
                                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                disabled={sending}
                            >
                                {sending ? 'Gönderiliyor...' : (
                                    <>
                                        {success ? <><CheckCircle2 size={20} /> Gönderildi!</> : <><Send size={20} /> Talebi Gönder</>}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Previous Tickets */}
                    <div className="glass" style={{ padding: '1.5rem', borderRadius: '1.5rem', height: 'fit-content' }}>
                        <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MessageSquare size={18} /> Taleplerim ({tickets.length})
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '500px', overflowY: 'auto' }}>
                            {tickets.map(t => (
                                <div key={t.id} style={{
                                    padding: '1rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '1rem',
                                    border: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary)' }}>{t.subject}</div>
                                        <div style={{
                                            fontSize: '0.7rem',
                                            padding: '2px 8px',
                                            borderRadius: '1rem',
                                            background: t.status === 'open' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(74, 222, 128, 0.1)',
                                            color: t.status === 'open' ? '#fbbf24' : '#4ade80'
                                        }}>
                                            {t.status === 'open' ? 'Bekliyor' : 'Çözüldü'}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {t.message}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Clock size={12} /> {t.createdAt ? t.createdAt.toDate().toLocaleDateString() : 'Az önce'}
                                    </div>
                                </div>
                            ))}
                            {tickets.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Henüz talebin yok.</p>}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Support;
