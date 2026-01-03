import React from 'react';
import { GeneratedNote } from '../types';
import { Trash2, ArrowUp, ArrowDown, Video, Smartphone, Calendar, Search } from 'lucide-react';

interface Props {
  notes: GeneratedNote[];
  onDelete: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const NotesManager: React.FC<Props> = ({ notes, onDelete, onMove, selectedId, onSelect }) => {
  const selectedNote = notes.find(n => n.id === selectedId) || notes[0];

  if (notes.length === 0) {
    return (
        <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-white rounded-xl border border-gray-100 shadow-sm p-10">
            <Smartphone className="w-16 h-16 mb-4 opacity-20" />
            <h3 className="text-lg font-bold text-gray-600">暂无生成笔记</h3>
            <p className="text-sm mt-2">请前往「拆解与改写」模块生成新的内容</p>
        </div>
    );
  }

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">
      {/* Left List: Note Management */}
      <div className="w-full lg:w-4/12 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                我的笔记列表
                <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">{notes.length}</span>
            </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
            {notes.map((note, index) => (
                <div 
                    key={note.id}
                    onClick={() => onSelect(note.id)}
                    className={`group relative p-4 rounded-lg border transition-all cursor-pointer flex flex-col gap-2 ${
                        selectedNote?.id === note.id 
                        ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                        : 'bg-white border-gray-100 hover:border-indigo-100 hover:bg-gray-50'
                    }`}
                >
                    <div className="flex justify-between items-start">
                        <h4 className={`font-bold text-sm line-clamp-1 ${selectedNote?.id === note.id ? 'text-indigo-900' : 'text-gray-800'}`}>
                            {note.title}
                        </h4>
                        <span className="text-[10px] text-gray-400 flex-shrink-0">
                            {new Date(note.timestamp).toLocaleDateString()}
                        </span>
                    </div>
                    
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {note.content}
                    </p>

                    <div className="flex items-center justify-between mt-1 pt-2 border-t border-black/5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1">
                            <button 
                                onClick={(e) => { e.stopPropagation(); onMove(note.id, 'up'); }}
                                disabled={index === 0}
                                className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 text-gray-500"
                                title="上移"
                            >
                                <ArrowUp className="w-3 h-3" />
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); onMove(note.id, 'down'); }}
                                disabled={index === notes.length - 1}
                                className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 text-gray-500"
                                title="下移"
                            >
                                <ArrowDown className="w-3 h-3" />
                            </button>
                        </div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
                            className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition-colors flex items-center gap-1 text-[10px]"
                        >
                            <Trash2 className="w-3 h-3" /> 删除
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Right Area: Preview */}
      <div className="w-full lg:w-8/12 flex flex-col h-full overflow-hidden">
         {selectedNote ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full overflow-y-auto custom-scrollbar p-8 flex flex-col items-center">
                
                {/* Visual Guide Card */}
                <div className="w-full max-w-lg mb-8 bg-gray-900 text-gray-100 p-6 rounded-xl shadow-lg border-l-4 border-indigo-500 shrink-0">
                    <div className="flex items-center gap-2 mb-4 text-indigo-300 border-b border-gray-800 pb-2">
                        <Video className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">执行：拍摄与配图建议</span>
                    </div>
                    <div className="space-y-3">
                         {selectedNote.suggestedVisuals.replace(/\*\*/g, '').split('\n').filter(l => l.trim()).map((point, idx) => (
                             <div key={idx} className="flex items-start gap-3 text-sm leading-relaxed opacity-90">
                                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                                <span>{point.trim()}</span>
                             </div>
                         ))}
                    </div>
                </div>

                {/* Phone Preview */}
                <div className="w-full max-w-[375px] h-[812px] max-h-[85vh] bg-white rounded-[40px] shadow-2xl border-[8px] border-gray-900 overflow-hidden flex flex-col relative shrink-0 transform-gpu">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl z-20"></div>
                    
                    {/* Status Bar */}
                    <div className="bg-white pt-3 pb-2 px-6 flex justify-between items-end text-[10px] text-gray-800 font-medium z-10 relative">
                        <span>9:41</span>
                        <div className="flex gap-1.5">
                            <div className="w-4 h-2.5 bg-gray-200 rounded-[2px] relative overflow-hidden">
                                <div className="absolute inset-0 bg-black w-[80%]"></div>
                            </div>
                        </div>
                    </div>

                    {/* Content Scroll Area */}
                    <div className="flex-1 overflow-y-auto no-scrollbar bg-white relative pb-20 z-0">
                        {/* Image Placeholder */}
                        <div className="w-full aspect-[3/4] bg-gray-100 flex items-center justify-center text-gray-300 relative group cursor-pointer">
                            <div className="text-center">
                                <Smartphone className="w-8 h-8 mx-auto mb-2" />
                                <span className="text-xs">封面图占位</span>
                            </div>
                            {/* Tags on Image */}
                            <div className="absolute bottom-4 left-4 flex gap-2">
                                <div className="bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-full">
                                    {selectedNote.fromPlatform}风
                                </div>
                            </div>
                        </div>

                        <div className="p-4">
                            <h1 className="text-lg font-bold text-gray-900 leading-snug mb-3">
                                {selectedNote.title}
                            </h1>
                            <div className="text-[14px] text-gray-800 leading-relaxed whitespace-pre-wrap font-normal space-y-4">
                                {selectedNote.content}
                            </div>
                            <div className="mt-6 pt-4 border-t border-gray-50">
                                <div className="flex flex-wrap gap-2 text-blue-600 text-sm font-medium">
                                    {selectedNote.tags.map(t => (
                                        <span key={t}>#{t}</span>
                                    ))}
                                </div>
                                <div className="text-xs text-gray-400 mt-4">
                                    {new Date(selectedNote.timestamp).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-100 py-3 px-6 flex justify-between items-center pb-6 z-10">
                        <div className="w-full h-9 bg-gray-100 rounded-full flex items-center px-4 text-gray-400 text-xs gap-2">
                            <Search className="w-3 h-3" /> 说点什么...
                        </div>
                        <div className="flex gap-4 ml-4 text-gray-600">
                             <span>❤️</span>
                             <span>⭐</span>
                             <span>💬</span>
                        </div>
                    </div>
                </div>

            </div>
         ) : (
             <div className="flex-1 flex items-center justify-center text-gray-400">
                 选择左侧笔记查看详情
             </div>
         )}
      </div>
    </div>
  );
};