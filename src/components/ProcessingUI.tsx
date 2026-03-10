import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, Loader2, Download } from 'lucide-react';
import { playSuccess, playClick } from '../utils/audio';

interface ProcessingUIProps {
  title: string;
  description: string;
  icon: React.ElementType;
  accept?: string;
}

export default function ProcessingUI({ title, description, icon: Icon, accept }: ProcessingUIProps) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'processing' | 'done'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('processing');
      setProgress(0);
      playClick();
    }
  };

  useEffect(() => {
    if (status === 'processing') {
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setStatus('done');
            playSuccess();
            return 100;
          }
          return p + Math.floor(Math.random() * 10) + 5;
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [status]);

  const handleDownload = () => {
    playClick();
    const blob = new Blob(['Processed file content (Simulation)'], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `processed_${file?.name || 'file.txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-6"
    >
      {status === 'idle' && (
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Icon className="w-12 h-12 text-indigo-400 mb-4" />
          <p className="text-gray-700 font-medium text-lg">اسحب وأفلت الملف هنا</p>
          <p className="text-sm text-gray-500 mt-2">أو انقر لاختيار ملف من جهازك</p>
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef}
            accept={accept}
            onChange={handleFile}
          />
        </motion.div>
      )}

      {status === 'processing' && (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">جاري المعالجة...</h3>
          <p className="text-gray-500 mb-6">{file?.name}</p>
          
          <div className="w-full bg-gray-100 rounded-full h-3 mb-2 overflow-hidden">
            <motion.div 
              className="bg-indigo-600 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
            />
          </div>
          <p className="text-sm font-medium text-indigo-600">{progress}%</p>
        </div>
      )}

      {status === 'done' && (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center shadow-sm"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          </motion.div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">تمت العملية بنجاح!</h3>
          <p className="text-gray-600 mb-6">الملف جاهز للتحميل الآن.</p>
          
          <div className="flex gap-4 justify-center">
            <button 
              onClick={handleDownload}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2 font-medium shadow-sm hover:shadow-md"
            >
              <Download className="w-5 h-5" />
              تحميل الملف
            </button>
            <button 
              onClick={() => {
                setStatus('idle');
                setFile(null);
                setProgress(0);
                playClick();
              }}
              className="px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              معالجة ملف آخر
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
