import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Layers, SplitSquareHorizontal, Download, Upload, Loader2, Trash2 } from 'lucide-react';
import ToolCard from './ToolCard';
import { PDFDocument } from 'pdf-lib';
import { playClick, playSuccess, playError } from '../utils/audio';

export default function PDFTools() {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const tools = [
    { id: 'merge', title: 'دمج ملفات PDF', description: 'دمج عدة ملفات PDF في ملف واحد بسرعة وبدون إنترنت.', icon: Layers },
    { id: 'split', title: 'تقسيم PDF', description: 'استخراج صفحات معينة من ملف PDF.', icon: SplitSquareHorizontal },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      playClick();
      const newFiles = Array.from(e.target.files).filter(f => f.type === 'application/pdf');
      if (newFiles.length === 0) {
        setError('يرجى اختيار ملفات PDF فقط');
        playError();
        return;
      }
      setError('');
      setFiles(prev => activeTool === 'split' ? [newFiles[0]] : [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    playClick();
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const mergePDFs = async () => {
    if (files.length < 2) {
      setError('يرجى اختيار ملفين على الأقل للدمج');
      playError();
      return;
    }
    
    setIsProcessing(true);
    playClick();
    setError('');

    try {
      const mergedPdf = await PDFDocument.create();
      
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const pdfBytes = await mergedPdf.save();
      downloadBlob(pdfBytes, 'merged_document.pdf', 'application/pdf');
      playSuccess();
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء دمج الملفات');
      playError();
    } finally {
      setIsProcessing(false);
    }
  };

  const splitPDF = async () => {
    if (files.length === 0) {
      setError('يرجى اختيار ملف PDF');
      playError();
      return;
    }

    setIsProcessing(true);
    playClick();
    setError('');

    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const totalPages = pdf.getPageCount();
      
      // For simplicity in this demo, we extract the first half of the document
      // In a real app, you'd add UI to select specific pages
      const splitPoint = Math.ceil(totalPages / 2);
      
      const newPdf = await PDFDocument.create();
      const pagesToCopy = Array.from({ length: splitPoint }, (_, i) => i);
      const copiedPages = await newPdf.copyPages(pdf, pagesToCopy);
      copiedPages.forEach((page) => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      downloadBlob(pdfBytes, `split_pages_1_to_${splitPoint}.pdf`, 'application/pdf');
      playSuccess();
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء تقسيم الملف');
      playError();
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadBlob = (data: Uint8Array, filename: string, type: string) => {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (activeTool) {
    const tool = tools.find(t => t.id === activeTool);
    
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
        <button 
          onClick={() => { playClick(); setActiveTool(null); setFiles([]); setError(''); }}
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

          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
              <input 
                type="file" 
                accept="application/pdf" 
                multiple={activeTool === 'merge'}
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-lg font-medium text-gray-900 mb-1">
                {activeTool === 'merge' ? 'اختر ملفات PDF لدمجها' : 'اختر ملف PDF لتقسيمه'}
              </p>
              <p className="text-sm text-gray-500">تتم المعالجة في متصفحك بأمان تام (لا يتم رفع الملفات لأي خادم)</p>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            {files.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">الملفات المحددة:</h3>
                <ul className="space-y-2 mb-4">
                  {files.map((file, idx) => (
                    <li key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FileText className="text-red-500 shrink-0" size={20} />
                        <span className="text-sm text-gray-700 truncate" dir="ltr">{file.name}</span>
                        <span className="text-xs text-gray-400 shrink-0">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                      <button onClick={() => removeFile(idx)} className="text-red-400 hover:text-red-600 p-1">
                        <Trash2 size={18} />
                      </button>
                    </li>
                  ))}
                </ul>

                {activeTool === 'split' && files.length > 0 && (
                  <div className="mb-4 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm">
                    ملاحظة: في هذه النسخة التجريبية، سيتم استخراج النصف الأول من صفحات الملف تلقائياً.
                  </div>
                )}

                <button 
                  onClick={activeTool === 'merge' ? mergePDFs : splitPDF}
                  disabled={isProcessing || (activeTool === 'merge' && files.length < 2)}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download size={20} />}
                  {activeTool === 'merge' ? 'دمج وتحميل' : 'تقسيم وتحميل'}
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">أدوات PDF</h2>
        <p className="text-gray-600">أدوات سريعة وآمنة لمعالجة ملفات PDF مباشرة في متصفحك.</p>
      </div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
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
