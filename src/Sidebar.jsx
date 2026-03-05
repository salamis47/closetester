import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, PlayCircle, PlusCircle, MessageSquare, Settings, LogOut, ShieldAlert } from 'lucide-react';

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

export default Sidebar;
