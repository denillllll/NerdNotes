import { useNavigate } from 'react-router-dom';
import { useNoteStore } from '../store/useNoteStore';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft, Type, Heading, Image as ImageIcon, CheckSquare, Table as TableIcon, Save, Check, X } from 'lucide-react';
import { useState } from 'react';

export default function Toolbar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const store = useNoteStore();
  const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, saved, error

  const handleSave = async () => {
    setSaveStatus('saving');
    const success = await store.actions.saveNote(user.uid);
    if (success) {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } else {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  return (
    <div className="h-16 glass z-50 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-surface rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={store.noteEmoji}
            onChange={(e) => store.actions.updateNoteMeta({ noteEmoji: e.target.value })}
            className="w-8 bg-transparent text-xl outline-none"
            maxLength={2}
          />
          <input
            type="text"
            value={store.noteTitle}
            onChange={(e) => store.actions.updateNoteMeta({ noteTitle: e.target.value })}
            className="bg-transparent font-display font-bold text-lg outline-none focus:border-b border-primary min-w-[100px]"
            placeholder="Note Title"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border mr-4">
          <ToolButton icon={<Type size={18} />} label="Text" onClick={() => store.actions.addWidget('text')} />
          <ToolButton icon={<Heading size={18} />} label="Heading" onClick={() => store.actions.addWidget('heading')} />
          <ToolButton icon={<ImageIcon size={18} />} label="Image" onClick={() => store.actions.addWidget('image')} />
          <ToolButton icon={<CheckSquare size={18} />} label="To-Do" onClick={() => store.actions.addWidget('todo')} />
          <ToolButton icon={<TableIcon size={18} />} label="Table" onClick={() => store.actions.addWidget('table')} />
        </div>

        <button
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold transition-all ${
            saveStatus === 'saved' ? 'bg-secondary text-white' :
            saveStatus === 'error' ? 'bg-red-500 text-white' :
            'bg-primary text-white hover:scale-105 shadow-lg shadow-primary/20'
          }`}
        >
          {saveStatus === 'saving' ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : saveStatus === 'saved' ? (
            <Check size={18} />
          ) : saveStatus === 'error' ? (
            <X size={18} />
          ) : (
            <Save size={18} />
          )}
          {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved ✓' : saveStatus === 'error' ? 'Error ✗' : 'Save'}
        </button>
      </div>
    </div>
  );
}

function ToolButton({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 hover:bg-border rounded-lg text-sm font-medium transition-colors"
      title={label}
    >
      {icon}
      <span className="hidden lg:inline">{label}</span>
    </button>
  );
}
