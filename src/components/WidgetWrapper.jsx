import { useState, useRef, useEffect } from 'react';
import { useNoteStore } from '../store/useNoteStore';
import { X, Maximize2 } from 'lucide-react';

export default function WidgetWrapper({ widget, children }) {
  const { selectedWidgetId, actions } = useNoteStore();
  const isSelected = selectedWidgetId === widget.id;
  const wrapperRef = useRef(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(null); // null, 'corner', 'right', 'bottom'
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handlePointerDown = (e) => {
    // Don't drag if clicking inside content or resize handle
    if (e.target.closest('.content-editable') || e.target.closest('.resize-handle')) return;
    
    actions.bringToFront(widget.id);
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - widget.x,
      y: e.clientY - widget.y
    });
    
    e.stopPropagation();
  };

  const handleResizeDown = (e, type) => {
    setIsResizing(type);
    e.stopPropagation();
  };

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (isDragging) {
        // Disable drag on mobile
        if (window.innerWidth < 768) return;
        
        actions.moveWidget(widget.id, e.clientX - dragOffset.x, e.clientY - dragOffset.y);
      }
      
      if (isResizing) {
        let newWidth = widget.width;
        let newHeight = widget.height;

        if (isResizing === 'corner' || isResizing === 'right') {
          newWidth = Math.max(100, e.clientX - widget.x);
        }
        if (isResizing === 'corner' || isResizing === 'bottom') {
          newHeight = Math.max(60, e.clientY - widget.y);
        }

        actions.resizeWidget(widget.id, newWidth, newHeight);
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      setIsResizing(null);
    };

    if (isDragging || isResizing) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, isResizing, dragOffset, widget.id, widget.x, widget.y, widget.width, widget.height, actions]);

  const canResize = widget.type !== 'table' || (widget.content?.rows > 1);

  return (
    <div
      ref={wrapperRef}
      className={`absolute rounded-xl transition-shadow ${isSelected ? 'widget-selected z-[1000]' : 'border border-border hover:border-primary/30'}`}
      style={{
        left: widget.x,
        top: widget.y,
        width: widget.width,
        height: widget.height,
        zIndex: widget.zIndex,
        backgroundColor: '#1a1a1a',
      }}
      onPointerDown={handlePointerDown}
    >
      {isSelected && (
        <button
          onClick={() => actions.deleteWidget(widget.id)}
          className="absolute -top-3 -right-3 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-50"
        >
          <X size={14} />
        </button>
      )}

      <div className={`w-full h-full overflow-hidden ${['image', 'table'].includes(widget.type) ? 'p-0' : 'p-4'}`}>
        {children}
      </div>

      {isSelected && canResize && (
        <>
          {/* Right edge handle */}
          <div
            className="resize-handle absolute top-0 right-0 w-2 h-full cursor-ew-resize hover:bg-primary/30 transition-colors"
            onPointerDown={(e) => handleResizeDown(e, 'right')}
          />
          {/* Bottom edge handle */}
          <div
            className="resize-handle absolute bottom-0 left-0 w-full h-2 cursor-ns-resize hover:bg-primary/30 transition-colors"
            onPointerDown={(e) => handleResizeDown(e, 'bottom')}
          />
          {/* Corner handle */}
          <div
            className="resize-handle absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize flex items-center justify-center text-text-muted hover:text-primary transition-colors z-10"
            onPointerDown={(e) => handleResizeDown(e, 'corner')}
          >
            <Maximize2 size={12} className="rotate-90" />
          </div>
        </>
      )}
    </div>
  );
}
