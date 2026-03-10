import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Upload, Download, Image as ImageIcon, Maximize, Minimize, RefreshCw, Loader2 } from 'lucide-react';
import ToolCard from './ToolCard';
import { playClick, playSuccess, playError } from '../utils/audio';

export default function ImageTools() {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Resize state
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [maintainRatio, setMaintainRatio] = useState(true);
  const originalRatio = useRef<number>(1);

  // Compress state
  const [quality, setQuality] = useState<number>(80);

  // Convert state
  const [format, setFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');

  const tools = [
    { id: 'resize', title: 'تغيير حجم الصورة', description: 'تعديل أبعاد الصورة (العرض والارتفاع) بسرعة فائقة.', icon: Maximize },
    { id: 'compress', title: 'ضغط الصورة', description: 'تقليل حجم ملف الصورة مع الحفاظ على الجودة.', icon: Minimize },
    { id: 'convert', title: 'تحويل صيغة الصورة', description: 'تحويل الصور بين صيغ JPG, PNG, WEBP.', icon: RefreshCw },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    playClick();
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setWidth(img.width);
        setHeight(img.height);
        originalRatio.current = img.width / img.height;
        setImage(event.target?.result as string);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const processImage = async () => {
    if (!image) return;
    setIsProcessing(true);
    playClick();

    try {
      const img = new Image();
      img.src = image;
      await new Promise((resolve) => { img.onload = resolve; });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      let targetWidth = img.width;
      let targetHeight = img.height;
      let targetFormat = 'image/png';
      let targetQuality = 1;

      if (activeTool === 'resize') {
        targetWidth = width;
        targetHeight = height;
      } else if (activeTool === 'compress') {
        targetFormat = 'image/jpeg';
        targetQuality = quality / 100;
      } else if (activeTool === 'convert') {
        targetFormat = format;
        if (format === 'image/jpeg' || format === 'image/webp') {
          targetQuality = 0.9;
        }
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Fill white background for JPEG to prevent transparent to black issue
      if (targetFormat === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      
      const dataUrl = canvas.toDataURL(targetFormat, targetQuality);
      
      // Download
      const link = document.createElement('a');
      link.download = `processed_${fileName.split('.')[0]}.${targetFormat.split('/')[1]}`;
      link.href = dataUrl;
      link.click();
      
      playSuccess();
    } catch (error) {
      console.error(error);
      playError();
      alert('حدث خطأ أثناء معالجة الصورة');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (maintainRatio) setHeight(Math.round(val / originalRatio.current));
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (maintainRatio) setWidth(Math.round(val * originalRatio.current));
  };

  if (activeTool) {
    const tool = tools.find(t => t.id === activeTool);
    
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
        <button 
          onClick={() => { playClick(); setActiveTool(null); setImage(null); }}
          className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-2"
        >
          &rarr; العودة للأدوات
        </button>
        
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-indigo-50 rounded-xl">
              {tool && <tool.icon className="w-8 h-8 text-indigo-600" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{tool?.title}</h2>
              <p className="text-gray-500">{tool?.description}</p>
            </div>
          </div>

          {!image ? (
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-1">اختر صورة أو اسحبها هنا</p>
              <p className="text-sm text-gray-500">يدعم JPG, PNG, WEBP (تتم المعالجة في متصفحك بأمان)</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/2">
                  <img src={image} alt="Preview" className="w-full rounded-xl border border-gray-200 shadow-sm max-h-64 object-contain bg-gray-50" />
                  <p className="text-sm text-gray-500 mt-2 text-center">{fileName}</p>
                </div>
                
                <div className="w-full md:w-1/2 space-y-4">
                  {activeTool === 'resize' && (
                    <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">العرض (بكسل)</label>
                        <input type="number" value={width} onChange={(e) => handleWidthChange(Number(e.target.value))} className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" dir="ltr" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الارتفاع (بكسل)</label>
                        <input type="number" value={height} onChange={(e) => handleHeightChange(Number(e.target.value))} className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" dir="ltr" />
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={maintainRatio} onChange={(e) => setMaintainRatio(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                        <span className="text-sm text-gray-700">الحفاظ على نسبة العرض إلى الارتفاع</span>
                      </label>
                    </div>
                  )}

                  {activeTool === 'compress' && (
                    <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">جودة الصورة: {quality}%</label>
                        <input type="range" min="10" max="100" value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full accent-indigo-600" />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>حجم أقل (جودة أقل)</span>
                          <span>حجم أكبر (جودة أعلى)</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTool === 'convert' && (
                    <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">اختر الصيغة الجديدة</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['image/jpeg', 'image/png', 'image/webp'].map((fmt) => (
                            <button
                              key={fmt}
                              onClick={() => setFormat(fmt as any)}
                              className={`py-2 rounded-lg text-sm font-medium transition-colors ${format === fmt ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                            >
                              {fmt.split('/')[1].toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <button 
                      onClick={processImage}
                      disabled={isProcessing}
                      className="flex-1 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50"
                    >
                      {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download size={20} />}
                      معالجة وتحميل
                    </button>
                    <button 
                      onClick={() => { playClick(); setImage(null); }}
                      className="px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                    >
                      صورة أخرى
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">أدوات الصور</h2>
        <p className="text-gray-600">أدوات سريعة لمعالجة الصور مباشرة في متصفحك للحفاظ على خصوصيتك.</p>
      </div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {tools.map((tool) => (
          <motion.div key={tool.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <ToolCard title={tool.title} description={tool.description} icon={tool.icon} onClick={() => setActiveTool(tool.id)} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
