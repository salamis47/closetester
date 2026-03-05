import React, { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { Send, User, MessageSquare, LayoutDashboard, PlayCircle, PlusCircle, Settings, LogOut, ShieldAlert } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

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

const Chat = ({ user, onLogout, isAdmin }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const scrollRef = useRef();
    const location = useLocation();

    useEffect(() => {
        const q = query(
            collection(db, 'messages'),
            orderBy('createdAt', 'desc'),
            limit(50)
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(msgs.reverse());
        });

        return () => unsub();
    }, []);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        try {
            await addDoc(collection(db, 'messages'), {
                text: newMessage,
                uid: user.uid,
                displayName: user.displayName || user.email.split('@')[0],
                createdAt: serverTimestamp()
            });
            setNewMessage('');
        } catch (error) {
            console.error("Mesaj gönderme hatası:", error);
        }
    };

    return (
        <div className="dashboard-layout">
            <div className="gradient-bg"></div>
            <Sidebar onLogout={onLogout} location={location} isAdmin={isAdmin} />

            <main className="dashboard-main" style={{ display: 'flex', flexDirection: 'column', height: '100vh', paddingBottom: '2rem' }}>
                <header style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Topluluk Sohbeti</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Diğer geliştiricilerle yardımlaşın ve sohbet edin.</p>
                </header>

                <div className="glass" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: '1.5rem' }}>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {messages.map((msg) => (
                            <div key={msg.id} style={{ 
                                alignSelf: msg.uid === user?.uid ? 'flex-end' : 'flex-start',
                                maxWidth: '70%'
                            }}>
                                <div style={{ 
                                    fontSize: '0.75rem', 
                                    color: 'var(--text-muted)', 
                                    marginBottom: '0.25rem',
                                    textAlign: msg.uid === user?.uid ? 'right' : 'left'
                                }}>
                                    {msg.displayName}
                                </div>
                                <div style={{ 
                                    padding: '0.75rem 1rem', 
                                    borderRadius: msg.uid === user?.uid ? '1.25rem 1.25rem 0 1.25rem' : '1.25rem 1.25rem 1.25rem 0',
                                    background: msg.uid === user?.uid ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                    color: 'white',
                                    fontSize: '0.9rem'
                                }}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={scrollRef}></div>
                    </div>

                    <form onSubmit={handleSendMessage} style={{ padding: '1.5rem', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '1rem' }}>
                        <input 
                            type="text" 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Bir mesaj yazın..."
                            className="glass"
                            style={{ flex: 1, background: 'rgba(255,255,255,0.02)', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '1rem', color: 'white', outline: 'none' }}
                        />
                        <button type="submit" className="btn-primary" style={{ padding: '0.75rem', borderRadius: '1rem' }}>
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default Chat;
