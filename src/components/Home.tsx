import React from 'react';
import { motion } from 'motion/react';
import { Youtube, Image as ImageIcon, FileType, FileText, Zap, ShieldCheck, ArrowLeft } from 'lucide-react';
import { playClick, playHover } from '../utils/audio';

interface HomeProps {
  setActiveTab: (tab: string) => void;
}

export default function Home({ setActiveTab }: HomeProps) {
  const features = [
    { id: 'youtube', title: 'أدوات اليوتيوب', description: 'استخراج الكلمات الدلالية، العناوين، الصور المصغرة، وشعارات القنوات بضغطة زر.', icon: Youtube, color: 'text-red-600', bg: 'bg-red-50' },
    { id: 'image', title: 'أدوات الصور', description: 'تغيير حجم الصور، ضغطها، وتحويل صيغها بسرعة فائقة وبدون إنترنت.', icon: ImageIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'file', title: 'محول الملفات والبيانات', description: 'تحويل بين JSON و CSV، وتنسيق الأكواد، وتشفير Base64 بسهولة.', icon: FileType, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'pdf', title: 'أدوات PDF', description: 'دمج ملفات PDF، وتقسيمها بأمان تام على متصفحك دون رفعها لأي خادم.', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium mb-6">
            <Zap size={16} className="text-yellow-300" />
            <span>أسرع منصة أدوات عربية</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            أدواتك الشاملة في مكان واحد، <br />بسرعة البرق!
          </h1>
          <p className="text-indigo-100 text-lg md:text-xl mb-8 leading-relaxed">
            مجموعة متكاملة من الأدوات المجانية المصممة لتسهيل عملك اليومي. معالجة سريعة، آمنة، وتعمل مباشرة من متصفحك دون الحاجة لرفع ملفاتك.
          </p>
          <button 
            onClick={() => { playClick(); setActiveTab('youtube'); }}
            onMouseEnter={playHover}
            className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-colors shadow-lg flex items-center gap-2"
          >
            ابدأ الآن <ArrowLeft size={20} />
          </button>
        </div>
      </motion.div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-indigo-50 rounded-xl text-indigo-600">
            <Zap size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">سرعة المعالجة</p>
            <p className="text-2xl font-bold text-gray-900">فورية (Client-Side)</p>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-emerald-50 rounded-xl text-emerald-600">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">الخصوصية والأمان</p>
            <p className="text-2xl font-bold text-gray-900">100% آمنة</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-amber-50 rounded-xl text-amber-600">
            <FileType size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">الأدوات المتاحة</p>
            <p className="text-2xl font-bold text-gray-900">+15 أداة</p>
          </div>
        </motion.div>
      </div>

      {/* Features Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">استكشف أقسام الموقع</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div 
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: [0, -5, 0] }}
                transition={{ 
                  opacity: { duration: 0.5, delay: 0.1 * index },
                  y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.1 * index }
                }}
                onClick={() => { playClick(); setActiveTab(feature.id); }}
                onMouseEnter={playHover}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-4 rounded-xl ${feature.bg} ${feature.color} group-hover:scale-110 transition-transform`}>
                    <Icon size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
