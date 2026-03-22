import { useState } from 'react';
import { useNoteStore } from '../../store/useNoteStore';
import { Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function TodoWidget({ widget }) {
  const { actions } = useNoteStore();
  const [newTodo, setNewTodo] = useState('');

  const todos = widget.content.todos || [];

  const addTodo = (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    
    const updatedTodos = [
      ...todos,
      { id: crypto.randomUUID(), text: newTodo.trim(), completed: false }
    ];
    actions.updateContent(widget.id, { todos: updatedTodos });
    setNewTodo('');
  };

  const toggleTodo = (id) => {
    const updatedTodos = todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    actions.updateContent(widget.id, { todos: updatedTodos });
  };

  const removeTodo = (id) => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    actions.updateContent(widget.id, { todos: updatedTodos });
  };

  return (
    <div className="w-full h-full flex flex-col gap-3 p-1">
      <form onSubmit={addTodo} className="flex gap-2">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a task..."
          className="flex-1 bg-background/50 border border-border rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
        />
        <button
          type="submit"
          disabled={!newTodo.trim()}
          className="p-1.5 bg-primary/10 text-primary rounded-md hover:bg-primary/20 disabled:opacity-50 transition-colors"
        >
          <Plus size={16} />
        </button>
      </form>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
        <AnimatePresence initial={false}>
          {todos.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-text-muted gap-2 opacity-50">
              <CheckCircle2 size={24} />
              <span className="text-[10px] font-medium uppercase tracking-wider">No tasks yet</span>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {todos.map((todo) => (
                <motion.div
                  key={todo.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="group flex items-center gap-2 bg-background/30 hover:bg-background/50 p-2 rounded-md border border-transparent hover:border-border/50 transition-all"
                >
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`transition-colors ${todo.completed ? 'text-primary' : 'text-text-muted hover:text-text'}`}
                  >
                    {todo.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                  </button>
                  
                  <span className={`flex-1 text-xs transition-all ${todo.completed ? 'text-text-muted line-through' : 'text-text'}`}>
                    {todo.text}
                  </span>

                  <button
                    onClick={() => removeTodo(todo.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-red-500 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
