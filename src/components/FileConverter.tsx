import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Code, FileJson, ArrowRightLeft, Copy, Check, Trash2 } from 'lucide-react';
import ToolCard from './ToolCard';
import { playClick, playSuccess, playError } from '../utils/audio';

export default function FileConverter() {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const tools = [
    { id: 'json-format', title: 'تنسيق JSON', description: 'ترتيب وتنسيق أكواد JSON لتصبح مقروءة.', icon: FileJson },
    { id: 'csv-json', title: 'تحويل CSV إلى JSON', description: 'تحويل بيانات جداول CSV إلى صيغة JSON.', icon: ArrowRightLeft },
    { id: 'base64', title: 'تشفير/فك تشفير Base64', description: 'تحويل النصوص من وإلى صيغة Base64.', icon: Code },
  ];

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const processData = () => {
    playClick();
    setError('');
    setOutput('');

    if (!input.trim()) {
      setError('يرجى إدخال البيانات أولاً');
      playError();
      return;
    }

    try {
      if (activeTool === 'json-format') {
        const parsed = JSON.parse(input);
        setOutput(JSON.stringify(parsed, null, 2));
      } else if (activeTool === 'csv-json') {
        const lines = input.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const result = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          return headers.reduce((obj, header, index) => {
            obj[header] = values[index] || '';
            return obj;
          }, {} as any);
        });
        setOutput(JSON.stringify(result, null, 2));
      } else if (activeTool === 'base64') {
        // Try to decode first, if it fails or doesn't look like base64, encode it
        try {
          const decoded = atob(input);
          // If input is just regular text, atob might succeed but produce garbage. 
          // We'll just provide both options via buttons instead of auto-detecting.
        } catch (e) {
          // Fallback handled by buttons
        }
      }
      playSuccess();
    } catch (err) {
      setError('خطأ في معالجة البيانات. تأكد من صحة المدخلات.');
      playError();
    }
  };

  const encodeBase64 = () => {
    playClick();
    try {
      setOutput(btoa(unescape(encodeURIComponent(input))));
      setError('');
      playSuccess();
    } catch (e) {
      setError('خطأ في التشفير');
      playError();
    }
  };

  const decodeBase64 = () => {
    playClick();
    try {
      setOutput(decodeURIComponent(escape(atob(input))));
      setError('');
      playSuccess();
    } catch (e) {
      setError('النص المدخل ليس بصيغة Base64 صالحة');
      playError();
    }
  };

  if (activeTool) {
    const tool = tools.find(t => t.id === activeTool);
    
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
        <button 
          onClick={() => { playClick(); setActiveTool(null); setInput(''); setOutput(''); setError(''); }}
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">المدخلات</label>
                <button onClick={() => { setInput(''); setOutput(''); setError(''); playClick(); }} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                  <Trash2 size={14} /> مسح
                </button>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-64 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm text-left"
                dir="ltr"
                placeholder={activeTool === 'json-format' ? '{"name":"Ali","age":30}' : activeTool === 'csv-json' ? 'name,age\nAli,30\nOmar,25' : 'أدخل النص هنا...'}
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              
              {activeTool === 'base64' ? (
                <div className="flex gap-2 pt-2">
                  <button onClick={encodeBase64} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium">تشفير (Encode)</button>
                  <button onClick={decodeBase64} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium">فك التشفير (Decode)</button>
                </div>
              ) : (
                <button 
                  onClick={processData}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium mt-2"
                >
                  معالجة البيانات
                </button>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">المخرجات</label>
                <button onClick={handleCopy} className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium">
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'تم النسخ' : 'نسخ النتيجة'}
                </button>
              </div>
              <textarea
                readOnly
                value={output}
                className="w-full h-64 p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none font-mono text-sm text-left"
                dir="ltr"
                placeholder="النتيجة ستظهر هنا..."
              />
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">محول البيانات والنصوص</h2>
        <p className="text-gray-600">أدوات سريعة لمعالجة النصوص والبيانات البرمجية محلياً.</p>
      </div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {tools.map((tool) => (
          <motion.div key={tool.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: [0, -5, 0], transition: { y: { duration: 4, repeat: Infinity, ease: "easeInOut" } } } }}>
            <ToolCard title={tool.title} description={tool.description} icon={tool.icon} onClick={() => setActiveTool(tool.id)} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
