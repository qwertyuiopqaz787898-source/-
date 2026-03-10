import React from 'react';
import { Home, Youtube, Image as ImageIcon, FileType, FileText, Menu, X, LogIn, UserPlus, LogOut, ShieldCheck, User } from 'lucide-react';
import { playClick, playHover } from '../utils/audio';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export default function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen, onOpenAuth }: SidebarProps) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const navItems = [
    { id: 'home', label: t('home'), icon: Home },
    { id: 'youtube', label: t('youtube_tools'), icon: Youtube },
    { id: 'image', label: t('image_tools'), icon: ImageIcon },
    { id: 'file', label: t('file_converter'), icon: FileType },
    { id: 'pdf', label: t('pdf_tools'), icon: FileText },
  ];

  if (user?.role === 'admin') {
    navItems.push({ id: 'admin', label: t('admin_dashboard'), icon: ShieldCheck });
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => { playClick(); setIsOpen(false); }}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 right-0 h-full w-64 bg-white border-l border-gray-200 z-50 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 shrink-0">
          <h1 className="text-xl font-bold text-indigo-600">أدواتي الشاملة</h1>
          <button 
            className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-md"
            onClick={() => { playClick(); setIsOpen(false); }}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onMouseEnter={playHover}
                onClick={() => {
                  playClick();
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                  ${isActive 
                    ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon size={20} className={isActive ? 'text-indigo-600' : 'text-gray-400'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Auth Section */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 shrink-0">
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-2">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{user.username}</p>
                  <p className="text-xs text-gray-500">{user.role === 'admin' ? 'مدير الموقع' : 'مستخدم'}</p>
                </div>
              </div>
              <button
                onMouseEnter={playHover}
                onClick={() => { playClick(); logout(); if(activeTab === 'admin') setActiveTab('home'); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors font-medium"
              >
                <LogOut size={16} />
                {t('logout')}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onMouseEnter={playHover}
                onClick={() => { playClick(); onOpenAuth('login'); setIsOpen(false); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow-sm"
              >
                <LogIn size={18} />
                {t('login')}
              </button>
              <button
                onMouseEnter={playHover}
                onClick={() => { playClick(); onOpenAuth('register'); setIsOpen(false); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium shadow-sm"
              >
                <UserPlus size={18} />
                {t('register')}
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
