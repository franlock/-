import React from 'react';
import { GeneratedScript } from '../types';
import { Trash2, ArrowUp, ArrowDown, Clapperboard, Calendar, FileText } from 'lucide-react';

interface Props {
  scripts: GeneratedScript[];
  onDelete: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const ScriptsManager: React.FC<Props> = ({ scripts, onDelete, onMove, selectedId, onSelect }) => {
  const selectedScript = scripts.find(s => s.id === selectedId) || scripts[0];

  if (scripts.length === 0) {
    return (
        <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-white rounded-xl border border-gray-100 shadow-sm p-10">
            <Clapperboard className="w-16 h-16 mb-4 opacity-20" />
            <h3 className="text-lg font-bold text-gray-600">暂无创作脚本</h3>
            <p className="text-sm mt-2">请在“拆解与改写”中对视频进行创作</p>
        </div>
    );
  }

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-4/12 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                脚本库
                <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">{scripts.length}</span>
            </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
            {scripts.map((script, index) => (
                <div 
                    key={script.id}
                    onClick={() => onSelect(script.id)}
                    className={`group relative p-4 rounded-lg border transition-all cursor-pointer flex flex-col gap-1 ${
                        selectedScript?.id === script.id 
                        ? 'bg-purple-50 border-purple-200' 
                        : 'bg-white border-gray-100 hover:border-purple-100'
                    }`}
                >
                    <div className="flex justify-between items-start">
                        <h4 className="font-bold text-sm line-clamp-1 text-gray-800">{script.title}</h4>
                        <span className="text-[10px] text-gray-400">{new Date(script.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                        <span className="bg-gray-100 px-1 rounded">{script.fromPlatform}参考</span>
                        <span>{script.scenes.length} 个镜头</span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-black/5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1">
                            <button onClick={(e) => { e.stopPropagation(); onMove(script.id, 'up'); }} disabled={index === 0} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"><ArrowUp className="w-3 h-3" /></button>
                            <button onClick={(e) => { e.stopPropagation(); onMove(script.id, 'down'); }} disabled={index === scripts.length - 1} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"><ArrowDown className="w-3 h-3" /></button>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); onDelete(script.id); }} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-3 h-3" /></button>
                    </div>
                </div>
            ))}
        </div>
      </div>

      <div className="w-full lg:w-8/12 flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
         {selectedScript ? (
            <div className="flex flex-col h-full overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-white">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">{selectedScript.title}</h2>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(selectedScript.timestamp).toLocaleString()}</span>
                        <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> 共 {selectedScript.scenes.length} 个分镜</span>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <table className="w-full text-sm text-left border-collapse bg-white rounded-lg overflow-hidden border border-gray-100">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                            <tr>
                                <th className="px-4 py-3 font-bold w-16">镜号</th>
                                <th className="px-4 py-3 font-bold">画面内容 (Visual)</th>
                                <th className="px-4 py-3 font-bold">音频文案 (Audio)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {selectedScript.scenes.map((scene) => (
                                <tr key={scene.sceneNo} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-4 py-4 font-bold text-indigo-600 align-top">{scene.sceneNo}</td>
                                    <td className="px-4 py-4 text-gray-700 leading-relaxed align-top">{scene.visual}</td>
                                    <td className="px-4 py-4 text-gray-900 font-medium bg-indigo-50/20 leading-relaxed align-top">{scene.audio}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
         ) : (
             <div className="flex-1 flex items-center justify-center text-gray-400">选择脚本查看详情</div>
         )}
      </div>
    </div>
  );
};