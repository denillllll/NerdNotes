import { useRef, useEffect, useState } from 'react';
import { useNoteStore } from '../../store/useNoteStore';
import { Bold, Italic, Underline } from 'lucide-react';

export default function TextWidget({ widget }) {
  const { actions } = useNoteStore();
  const editorRef = useRef(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== widget.content.html) {
      editorRef.current.innerHTML = widget.content.html;
    }
  }, [widget.content.html]);

  const handleInput = () => {
    actions.updateContent(widget.id, { html: editorRef.current.innerHTML });
  };

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const wrapperRect = editorRef.current.getBoundingClientRect();
      
      setToolbarPos({
        top: rect.top - wrapperRect.top - 40,
        left: rect.left - wrapperRect.left + (rect.width / 2) - 50
      });
      setShowToolbar(true);
    } else {
      setShowToolbar(false);
    }
  };

  const execCommand = (command) => {
    document.execCommand(command, false, null);
    handleInput();
  };

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar relative">
      {showToolbar && (
        <div 
          className="absolute z-50 flex gap-1 bg-surface border border-border p-1 rounded-lg shadow-xl"
          style={{ top: toolbarPos.top, left: toolbarPos.left }}
        >
          <button onClick={() => execCommand('bold')} className="p-1 hover:bg-border rounded transition-colors"><Bold size={14} /></button>
          <button onClick={() => execCommand('italic')} className="p-1 hover:bg-border rounded transition-colors"><Italic size={14} /></button>
          <button onClick={() => execCommand('underline')} className="p-1 hover:bg-border rounded transition-colors"><Underline size={14} /></button>
        </div>
      )}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onMouseUp={handleMouseUp}
        className="content-editable w-full min-h-full text-text-primary text-sm leading-relaxed"
        placeholder="Start typing..."
      />
    </div>
  );
}
