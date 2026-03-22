import { useNoteStore } from '../store/useNoteStore';
import WidgetWrapper from './WidgetWrapper';
import TextWidget from './widgets/TextWidget';
import HeadingWidget from './widgets/HeadingWidget';
import ImageWidget from './widgets/ImageWidget';
import TodoWidget from './widgets/TodoWidget';
import TableWidget from './widgets/TableWidget';

export default function Canvas() {
  const { widgets, actions } = useNoteStore();

  const handleCanvasClick = (e) => {
    if (e.target === e.currentTarget) {
      actions.setSelectedWidget(null);
    }
  };

  return (
    <div 
      className="flex-1 relative overflow-auto bg-background cursor-crosshair"
      style={{
        backgroundImage: 'radial-gradient(#2a2a2a 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }}
      onClick={handleCanvasClick}
    >
      {/* Large scrollable area */}
      <div className="w-[5000px] h-[5000px] relative">
        {widgets.map((widget) => (
          <WidgetWrapper key={widget.id} widget={widget}>
            {renderWidget(widget)}
          </WidgetWrapper>
        ))}
      </div>
      
      {/* Mobile Banner */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 glass px-6 py-3 rounded-full z-[100] text-sm font-bold whitespace-nowrap">
        Switch to desktop for full editing
      </div>
    </div>
  );
}

function renderWidget(widget) {
  switch (widget.type) {
    case 'text': return <TextWidget widget={widget} />;
    case 'heading': return <HeadingWidget widget={widget} />;
    case 'image': return <ImageWidget widget={widget} />;
    case 'todo': return <TodoWidget widget={widget} />;
    case 'table': return <TableWidget widget={widget} />;
    default: return null;
  }
}
