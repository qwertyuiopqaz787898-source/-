import React, { useState } from 'react';
import { Search, Hash, FileText, BarChart2, DollarSign, Globe, Clock, Link, MessageSquare, Image as ImageIcon, Layout, Loader2, Copy, Check, ExternalLink, Download } from 'lucide-react';
import { motion } from 'motion/react';
import ToolCard from './ToolCard';
import { GoogleGenAI } from '@google/genai';
import { playClick, playSuccess, playError } from '../utils/audio';

export default function YouTubeTools() {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState('العربية');
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const languages = [
    'العربية', 'English', 'Français', 'Español', 'Türkçe', 
    'فارسی', 'اردو', 'हिन्दी', 'Русский', '中文'
  ];

  // Timestamps specific state
  const [timestampText, setTimestampText] = useState('');
  const [timestamps, setTimestamps] = useState<{time: string, desc: string}[]>([]);

  // Subscribe link specific state
  const [channelUrl, setChannelUrl] = useState('');
  const [subLink, setSubLink] = useState('');

  // Thumbnails specific state
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnails, setThumbnails] = useState<{quality: string, url: string}[]>([]);

  // Channel Art specific state
  const [channelData, setChannelData] = useState<{logo: string | null, banner: string | null} | null>(null);

  const tools = [
    { id: 'keywords', title: 'مولد الكلمات الدلالية', description: 'استخرج أفضل الكلمات المفتاحية لزيادة مشاهدات الفيديو.', icon: Search },
    { id: 'hashtags', title: 'مولد الهاشتاجات', description: 'احصل على هاشتاجات شائعة ومناسبة لمحتواك.', icon: Hash },
    { id: 'title-desc', title: 'مولد العناوين', description: 'اكتب عناوين جذابة باستخدام الذكاء الاصطناعي.', icon: FileText },
    { id: 'thumbnail', title: 'تحميل الصور المصغرة', description: 'قم بتنزيل الصورة المصغرة لأي فيديو بجودة عالية.', icon: ImageIcon },
    { id: 'channel-logo', title: 'تحميل شعار القناة', description: 'احصل على صورة الشعار (Logo) لأي قناة يوتيوب بجودة عالية.', icon: ImageIcon },
    { id: 'channel-banner', title: 'تحميل غلاف القناة', description: 'احصل على صورة الغلاف (Banner) لأي قناة يوتيوب بجودة عالية.', icon: Layout },
    { id: 'timestamps', title: 'مولد الطوابع الزمنية', description: 'قم بإنشاء طوابع زمنية منسقة للوصف.', icon: Clock },
    { id: 'subscribe-link', title: 'مولد رابط الاشتراك', description: 'أنشئ رابط اشتراك مباشر لقناتك.', icon: Link },
  ];

  const resetState = () => {
    setTopic('');
    setResults([]);
    setError('');
    setChannelUrl('');
    setSubLink('');
    setTimestampText('');
    setTimestamps([]);
    setVideoUrl('');
    setThumbnails([]);
    setChannelData(null);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadImage = async (url: string, filename: string) => {
    try {
      playClick();
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      playSuccess();
    } catch (e) {
      window.open(url, '_blank');
      playSuccess();
    }
  };

  const generateAIContent = async (type: string) => {
    if (!topic.trim()) return;
    
    setIsLoading(true);
    setError('');
    setResults([]);
    playClick();

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      let prompt = '';
      
      if (type === 'keywords') {
        prompt = `Generate 15 highly searched YouTube keywords/tags in ${language} for a video about: "${topic}". Return ONLY a comma-separated list of keywords, nothing else.`;
      } else if (type === 'hashtags') {
        prompt = `Generate 10 trending YouTube hashtags in ${language} for a video about: "${topic}". Return ONLY a space-separated list of hashtags starting with #, nothing else.`;
      } else if (type === 'title-desc') {
        prompt = `Generate 5 catchy, click-worthy YouTube video titles in ${language} for a video about: "${topic}". Return ONLY the titles separated by newlines, nothing else.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      const text = response.text || '';
      
      let parsedResults: string[] = [];
      if (type === 'keywords') {
        parsedResults = text.split(',').map(k => k.trim()).filter(k => k);
      } else if (type === 'hashtags') {
        parsedResults = text.split(' ').map(k => k.trim()).filter(k => k);
      } else if (type === 'title-desc') {
        parsedResults = text.split('\n').map(k => k.trim().replace(/^[-*0-9.]+\s*/, '')).filter(k => k);
      }
      
      setResults(parsedResults);
      playSuccess();
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء التوليد. يرجى المحاولة مرة أخرى.');
      playError();
    } finally {
      setIsLoading(false);
    }
  };

  const generateSubLink = () => {
    playClick();
    if (!channelUrl.trim()) return;
    try {
      const url = new URL(channelUrl);
      if (url.hostname.includes('youtube.com')) {
        url.searchParams.set('sub_confirmation', '1');
        setSubLink(url.toString());
        playSuccess();
      } else {
        setError('يرجى إدخال رابط يوتيوب صحيح');
        playError();
      }
    } catch (e) {
      setError('يرجى إدخال رابط صحيح');
      playError();
    }
  };

  const parseTimestamps = () => {
    playClick();
    const lines = timestampText.split('\n');
    const parsed = lines.map(line => {
      const match = line.match(/(\d{1,2}:\d{2}(?::\d{2})?)\s+(.+)/);
      if (match) {
        return { time: match[1], desc: match[2].trim() };
      }
      return null;
    }).filter(Boolean) as {time: string, desc: string}[];
    
    if (parsed.length > 0) {
      setTimestamps(parsed);
      playSuccess();
    } else {
      setError('لم يتم العثور على طوابع زمنية صالحة. استخدم الصيغة: 00:00 الوصف');
      playError();
    }
  };

  const getThumbnails = () => {
    playClick();
    if (!videoUrl.trim()) return;
    
    const match = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/);
    const id = match ? match[1] : null;
    
    if (!id) {
      setError('رابط فيديو غير صالح. يرجى إدخال رابط يوتيوب صحيح.');
      playError();
      return;
    }
    
    setError('');
    setThumbnails([
      { quality: 'جودة عالية جداً (Max Res)', url: `https://img.youtube.com/vi/${id}/maxresdefault.jpg` },
      { quality: 'جودة عالية (HD)', url: `https://img.youtube.com/vi/${id}/hqdefault.jpg` },
      { quality: 'جودة متوسطة (SD)', url: `https://img.youtube.com/vi/${id}/mqdefault.jpg` },
    ]);
    playSuccess();
  };

  const getChannelImage = async (type: 'logo' | 'banner') => {
    if (!channelUrl.trim()) return;
    setIsLoading(true);
    setError('');
    setChannelData(null);
    playClick();

    try {
      // Try corsproxy.io first as it handles YouTube better than allorigins sometimes
      let html = '';
      try {
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(channelUrl)}`;
        const response = await fetch(proxyUrl);
        html = await response.text();
      } catch (e) {
        // Fallback to allorigins
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(channelUrl)}`;
        const response = await fetch(proxyUrl);
        html = await response.text();
      }

      let resultUrl = null;

      if (type === 'logo') {
        const logoMatch = html.match(/<meta property="og:image" content="([^"]+)"/) || 
                          html.match(/"avatar":\{"thumbnails":\[\{"url":"([^"]+)"/);
        resultUrl = logoMatch ? logoMatch[1] : null;
        if (resultUrl) {
          resultUrl = resultUrl.replace(/\\u0026/g, '&');
          if (resultUrl.startsWith('//')) resultUrl = 'https:' + resultUrl;
          // Get highest quality by removing size modifiers
          resultUrl = resultUrl.replace(/=s\d+-[^"]+/, '=s0');
        }
      } else {
        const bannerMatch = html.match(/"banner":\{"thumbnails":\[\{"url":"([^"]+)"/) ||
                            html.match(/"tvBanner":\{"thumbnails":\[\{"url":"([^"]+)"/) ||
                            html.match(/"mobileBanner":\{"thumbnails":\[\{"url":"([^"]+)"/);
        resultUrl = bannerMatch ? bannerMatch[1] : null;
        if (resultUrl) {
          resultUrl = resultUrl.replace(/\\u0026/g, '&');
          // Get highest quality
          resultUrl = resultUrl.replace(/=w\d+-[^"]+/, '=w0');
        }
      }

      if (!resultUrl) {
        throw new Error(type === 'logo' ? 'لم يتم العثور على شعار لهذه القناة' : 'لم يتم العثور على غلاف لهذه القناة');
      }

      setChannelData(type === 'logo' ? { logo: resultUrl, banner: null } : { logo: null, banner: resultUrl });
      playSuccess();
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'فشل في استخراج البيانات. تأكد من أن الرابط صحيح (مثال: https://www.youtube.com/@channel).');
      playError();
    } finally {
      setIsLoading(false);
    }
  };

  if (activeTool) {
    const tool = tools.find(t => t.id === activeTool);
    const isAITool = ['keywords', 'hashtags', 'title-desc'].includes(activeTool);
    const isChannelArt = activeTool === 'channel-logo' || activeTool === 'channel-banner';
    
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <button 
          onClick={() => {
            playClick();
            setActiveTool(null);
            resetState();
          }}
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
          
          {isAITool ? (
            <div className="space-y-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">لغة النتائج</label>
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)}
                  className="p-2 border border-gray-300 rounded-xl outline-none"
                >
                  {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">موضوع الفيديو</label>
                <div className="flex gap-3">
                  <input 
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="مثال: كيفية الربح من اليوتيوب، مراجعة ايفون 15..."
                    className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && generateAIContent(activeTool)}
                  />
                  <button 
                    onClick={() => generateAIContent(activeTool)}
                    disabled={isLoading || !topic.trim()}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <tool.icon className="w-5 h-5" />}
                    توليد
                  </button>
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>

              {results.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-900">النتائج المقترحة:</h3>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          playClick();
                          window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(topic)}`, '_blank');
                        }}
                        className="text-sm text-emerald-600 hover:text-emerald-800 font-medium flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg"
                      >
                        <ExternalLink size={16} /> اختبار في يوتيوب
                      </button>
                      <button 
                        onClick={() => handleCopy(results.join(activeTool === 'title-desc' ? '\n' : ' '))}
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg"
                      >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? 'تم النسخ' : 'نسخ الكل'}
                      </button>
                    </div>
                  </div>
                  
                  {activeTool === 'title-desc' ? (
                    <ul className="space-y-3">
                      {results.map((res, idx) => (
                        <li key={idx} className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm flex justify-between items-center">
                          <span className="text-gray-800 font-medium">{res}</span>
                          <div className="flex gap-2">
                            <button onClick={() => { playClick(); window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(res)}`, '_blank'); }} className="text-gray-400 hover:text-emerald-600" title="اختبار العنوان"><ExternalLink size={16}/></button>
                            <button onClick={() => handleCopy(res)} className="text-gray-400 hover:text-indigo-600" title="نسخ"><Copy size={16}/></button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {results.map((res, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 shadow-sm"
                        >
                          {res}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {activeTool !== 'title-desc' && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500 mb-2">نسخ كعلامات (Tags):</p>
                      <textarea 
                        readOnly
                        value={results.join(activeTool === 'hashtags' ? ' ' : ', ')}
                        className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 outline-none resize-none h-24"
                        dir="rtl"
                      />
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          ) : activeTool === 'thumbnail' ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رابط فيديو اليوتيوب</label>
                <div className="flex gap-3">
                  <input 
                    type="url"
                    value={videoUrl}
                    onChange={(e) => { setVideoUrl(e.target.value); setError(''); }}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-left"
                    dir="ltr"
                    onKeyDown={(e) => e.key === 'Enter' && getThumbnails()}
                  />
                  <button 
                    onClick={getThumbnails}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 font-medium"
                  >
                    استخراج
                  </button>
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>
              
              {thumbnails.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <h3 className="font-semibold text-gray-900">نتائج الاستخراج والاختبار:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {thumbnails.map((t, idx) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col items-center">
                        <p className="text-sm font-medium text-gray-700 mb-3">{t.quality}</p>
                        <img src={t.url} alt={`Thumbnail ${t.quality}`} className="w-full rounded-lg shadow-sm mb-4 object-cover aspect-video bg-gray-200" />
                        <div className="flex gap-2 w-full">
                          <button 
                            onClick={() => downloadImage(t.url, `thumbnail_${idx}.jpg`)}
                            className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 text-sm"
                          >
                            <Download size={16} /> تحميل
                          </button>
                          <button 
                            onClick={() => { playClick(); window.open(t.url, '_blank'); }}
                            className="flex-1 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
                          >
                            <ExternalLink size={16} /> اختبار ومعاينة
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          ) : isChannelArt ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رابط القناة</label>
                <div className="flex gap-3">
                  <input 
                    type="url"
                    value={channelUrl}
                    onChange={(e) => { setChannelUrl(e.target.value); setError(''); }}
                    placeholder="https://www.youtube.com/@channelname"
                    className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-left"
                    dir="ltr"
                    onKeyDown={(e) => e.key === 'Enter' && getChannelImage(activeTool === 'channel-logo' ? 'logo' : 'banner')}
                  />
                  <button 
                    onClick={() => getChannelImage(activeTool === 'channel-logo' ? 'logo' : 'banner')}
                    disabled={isLoading}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 font-medium disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'استخراج'}
                  </button>
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>
              
              {channelData && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <h3 className="font-semibold text-gray-900">نتائج الاستخراج والاختبار:</h3>
                  
                  {activeTool === 'channel-banner' && channelData.banner && (
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col items-center">
                      <p className="text-sm font-medium text-gray-700 mb-3">غلاف القناة (Banner)</p>
                      <img src={channelData.banner} alt="Channel Banner" className="w-full rounded-lg shadow-sm mb-4 object-cover h-32 md:h-48 bg-gray-200" />
                      <div className="flex gap-2 w-full md:w-1/2">
                        <button 
                          onClick={() => downloadImage(channelData.banner!, 'channel_banner.jpg')}
                          className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                          <Download size={16} /> تحميل الغلاف
                        </button>
                        <button 
                          onClick={() => { playClick(); window.open(channelData.banner!, '_blank'); }}
                          className="flex-1 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                          <ExternalLink size={16} /> اختبار ومعاينة
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTool === 'channel-logo' && channelData.logo && (
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col items-center">
                      <p className="text-sm font-medium text-gray-700 mb-3">شعار القناة (Logo)</p>
                      <img src={channelData.logo} alt="Channel Logo" className="w-32 h-32 rounded-full shadow-sm mb-4 object-cover bg-gray-200 border-4 border-white" />
                      <div className="flex gap-2 w-full md:w-1/2">
                        <button 
                          onClick={() => downloadImage(channelData.logo!, 'channel_logo.jpg')}
                          className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                          <Download size={16} /> تحميل الشعار
                        </button>
                        <button 
                          onClick={() => { playClick(); window.open(channelData.logo!, '_blank'); }}
                          className="flex-1 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                          <ExternalLink size={16} /> اختبار ومعاينة
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          ) : activeTool === 'subscribe-link' ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رابط القناة</label>
                <div className="flex gap-3">
                  <input 
                    type="url"
                    value={channelUrl}
                    onChange={(e) => { setChannelUrl(e.target.value); setError(''); }}
                    placeholder="https://www.youtube.com/@channelname"
                    className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-left"
                    dir="ltr"
                    onKeyDown={(e) => e.key === 'Enter' && generateSubLink()}
                  />
                  <button 
                    onClick={generateSubLink}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 font-medium"
                  >
                    توليد الرابط
                  </button>
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>
              
              {subLink && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-50 p-6 rounded-xl border border-emerald-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-emerald-900">رابط الاشتراك المباشر والاختبار:</h3>
                    <button 
                      onClick={() => { playClick(); window.open(subLink, '_blank'); }}
                      className="text-sm text-emerald-700 hover:text-emerald-900 font-medium flex items-center gap-1 bg-emerald-100 px-3 py-1.5 rounded-lg"
                    >
                      <ExternalLink size={16} /> اختبار الرابط
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      readOnly
                      value={subLink}
                      className="flex-1 p-3 bg-white border border-emerald-200 rounded-lg text-sm text-gray-700 outline-none text-left"
                      dir="ltr"
                    />
                    <button 
                      onClick={() => handleCopy(subLink)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          ) : activeTool === 'timestamps' ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">أدخل الطوابع الزمنية (مثال: 00:00 المقدمة)</label>
                <textarea 
                  value={timestampText}
                  onChange={(e) => setTimestampText(e.target.value)}
                  placeholder="00:00 المقدمة&#10;01:30 الشرح الأول&#10;05:45 الخاتمة"
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none h-48"
                  dir="rtl"
                />
                <button 
                  onClick={parseTimestamps}
                  className="mt-3 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 font-medium w-full justify-center"
                >
                  تنسيق الطوابع الزمنية
                </button>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>

              {timestamps.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-900">الطوابع المنسقة والاختبار:</h3>
                    <button 
                      onClick={() => handleCopy(timestamps.map(t => `${t.time} ${t.desc}`).join('\n'))}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                      {copied ? 'تم النسخ' : 'نسخ الكل'}
                    </button>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
                    {timestamps.map((t, idx) => (
                      <div key={idx} className="flex gap-4 items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                        <div className="flex gap-4 items-center">
                          <span className="text-indigo-600 font-mono font-medium bg-indigo-50 px-2 py-1 rounded">{t.time}</span>
                          <span className="text-gray-700">{t.desc}</span>
                        </div>
                        <button onClick={() => { playClick(); alert(`اختبار الطابع الزمني: سينتقل الفيديو إلى الدقيقة ${t.time}`); }} className="text-gray-400 hover:text-emerald-600" title="اختبار الطابع">
                          <ExternalLink size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-12 text-center">
              <Loader2 className="w-12 h-12 text-gray-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-500 font-medium">جاري تطوير هذه الأداة...</p>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">أدوات اليوتيوب</h2>
        <p className="text-gray-600">مجموعة متكاملة لتحسين أداء قناتك وفيديوهاتك على يوتيوب.</p>
      </div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
          }
        }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        {tools.map((tool) => (
          <motion.div key={tool.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: [0, -5, 0], transition: { y: { duration: 4, repeat: Infinity, ease: "easeInOut" } } } }}>
            <ToolCard
              title={tool.title}
              description={tool.description}
              icon={tool.icon}
              onClick={() => setActiveTool(tool.id)}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
