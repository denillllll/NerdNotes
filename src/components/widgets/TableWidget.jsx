import { useNoteStore } from '../../store/useNoteStore';
import { Plus, Minus, Bold, X, Maximize2 } from 'lucide-react';

export default function TableWidget({ widget }) {
  const { actions } = useNoteStore();
  const { rows, cols, cells } = widget.content;

  const updateCell = (r, c, updates) => {
    const newCells = [...cells];
    newCells[r][c] = { ...newCells[r][c], ...updates };
    actions.updateContent(widget.id, { cells: newCells });
  };

  const addRow = () => {
    const newRow = Array(cols).fill(0).map(() => ({ text: '', bold: false, italic: false, align: 'left' }));
    actions.updateContent(widget.id, { 
      rows: rows + 1, 
      cells: [...cells, newRow] 
    });
  };

  const addCol = () => {
    const newCells = cells.map(row => [...row, { text: '', bold: false, italic: false, align: 'left' }]);
    actions.updateContent(widget.id, { 
      cols: cols + 1, 
      cells: newCells 
    });
  };

  const removeRowAt = (index) => {
    if (rows <= 1) return;
    const newCells = cells.filter((_, r) => r !== index);
    actions.updateContent(widget.id, { rows: rows - 1, cells: newCells });
  };

  const removeColAt = (index) => {
    if (cols <= 1) return;
    const newCells = cells.map(row => row.filter((_, c) => c !== index));
    actions.updateContent(widget.id, { cols: cols - 1, cells: newCells });
  };

  const fitToContent = () => {
    const cellWidth = 160;
    const cellHeight = 44;
    const paddingX = 40; // Handles + gutters
    const paddingY = 40; 
    
    const targetWidth = Math.min(1200, (cols * cellWidth) + paddingX);
    const targetHeight = Math.min(800, (rows * cellHeight) + paddingY);
    
    actions.resizeWidget(widget.id, targetWidth, targetHeight);
  };

  return (
    <div className="w-full h-full flex flex-col group/table-container relative">
      {/* Fit to Content Button - Visible on hover */}
      <button
        onClick={fitToContent}
        className="absolute -top-10 right-0 p-2 bg-surface border border-border rounded-lg text-text-muted hover:text-primary opacity-0 group-hover/table-container:opacity-100 transition-all z-50 shadow-xl flex items-center gap-2 text-xs font-bold"
        title="Fit to Content"
      >
        <Maximize2 size={14} />
        Fit Table
      </button>

      <div className="flex-1 overflow-hidden border border-border/50 rounded-lg bg-surface/40 shadow-inner relative group/table">
        <table className="w-full h-full border-collapse table-fixed">
          <thead>
            <tr className="bg-white/20 border-b-2 border-white/40 h-12">
              <th className="w-6 border-r border-white/20"></th>
              {cells[0].map((_, c) => (
                <th key={c} className="border-r border-white/20 p-0 relative group/cell">
                  {/* Column Delete Button */}
                  <button 
                    onClick={() => removeColAt(c)}
                    className="absolute -top-1 left-1/2 -translate-x-1/2 p-0.5 bg-surface border border-border rounded text-red-400/60 opacity-0 group-hover/cell:opacity-100 hover:text-red-400 hover:bg-red-500/10 transition-all z-10"
                    title="Delete Column"
                  >
                    <X size={8} />
                  </button>
                  <div className="h-full flex items-center px-2 text-sm font-bold text-white uppercase tracking-wider">
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onInput={(e) => updateCell(0, c, { text: e.target.innerText })}
                      className="w-full outline-none"
                    >
                      {cells[0][c].text || `Col ${c + 1}`}
                    </div>
                  </div>
                </th>
              ))}
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {cells.slice(1).map((row, rIdx) => {
              const r = rIdx + 1;
              return (
                <tr key={r} className="group/row border-b border-white/30 hover:bg-white/5 transition-colors">
                  {/* Row Delete Button */}
                  <td className="w-6 p-0 border-r border-white/10 opacity-0 group-hover/row:opacity-100 transition-opacity bg-white/5">
                    <button 
                      onClick={() => removeRowAt(r)}
                      className="w-full h-full flex items-center justify-center text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete Row"
                    >
                      <X size={10} />
                    </button>
                  </td>
                  {row.map((cell, c) => (
                    <td key={c} className="border-r border-white/10 p-0 relative group/cell">
                      <div className="h-full">
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          onInput={(e) => updateCell(r, c, { text: e.target.innerText })}
                          className={`p-2 outline-none text-sm h-full flex items-center ${cell.bold ? 'font-bold' : ''} ${cell.italic ? 'italic' : ''}`}
                          style={{ textAlign: cell.align, justifyContent: cell.align === 'center' ? 'center' : cell.align === 'right' ? 'flex-end' : 'flex-start' }}
                        >
                          {cell.text}
                        </div>
                        <button
                          onClick={() => updateCell(r, c, { bold: !cell.bold })}
                          className={`absolute top-1 right-1 p-1 rounded opacity-0 group-hover/cell:opacity-100 transition-opacity ${cell.bold ? 'bg-primary text-white' : 'bg-surface hover:bg-border'}`}
                        >
                          <Bold size={10} />
                        </button>
                      </div>
                    </td>
                  ))}
                  {/* Add Column Trigger (only in first data row but spans all) */}
                  {r === 1 && (
                    <td 
                      rowSpan={rows - 1} 
                      className="w-8 p-0 border-l border-white/10 hover:bg-primary/10 transition-colors group/add-col"
                    >
                      <button 
                        onClick={addCol}
                        className="w-full h-full flex items-center justify-center text-text-muted/40 hover:text-primary transition-all opacity-0 group-hover/add-col:opacity-100"
                        title="Add Column"
                      >
                        <Plus size={14} />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
            {/* Add Row Trigger */}
            <tr className="h-10 hover:bg-primary/10 transition-colors group/add-row">
              <td className="bg-white/5"></td>
              <td colSpan={cols} className="p-0 border-t border-white/20">
                <button 
                  onClick={addRow}
                  className="w-full h-full flex items-center justify-center text-text-muted/40 hover:text-primary transition-all opacity-0 group-hover/add-row:opacity-100"
                  title="Add Row"
                >
                  <Plus size={14} />
                </button>
              </td>
              <td className="bg-white/5"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
