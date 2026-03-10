/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import YouTubeTools from './components/YouTubeTools';
import ImageTools from './components/ImageTools';
import FileConverter from './components/FileConverter';
import PDFTools from './components/PDFTools';
import AdminDashboard from './components/AdminDashboard';
import AuthModal from './components/AuthModal';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { playClick } from './utils/audio';

function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const languages = ['العربية', 'English', 'Français', 'Español', 'Türkçe', 'فارسی', 'اردو', 'हिन्दी', 'Русский', '中文'];
  return (
    <select 
      value={language} 
      onChange={(e) => { playClick(); setLanguage(e.target.value as any); }}
      className="p-2 border border-gray-300 rounded-lg text-sm outline-none bg-white"
    >
      {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
    </select>
  );
}

function AppContent() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden" dir="rtl">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onOpenAuth={openAuth}
      />

      <main className="flex-1 lg:mr-64 transition-all duration-300 h-screen overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center">
            <button 
              onClick={() => { playClick(); setIsSidebarOpen(true); }}
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-md"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-indigo-600 mr-4">{t('app_name')}</h1>
          </div>
          <LanguageSelector />
        </header>

        <div className="p-6 lg:p-10 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'home' && <Home setActiveTab={setActiveTab} />}
              {activeTab === 'youtube' && <YouTubeTools />}
              {activeTab === 'image' && <ImageTools />}
              {activeTab === 'file' && <FileConverter />}
              {activeTab === 'pdf' && <PDFTools />}
              {activeTab === 'admin' && <AdminDashboard />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialMode={authMode} 
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}
