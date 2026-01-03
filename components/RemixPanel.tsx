import React, { useState } from 'react';
import { DeconstructedNote, RemixedContent, NoteType } from '../types';
import { generateRemixedContent } from '../services/geminiService';
import { Sparkles, ArrowLeft, Video, Hash, Lightbulb, Mic, Type as TypeIcon, Eye, Clapperboard, Layers } from 'lucide-react';

interface Props {
  referenceNote: DeconstructedNote;
  onBack: () => void;
  onSaveAndRedirect: (result: RemixedContent) => void;
}

export const RemixPanel: React.FC<Props> = ({ referenceNote, onBack, onSaveAndRedirect }) => {
  const [userContext, setUserContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!userContext.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      const output = await generateRemixedContent(referenceNote, userContext);
      onSaveAndRedirect(output);
    } catch (e: any) {
      setError(e.message || "生成失败");
      setIsGenerating(false);
    }
  };

  const renderCleanPoints = (text?: string) => {
    if (!text) return <p className="text-sm text-gray-500 italic">暂无内容</p>;
    // Strict removal of "-" symbol at line start
    const cleanText = text.replace(/\*\*/g, '').replace(/^[ \t]*-[ \t]*/gm, '');
    const points = cleanText.split('\n').filter(line => line.trim() !== '');

    return (
        <div className="space-y-2">
            {points.map((point, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-sm text-gray-700 leading-relaxed">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0 opacity-60" />
                    <span>{point.trim()}</span>
                </div>
            ))}
        </div>
    );
  };

  return (
    <div className="h-full flex flex-col items-center justify-center max-w-6xl mx-auto px-4">
      <div className="w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col md:flex-row h-[85vh]">
          
          {/* Left: Deconstructed Context */}
          <div className="w-full md:w-5/12 bg-gray-50 p-6 overflow-y-auto border-r border-gray-100 custom-scrollbar">
            <button onClick={onBack} className="text-gray-500 hover:text-gray-900 flex items-center gap-1 text-sm font-medium w-fit mb-6">
              <ArrowLeft className="w-4 h-4" /> 返回上传页
            </button>

             <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-medium uppercase tracking-wider ${
                        referenceNote.type === NoteType.VIDEO ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-blue-100 text-blue-700 border-blue-200'
                    }`}>
                        {referenceNote.platform} • {referenceNote.type}
                    </span>
                </div>
                <h3 className="font-bold text-gray-800 leading-snug">{referenceNote.title}</h3>
             </div>

             <div className="space-y-6">
                {/* Visual Analysis */}
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1 mb-2">
                        <Eye className="w-3 h-3" /> 视觉拆解 (拍摄风格/镜头语言/剪辑节奏)
                    </label>
                    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                        {renderCleanPoints(referenceNote.visualDescription)}
                    </div>
                </div>

                {/* Original Script */}
                {referenceNote.type === NoteType.VIDEO && referenceNote.videoScript && (
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1 mb-2">
                            <Clapperboard className="w-3 h-3" /> 原视频脚本参考
                        </label>
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                            <table className="w-full text-[11px] text-left border-collapse">
                                <thead className="bg-gray-100 border-b border-gray-200 text-gray-500">
                                    <tr>
                                        <th className="px-2 py-2 font-bold w-10">镜</th>
                                        <th className="px-2 py-2 font-bold">画面</th>
                                        <th className="px-2 py-2 font-bold">文案</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {referenceNote.videoScript.map((scene) => (
                                        <tr key={scene.sceneNo}>
                                            <td className="px-2 py-2 font-medium text-gray-400">{scene.sceneNo}</td>
                                            <td className="px-2 py-2 text-gray-600">{scene.visual}</td>
                                            <td className="px-2 py-2 text-gray-800 bg-gray-50/50">{scene.audio}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Audio/Screen Text Highlights */}
                <div className="grid grid-cols-1 gap-4">
                    {referenceNote.spokenContent && (
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1 mb-2">
                                <Mic className="w-3 h-3" /> 关键口播内容
                            </label>
                            <div className="bg-purple-50 p-3 rounded-lg border border-purple-100 shadow-sm text-xs text-gray-700 leading-relaxed">
                                {referenceNote.spokenContent}
                            </div>
                        </div>
                    )}
                </div>

                {/* AI Title Suggestions */}
                {referenceNote.titleSuggestions && referenceNote.titleSuggestions.length > 0 && (
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1 mb-2">
                            <Lightbulb className="w-3 h-3" /> AI 爆款标题建议 (20字内)
                        </p>
                        <div className="flex flex-col gap-2">
                            {referenceNote.titleSuggestions.map((ts, i) => (
                                <div key={i} className="text-xs text-gray-700 bg-white border border-gray-200 rounded-lg p-3 shadow-sm flex items-center gap-2">
                                    <span className="text-indigo-500 font-bold">{i+1}.</span>
                                    {ts}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
             </div>
          </div>

          {/* Right: Input & Action Area */}
          <div className="w-full md:w-7/12 p-8 flex flex-col bg-white">
              <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-2">
                        <Sparkles className="w-6 h-6 text-indigo-500" />
                        新内容创作
                    </h2>
                    <p className="text-sm text-gray-500">描述你的产品卖点或新主题，AI 将为你一键生成笔记与拍摄脚本</p>
                </div>
                
                <div className="space-y-6">
                    <div className="relative">
                        <textarea
                            className="w-full p-6 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-base h-64 resize-none bg-indigo-50/10 placeholder-indigo-300 shadow-inner transition-all"
                            placeholder={referenceNote.remixIdea || "例如：我想根据这个视频的剪辑节奏，创作一篇推广我的新款奶茶的笔记..."}
                            value={userContext}
                            onChange={(e) => setUserContext(e.target.value)}
                        />
                        {referenceNote.remixIdea && !userContext && (
                            <button className="absolute bottom-4 right-4 text-xs text-indigo-600 bg-white px-4 py-2 rounded-full shadow-md border border-indigo-100 flex items-center gap-2 hover:bg-indigo-50 transition-colors"
                                onClick={() => setUserContext(referenceNote.remixIdea)}>
                                ✨ 采用 AI 建议
                            </button>
                        )}
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !userContext.trim()}
                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 font-bold text-lg flex justify-center items-center gap-2 shadow-xl shadow-indigo-100"
                    >
                        {isGenerating ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                正在创作爆款内容...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                生成并保存
                            </>
                        )}
                    </button>
                    
                    {error && <p className="text-red-500 text-sm mt-2 text-center bg-red-50 py-2 rounded-lg">{error}</p>}
                    <p className="text-xs text-gray-400 text-center">AI 将根据视频类型同步生成文案与分镜脚本</p>
                </div>
              </div>
          </div>
      </div>
    </div>
  );
};