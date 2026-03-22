import { useNoteStore } from '../../store/useNoteStore';

export default function HeadingWidget({ widget }) {
  const { actions } = useNoteStore();

  const handleInput = (e) => {
    actions.updateContent(widget.id, { text: e.target.innerText });
  };

  const setLevel = (level) => {
    actions.updateContent(widget.id, { level });
  };

  const Tag = `h${widget.content.level || 1}`;
  const fontSizes = {
    1: 'text-3xl',
    2: 'text-2xl',
    3: 'text-xl'
  };

  return (
    <div className="w-full h-full flex flex-col gap-2">
      <div className="flex gap-2 mb-1">
        {[1, 2, 3].map(l => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded border transition-colors ${
              widget.content.level === l ? 'bg-primary border-primary text-white' : 'border-border text-text-muted hover:border-primary'
            }`}
          >
            H{l}
          </button>
        ))}
      </div>
      <Tag
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        suppressContentEditableWarning
        className={`content-editable w-full font-display font-bold text-text-primary ${fontSizes[widget.content.level || 1]}`}
        placeholder="Heading..."
      >
        {widget.content.text}
      </Tag>
    </div>
  );
}
