import React, { useState, useEffect } from 'react';
import { TrendBoard } from './components/TrendBoard';
import { ContentDeconstructor } from './components/ContentDeconstructor';
import { RemixPanel } from './components/RemixPanel';
import { NotesManager } from './components/NotesManager';
import { ScriptsManager } from './components/ScriptsManager';
import { DeconstructedNote, RemixedContent, GeneratedNote, GeneratedScript } from './types';
import { LayoutDashboard, Split, PenTool, Clapperboard } from 'lucide-react';

const App: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'trends' | 'tools' | 'notes' | 'scripts'>('trends');
  
  // App State
  const [selectedReferenceNote, setSelectedReferenceNote] = useState<DeconstructedNote | null>(null);
  const [generatedNotes, setGeneratedNotes] = useState<GeneratedNote[]>([]);
  const [generatedScripts, setGeneratedScripts] = useState<GeneratedScript[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null);

  // Load from local storage
  useEffect(() => {
    const savedNotes = localStorage.getItem('generated_notes');
    const savedScripts = localStorage.getItem('generated_scripts');
    if (savedNotes) setGeneratedNotes(JSON.parse(savedNotes));
    if (savedScripts) setGeneratedScripts(JSON.parse(savedScripts));
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('generated_notes', JSON.stringify(generatedNotes));
    localStorage.setItem('generated_scripts', JSON.stringify(generatedScripts));
  }, [generatedNotes, generatedScripts]);

  const handleSaveAndRedirect = (result: RemixedContent) => {
     if (!selectedReferenceNote) return;

     const timestamp = Date.now();
     
     // 1. Create Social Note
     const newNote: GeneratedNote = {
         id: 'n_' + timestamp,
         timestamp,
         title: result.title,
         content: result.content,
         tags: result.tags,
         suggestedVisuals: result.suggestedVisuals,
         fromPlatform: selectedReferenceNote.platform
     };
     setGeneratedNotes(prev => [newNote, ...prev]);
     setSelectedNoteId(newNote.id);

     // 2. Create Script if exists
     if (result.script && result.script.length > 0) {
         const newScript: GeneratedScript = {
             id: 's_' + timestamp,
             timestamp,
             title: result.title,
             scenes: result.script,
             fromPlatform: selectedReferenceNote.platform
         };
         setGeneratedScripts(prev => [newScript, ...prev]);
         setSelectedScriptId(newScript.id);
     }

     setSelectedReferenceNote(null);
     setActiveTab('notes'); // Jump to notes by default
  };

  const deleteNote = (id: string) => {
      setGeneratedNotes(prev => prev.filter(n => n.id !== id));
      if (selectedNoteId === id) setSelectedNoteId(null);
  };

  const deleteScript = (id: string) => {
      setGeneratedScripts(prev => prev.filter(s => s.id !== id));
      if (selectedScriptId === id) setSelectedScriptId(null);
  };

  const moveItem = (type: 'notes' | 'scripts', id: string, direction: 'up' | 'down') => {
      const setter = type === 'notes' ? setGeneratedNotes : setGeneratedScripts;
      setter((prev: any[]) => {
          const index = prev.findIndex(n => n.id === id);
          if (index === -1) return prev;
          const newItems = [...prev];
          const swapIndex = direction === 'up' ? index - 1 : index + 1;
          if (swapIndex >= 0 && swapIndex < newItems.length) {
              [newItems[index], newItems[swapIndex]] = [newItems[swapIndex], newItems[index]];
              return newItems;
          }
          return prev;
      });
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col z-10 shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">T</div>
          <span className="text-xl font-bold tracking-tight text-gray-800">TrendRemix</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button
            onClick={() => setActiveTab('trends')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'trends' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" /> 热点看板
          </button>
          
          <button
            onClick={() => { setActiveTab('tools'); setSelectedReferenceNote(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'tools' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Split className="w-5 h-5" /> 拆解与改写
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'notes' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <PenTool className="w-5 h-5" /> 我的笔记
            {generatedNotes.length > 0 && <span className="ml-auto bg-indigo-100 text-indigo-600 text-[10px] px-2 py-0.5 rounded-full">{generatedNotes.length}</span>}
          </button>

          <button
            onClick={() => setActiveTab('scripts')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'scripts' ? 'bg-purple-50 text-purple-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Clapperboard className="w-5 h-5" /> 我的脚本
            {generatedScripts.length > 0 && <span className="ml-auto bg-purple-100 text-purple-600 text-[10px] px-2 py-0.5 rounded-full">{generatedScripts.length}</span>}
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8 justify-between shrink-0">
            <h1 className="text-lg font-semibold text-gray-800">
                {activeTab === 'trends' && '热点情报箱'}
                {activeTab === 'tools' && (selectedReferenceNote ? '爆款工坊' : '内容拆解器')}
                {activeTab === 'notes' && '笔记文案库'}
                {activeTab === 'scripts' && '创作拍摄脚本'}
            </h1>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500"></div>
        </header>

        <div className="flex-1 p-6 overflow-hidden">
          {activeTab === 'trends' && <TrendBoard />}
          {activeTab === 'tools' && (
            !selectedReferenceNote ? (
                <ContentDeconstructor onDeconstruct={(note) => setSelectedReferenceNote(note)} />
            ) : (
                <RemixPanel 
                    referenceNote={selectedReferenceNote} 
                    onBack={() => setSelectedReferenceNote(null)} 
                    onSaveAndRedirect={handleSaveAndRedirect}
                />
            )
          )}
          {activeTab === 'notes' && (
              <NotesManager 
                  notes={generatedNotes}
                  selectedId={selectedNoteId}
                  onSelect={setSelectedNoteId}
                  onDelete={deleteNote}
                  onMove={(id, dir) => moveItem('notes', id, dir)}
              />
          )}
          {activeTab === 'scripts' && (
              <ScriptsManager 
                  scripts={generatedScripts}
                  selectedId={selectedScriptId}
                  onSelect={setSelectedScriptId}
                  onDelete={deleteScript}
                  onMove={(id, dir) => moveItem('scripts', id, dir)}
              />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;