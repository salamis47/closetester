import React, { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, doc } from 'firebase/firestore';
import { Send, User, MessageSquare, LayoutDashboard, PlayCircle, PlusCircle, Settings, LogOut, ShieldAlert } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

// Yerel Sidebar kaldırıldı

const Chat = ({ user, onLogout, isAdmin, profile }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isBanned, setIsBanned] = useState(false);
    const scrollRef = useRef();
    const location = useLocation();

    // Küfür filtresi listesi (Kapsamlı Türkçe listesi)
    const badWords = [
        'amk', 'aq', 'amına', 'siktir', 'sik', 'piç', 'yarrak', 'yarak', 'göt', 'oç',
        'yavşak', 'ibne', 'fahişe', 'kahpe', 'puşt', 'gavat', 'amcık', 'meme', 'taşak'
    ];

    useEffect(() => {
        if (!user) return;
        // Kullanıcının ban durumunu takip et
        const unsubUser = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
            if (docSnap.exists()) {
                setIsBanned(docSnap.data().isBanned || false);
            }
        });
        return () => unsubUser();
    }, [user]);

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
        if (isBanned) {
            alert("Hesabınız yasaklandığı için mesaj gönderemezsiniz.");
            return;
        }

        // Küfür filtresi uygula
        let processedText = newMessage;
        const normalizedInput = processedText.toLocaleLowerCase('tr-TR');

        badWords.forEach(word => {
            const normalizedWord = word.toLocaleLowerCase('tr-TR');
            const regex = new RegExp(normalizedWord, 'gi');

            // Eğer normalleştirilmiş metinde küfür varsa, orijinal metindeki karşılığını yıldızla
            if (normalizedInput.includes(normalizedWord)) {
                // Daha gelişmiş bir eşleşme ve değiştirme:
                // Orijinal metni üzerinden geçerek, normalleştirilmiş haliyle eşleşen yerleri bulur
                let searchIndex = 0;
                while ((searchIndex = normalizedInput.indexOf(normalizedWord, searchIndex)) !== -1) {
                    const originalPart = processedText.substring(searchIndex, searchIndex + normalizedWord.length);
                    processedText = processedText.substring(0, searchIndex) +
                        '*'.repeat(originalPart.length) +
                        processedText.substring(searchIndex + normalizedWord.length);
                    searchIndex += normalizedWord.length;
                }
            }
        });

        try {
            await addDoc(collection(db, 'messages'), {
                text: processedText,
                uid: user.uid,
                displayName: profile?.name || user.displayName || user.email.split('@')[0],
                createdAt: serverTimestamp()
            });
            setNewMessage('');
        } catch (error) {
            console.error("Mesaj gönderme hatası:", error);
            alert("Mesaj gönderilemedi: " + error.message);
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

                    <form onSubmit={handleSendMessage} style={{ padding: '1.5rem', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '1rem', position: 'relative' }}>
                        {isBanned && (
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, borderRadius: '0 0 1.5rem 1.5rem' }}>
                                <span style={{ color: '#f87171', fontWeight: 'bold' }}>Sohbet erişiminiz kısıtlandı.</span>
                            </div>
                        )}
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={isBanned ? "Mesaj gönderemezsiniz" : "Bir mesaj yazın..."}
                            className="glass"
                            disabled={isBanned}
                            style={{ flex: 1, background: 'rgba(255,255,255,0.02)', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '1rem', color: 'white', outline: 'none', opacity: isBanned ? 0.5 : 1 }}
                        />
                        <button type="submit" className="btn-primary" style={{ padding: '0.75rem', borderRadius: '1rem' }} disabled={isBanned}>
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default Chat;
