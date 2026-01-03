import React, { useState, useEffect, useRef } from 'react';
import { analyzeContentWithAI } from '../services/geminiService';
import { DeconstructedNote } from '../types';
import { 
  Sparkles, Image as ImageIcon, ExternalLink, Trash2, 
  History, XCircle, CheckCircle2, Smartphone, MonitorPlay, 
  Plus, Check, Loader2, MousePointerClick, Link as LinkIcon,
  AlertCircle
} from 'lucide-react';

interface Props {
  onDeconstruct: (note: DeconstructedNote) => void;
}

type ConnectionStatus = 'idle' | 'visiting' | 'connected';

const MAX_FILE_SIZE_MB = 20;
const MAX_VIDEO_DURATION_S = 60;

export const ContentDeconstructor: React.FC<Props> = ({ onDeconstruct }) => {
  const [inputText, setInputText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStage, setProgressStage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<DeconstructedNote[]>([]);
  
  // Platform Connection State
  const [xhsStatus, setXhsStatus] = useState<ConnectionStatus>('idle');
  const [douyinStatus, setDouyinStatus] = useState<ConnectionStatus>('idle');

  // Link Detection State
  const [detectedLink, setDetectedLink] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('deconstruct_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // Save history on change
  useEffect(() => {
    localStorage.setItem('deconstruct_history', JSON.stringify(history));
  }, [history]);

  // Link detection logic
  useEffect(() => {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const match = inputText.match(urlRegex);
      if (match && match.length > 0) {
          setDetectedLink(match[0]);
      } else {
          setDetectedLink(null);
      }
  }, [inputText]);

  // Handle File Selection (Append mode)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Fix: Cast Array.from result to File[] to avoid 'unknown' type error during property access (e.g., .size)
      const newFiles = Array.from(e.target.files) as File[];
      
      // Check file sizes
      const oversizedFiles = newFiles.filter(f => f.size > MAX_FILE_SIZE_MB * 1024 * 1024);
      if (oversizedFiles.length > 0) {
          setError(`部分文件超过 ${MAX_FILE_SIZE_MB}MB 限制，请重新选择。`);
          return;
      }

      // Combine with existing files, limiting to 9 total for UI sanity
      setSelectedFiles(prev => [...prev, ...newFiles].slice(0, 9));
      setError(null);
    }
    // Reset input value so same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle Paste Event (Screenshots)
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    const newFiles: File[] = [];
    
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
            const file = new File([blob], `screenshot-${Date.now()}.png`, { type: blob.type });
            newFiles.push(file);
        }
      }
    }

    if (newFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...newFiles].slice(0, 9));
      setError(null);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handlePlatformClick = (platform: 'xhs' | 'douyin') => {
    if (platform === 'xhs') setXhsStatus('visiting');
    if (platform === 'douyin') setDouyinStatus('visiting');
  };

  const confirmLogin = (platform: 'xhs' | 'douyin') => {
    if (platform === 'xhs') setXhsStatus('connected');
    if (platform === 'douyin') setDouyinStatus('connected');
  };

  const simulateProgress = () => {
    setProgress(0);
    setProgressStage('正在准备上传...');
    
    const stages = [
      { pct: 15, msg: '正在上传素材到 AI 引擎...' },
      { pct: 35, msg: 'Gemini 正在提取音轨与画面分镜...' },
      { pct: 55, msg: '正在进行语音转文字 (ASR)...' },
      { pct: 75, msg: '正在进行画面花字识别 (OCR)...' },
      { pct: 95, msg: '正在生成深度拆解报告...' }
    ];

    let currentStage = 0;
    const interval = setInterval(() => {
      if (currentStage < stages.length) {
        setProgress(stages[currentStage].pct);
        setProgressStage(stages[currentStage].msg);
        currentStage++;
      } else {
        clearInterval(interval);
      }
    }, 1500);

    return interval;
  };

  const handleAnalyze = async () => {
    if (!inputText.trim() && selectedFiles.length === 0) {
      setError("请上传图片/视频，或粘贴文案内容，以便 AI 进行分析。");
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    const progressInterval = simulateProgress();

    try {
      const imageUrls = selectedFiles.map(file => URL.createObjectURL(file));
      const result = await analyzeContentWithAI(inputText, selectedFiles);
      
      const finalNote: DeconstructedNote = {
          ...result,
          originalImages: imageUrls,
          timestamp: Date.now()
      };

      setHistory(prev => [finalNote, ...prev]);
      setProgress(100);
      setProgressStage('拆解完成！');
      
      setTimeout(() => {
          clearInterval(progressInterval);
          onDeconstruct(finalNote);
          setIsProcessing(false);
          setInputText('');
          setSelectedFiles([]);
          setProgress(0);
      }, 500);

    } catch (err: any) {
      clearInterval(progressInterval);
      console.error(err);
      setError(err.message || "分析失败，请检查网络或 API Key。");
      setIsProcessing(false);
    }
  };

  const deleteHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="h-full w-full max-w-5xl mx-auto flex flex-col gap-8 pb-20 overflow-y-auto custom-scrollbar px-2">
      
      {/* --- Top Section: Header --- */}
      <div className="text-center space-y-2 pt-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
                <Sparkles className="w-6 h-6 text-indigo-600" />
                全能爆款内容拆解器
            </h2>
            <p className="text-gray-500 text-sm">
            上传视频可深度提取<b>口播语音</b>与<b>画面花字</b>，支持批量分析。
            </p>
      </div>

      {/* --- Section 1: Source & Login Status --- */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold">1</span>
                <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">平台连接</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* XiaoHongShu */}
                <div className={`border rounded-lg p-4 transition-all ${xhsStatus === 'connected' ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-lg text-red-500 shadow-sm"><Smartphone className="w-5 h-5" /></div>
                            <div>
                                <h4 className="font-bold text-gray-900">小红书</h4>
                                <div className="text-xs mt-1">
                                    {xhsStatus === 'connected' ? (
                                        <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> 已确认登录</span>
                                    ) : (
                                        <span className="text-gray-400">未连接</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {xhsStatus === 'idle' && (
                            <a href="https://www.xiaohongshu.com/explore" target="_blank" rel="noreferrer" onClick={() => handlePlatformClick('xhs')}
                                className="text-xs bg-white border border-gray-300 hover:border-red-500 hover:text-red-500 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1">
                                前往登录 <ExternalLink className="w-3 h-3" />
                            </a>
                        )}
                        {xhsStatus === 'visiting' && (
                            <button onClick={() => confirmLogin('xhs')}
                                className="text-xs bg-red-600 text-white hover:bg-red-700 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 shadow-sm animate-pulse">
                                确认已登录 <Check className="w-3 h-3" />
                            </button>
                        )}
                        {xhsStatus === 'connected' && (
                            <a href="https://www.xiaohongshu.com/explore" target="_blank" rel="noreferrer"
                                className="text-xs text-gray-400 hover:text-gray-600 px-3 py-1.5 flex items-center gap-1">
                                再次打开 <ExternalLink className="w-3 h-3" />
                            </a>
                        )}
                    </div>
                </div>

                {/* Douyin */}
                <div className={`border rounded-lg p-4 transition-all ${douyinStatus === 'connected' ? 'bg-gray-100 border-gray-300' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-lg text-black shadow-sm"><MonitorPlay className="w-5 h-5" /></div>
                            <div>
                                <h4 className="font-bold text-gray-900">抖音</h4>
                                <div className="text-xs mt-1">
                                    {douyinStatus === 'connected' ? (
                                        <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> 已确认登录</span>
                                    ) : (
                                        <span className="text-gray-400">未连接</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {douyinStatus === 'idle' && (
                            <a href="https://www.douyin.com/" target="_blank" rel="noreferrer" onClick={() => handlePlatformClick('douyin')}
                                className="text-xs bg-white border border-gray-300 hover:border-black hover:text-black px-3 py-1.5 rounded-full transition-colors flex items-center gap-1">
                                前往登录 <ExternalLink className="w-3 h-3" />
                            </a>
                        )}
                        {douyinStatus === 'visiting' && (
                            <button onClick={() => confirmLogin('douyin')}
                                className="text-xs bg-black text-white hover:bg-gray-800 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 shadow-sm animate-pulse">
                                确认已登录 <Check className="w-3 h-3" />
                            </button>
                        )}
                        {douyinStatus === 'connected' && (
                            <a href="https://www.douyin.com/" target="_blank" rel="noreferrer"
                                className="text-xs text-gray-400 hover:text-gray-600 px-3 py-1.5 flex items-center gap-1">
                                再次打开 <ExternalLink className="w-3 h-3" />
                            </a>
                        )}
                    </div>
                </div>
            </div>
      </div>

      {/* --- Section 2: Upload Area (With Paste & Add More) --- */}
      <div className="relative flex-shrink-0">
            {isProcessing && (
                <div className="absolute inset-0 bg-white/95 z-20 flex flex-col items-center justify-center rounded-xl p-8 border border-indigo-100 shadow-xl backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-md space-y-6 text-center">
                         <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
                         <div className="space-y-2">
                             <h3 className="text-xl font-bold text-gray-800">AI 正在深度拆解素材</h3>
                             <p className="text-indigo-600 font-medium animate-pulse h-6">{progressStage}</p>
                         </div>
                         <div className="relative w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
                            <div 
                                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500 ease-out" 
                                style={{ width: `${progress}%` }}
                            ></div>
                         </div>
                         <div className="text-xs text-gray-400">
                             上传大文件可能需要较长时间，请保持页面开启
                         </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-lg shadow-gray-100 border border-gray-200 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold">2</span>
                        <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">导入素材</h3>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 bg-white px-2 py-1 rounded border border-gray-100">
                            <AlertCircle className="w-3 h-3 text-indigo-400" />
                            视频限 {MAX_FILE_SIZE_MB}MB / {MAX_VIDEO_DURATION_S}s
                        </div>
                        <div className="text-xs text-gray-400 flex items-center gap-1">
                             <MousePointerClick className="w-3 h-3" />
                             支持 Ctrl+V 粘贴
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2">
                    {/* Left: Media Upload */}
                    <div 
                        className="p-6 border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col"
                        onPaste={handlePaste}
                        tabIndex={0}
                    >
                        <label className="block text-sm font-bold text-gray-700 mb-3">图片 / 视频 (支持批量)</label>
                        
                        <div className="flex-1 min-h-[220px] bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 hover:border-indigo-300 transition-colors p-4 outline-none focus:ring-2 focus:ring-indigo-100">
                             {selectedFiles.length === 0 ? (
                                 <div className="h-full flex flex-col items-center justify-center text-gray-400 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <ImageIcon className="w-10 h-10 mb-2 opacity-30" />
                                    <p className="text-sm font-medium text-gray-600">点击上传 或 Ctrl+V 粘贴截图</p>
                                    <p className="text-xs mt-1">支持 JPG, PNG, MP4</p>
                                 </div>
                             ) : (
                                 <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                     {selectedFiles.map((f, i) => (
                                         <div key={i} className="relative aspect-square group rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm">
                                             {f.type.startsWith('video') ? (
                                                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white gap-1">
                                                    <MonitorPlay className="w-6 h-6" />
                                                    <span className="text-[9px] uppercase font-bold">Video</span>
                                                    <span className="text-[8px] opacity-60">{(f.size / (1024*1024)).toFixed(1)}MB</span>
                                                </div>
                                             ) : (
                                                <img src={URL.createObjectURL(f)} className="w-full h-full object-cover" alt="preview" />
                                             )}
                                             <button 
                                                onClick={() => removeFile(i)}
                                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                             >
                                                <Trash2 className="w-3 h-3" />
                                             </button>
                                         </div>
                                     ))}
                                     <div 
                                        className="aspect-square rounded-lg border-2 border-dashed border-indigo-200 flex items-center justify-center cursor-pointer hover:bg-indigo-50 text-indigo-400 hover:text-indigo-600 transition-colors"
                                        onClick={() => fileInputRef.current?.click()}
                                     >
                                         <Plus className="w-6 h-6" />
                                     </div>
                                 </div>
                             )}
                        </div>
                        <input 
                            ref={fileInputRef}
                            type="file" 
                            accept="image/*,video/*" 
                            multiple
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>

                    {/* Right: Text Input */}
                    <div className="p-6 flex flex-col">
                        <label className="block text-sm font-bold text-gray-700 mb-3">文案或链接 (自动提取)</label>
                        <div className="relative flex-1">
                            <textarea
                                className="w-full h-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm resize-none bg-gray-50 text-gray-800 placeholder-gray-400 transition-all min-h-[220px]"
                                placeholder="粘贴文案，或粘贴 抖音/小红书 分享链接..."
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                            />
                            {detectedLink && (
                                <div className="absolute bottom-3 left-3 right-3 bg-blue-50 border border-blue-100 text-blue-700 p-2 rounded-lg text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                                    <LinkIcon className="w-3 h-3" />
                                    <span className="truncate flex-1">检测到链接: {detectedLink}</span>
                                    {selectedFiles.length === 0 && <span className="text-blue-500 font-medium whitespace-nowrap">请上传对应视频</span>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end items-center gap-4">
                     {error && (
                        <span className="text-red-500 text-sm flex items-center gap-1 animate-pulse">
                            <XCircle className="w-4 h-4" /> {error}
                        </span>
                     )}
                     <button
                        onClick={handleAnalyze}
                        disabled={isProcessing}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 font-bold flex items-center gap-2 shadow-sm"
                    >
                        <Sparkles className="w-5 h-5" />
                        开始拆解
                    </button>
                </div>
            </div>
      </div>

      {/* --- Bottom Section: History --- */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[300px] flex-shrink-0">
         <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <History className="w-5 h-5 text-gray-500" />
                历史记录
            </h3>
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{history.length} 条记录</span>
        </div>
        
        {history.length === 0 ? (
             <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2 p-8">
                 <History className="w-10 h-10 opacity-10" />
                 <p className="text-sm">暂无记录，快去上方拆解一篇爆款内容吧！</p>
             </div>
        ) : (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {history.map((item) => (
                    <div 
                        key={item.id} 
                        onClick={() => onDeconstruct(item)}
                        className="group relative bg-white border border-gray-100 rounded-xl p-4 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${item.platform.includes('小红书') ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-700'}`}>
                                {item.platform}
                            </span>
                            <span className="text-[10px] text-gray-400">{new Date(item.timestamp).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex gap-3 mb-2">
                             {item.originalImages && item.originalImages.length > 0 && (
                                 <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-100">
                                     {item.type.includes('视频') ? (
                                         <div className="w-full h-full flex items-center justify-center bg-black/5"><MonitorPlay className="w-6 h-6 text-gray-400" /></div>
                                     ) : (
                                         <img src={item.originalImages[0]} alt="thumb" className="w-full h-full object-cover" />
                                     )}
                                 </div>
                             )}
                             <div>
                                 <h4 className="font-bold text-gray-800 text-sm line-clamp-1 mb-1">{item.title || '无标题内容'}</h4>
                                 <p className="text-xs text-gray-500 line-clamp-2">{item.contentBody}</p>
                             </div>
                        </div>

                        <button 
                            onClick={(e) => deleteHistoryItem(e, item.id)}
                            className="absolute top-4 right-4 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};