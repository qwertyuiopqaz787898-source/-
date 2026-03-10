import React, { createContext, useContext, useState } from 'react';

type Language = 'العربية' | 'English' | 'Français' | 'Español' | 'Türkçe' | 'فارسی' | 'اردو' | 'हिन्दी' | 'Русский' | '中文';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  'العربية': {
    'app_name': 'أدواتي الشاملة',
    'home': 'الرئيسية',
    'youtube_tools': 'أدوات اليوتيوب',
    'image_tools': 'أدوات الصور',
    'file_converter': 'محول الملفات',
    'pdf_tools': 'أدوات PDF',
    'admin_dashboard': 'لوحة تحكم الإدارة',
    'login': 'تسجيل الدخول',
    'register': 'حساب جديد',
    'logout': 'تسجيل الخروج',
    'language': 'اللغة',
    'welcome_back': 'مرحباً بعودتك!',
    'join_us': 'انضم إلينا الآن',
    'username': 'اسم المستخدم',
    'password': 'كلمة المرور',
    'or_continue_with': 'أو المتابعة باستخدام',
    'google_account': 'حساب جوجل',
  },
  'English': {
    'app_name': 'My All-in-One Tools',
    'home': 'Home',
    'youtube_tools': 'YouTube Tools',
    'image_tools': 'Image Tools',
    'file_converter': 'File Converter',
    'pdf_tools': 'PDF Tools',
    'admin_dashboard': 'Admin Dashboard',
    'login': 'Login',
    'register': 'Register',
    'logout': 'Logout',
    'language': 'Language',
    'welcome_back': 'Welcome back!',
    'join_us': 'Join us now',
    'username': 'Username',
    'password': 'Password',
    'or_continue_with': 'Or continue with',
    'google_account': 'Google Account',
  },
  // Add other languages here...
  'Français': {}, 'Español': {}, 'Türkçe': {}, 'فارسی': {}, 'اردو': {}, 'हिन्दी': {}, 'Русский': {}, '中文': {}
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('العربية');

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
