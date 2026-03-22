import { create } from 'zustand';
import { db } from '../firebase/config';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../firebase/errorHandlers';
import { supabase } from '../supabase/config';

export const useNoteStore = create((set, get) => ({
  widgets: [],
  selectedWidgetId: null,
  noteTitle: 'Untitled Note',
  noteEmoji: '📝',
  noteId: null,
  isSaving: false,
  lastSaved: null,
  coverColor: '#6c63ff',

  actions: {
    loadNote: (noteData) => {
      set({
        widgets: noteData.widgets || [],
        noteTitle: noteData.title || 'Untitled Note',
        noteEmoji: noteData.emoji || '📝',
        noteId: noteData.id,
        coverColor: noteData.coverColor || '#6c63ff',
        selectedWidgetId: null,
      });
    },

    syncToLocalStorage: () => {
      const { noteId, widgets, noteTitle, noteEmoji, coverColor } = get();
      if (!noteId) return;
      const data = { widgets, title: noteTitle, emoji: noteEmoji, coverColor, id: noteId };
      localStorage.setItem(`note_${noteId}`, JSON.stringify(data));
    },

    addWidget: (type) => {
      const id = crypto.randomUUID();
      const maxZ = get().widgets.reduce((max, w) => Math.max(max, w.zIndex || 0), 0);
      
      const newWidget = {
        id,
        type,
        x: window.innerWidth / 2 - 100 + window.scrollX,
        y: window.innerHeight / 2 - 50 + window.scrollY,
        width: type === 'table' ? 400 : 250,
        height: type === 'table' ? 200 : 120,
        zIndex: maxZ + 1,
        content: getInitialContent(type),
      };

      set((state) => ({
        widgets: [...state.widgets, newWidget],
        selectedWidgetId: id,
      }));
      get().actions.syncToLocalStorage();
    },

    moveWidget: (id, x, y) => {
      set((state) => ({
        widgets: state.widgets.map((w) => (w.id === id ? { ...w, x, y } : w)),
      }));
      get().actions.syncToLocalStorage();
    },

    resizeWidget: (id, width, height) => {
      set((state) => ({
        widgets: state.widgets.map((w) => (w.id === id ? { ...w, width, height } : w)),
      }));
      get().actions.syncToLocalStorage();
    },

    updateContent: (id, content) => {
      set((state) => ({
        widgets: state.widgets.map((w) => (w.id === id ? { ...w, content: { ...w.content, ...content } } : w)),
      }));
      get().actions.syncToLocalStorage();
    },

    deleteWidget: async (id) => {
      const widget = get().widgets.find(w => w.id === id);
      
      // If it's an image widget with a storage URL, delete from Supabase
      if (widget?.type === 'image' && widget.content?.storageUrl) {
        try {
          const url = widget.content.storageUrl;
          // Extract path from public URL: .../public/nerddata/PATH
          const pathParts = url.split('/public/nerddata/');
          if (pathParts.length > 1) {
            const filePath = pathParts[1];
            await supabase.storage.from('nerddata').remove([filePath]);
          }
        } catch (err) {
          console.error('Failed to delete image from Supabase:', err);
        }
      }

      set((state) => ({
        widgets: state.widgets.filter((w) => w.id !== id),
        selectedWidgetId: state.selectedWidgetId === id ? null : state.selectedWidgetId,
      }));
      get().actions.syncToLocalStorage();
    },

    bringToFront: (id) => {
      const maxZ = get().widgets.reduce((max, w) => Math.max(max, w.zIndex || 0), 0);
      set((state) => ({
        widgets: state.widgets.map((w) => (w.id === id ? { ...w, zIndex: maxZ + 1 } : w)),
        selectedWidgetId: id,
      }));
      get().actions.syncToLocalStorage();
    },

    setSelectedWidget: (id) => {
      set({ selectedWidgetId: id });
    },

    updateNoteMeta: (meta) => {
      set((state) => ({ ...state, ...meta }));
      get().actions.syncToLocalStorage();
    },

    saveNote: async (userId) => {
      const { noteId, widgets, noteTitle, noteEmoji, coverColor } = get();
      if (!noteId || !userId) return;

      set({ isSaving: true });
      const path = `notes/${userId}/notes/${noteId}`;
      try {
        const noteRef = doc(db, 'notes', userId, 'notes', noteId);
        await updateDoc(noteRef, {
          widgets,
          title: noteTitle,
          emoji: noteEmoji,
          coverColor,
          updatedAt: serverTimestamp(),
        });
        set({ isSaving: false, lastSaved: new Date() });
        return true;
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
        set({ isSaving: false });
        return false;
      }
    },
  },
}));

function getInitialContent(type) {
  switch (type) {
    case 'text': return { html: '' };
    case 'heading': return { text: '', level: 1 };
    case 'image': return { storageUrl: '' };
    case 'todo': return { items: [] };
    case 'table': return { rows: 3, cols: 3, cells: Array(3).fill(0).map(() => Array(3).fill(0).map(() => ({ text: '', bold: false, italic: false, align: 'left' }))) };
    default: return {};
  }
}
