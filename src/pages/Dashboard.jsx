import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Plus, Trash2, FileText, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { handleFirestoreError, OperationType } from '../firebase/errorHandlers';

const COLORS = ['#6c63ff', '#00d4aa', '#ff6b6b', '#ffd93d', '#4d96ff', '#f06292'];

export default function Dashboard() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // stores noteId to delete
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const path = `notes/${user.uid}/notes`;
    const q = query(
      collection(db, 'notes', user.uid, 'notes'),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotes(notesData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return unsubscribe;
  }, [user]);

  const createNewNote = async () => {
    const path = `notes/${user.uid}/notes`;
    try {
      const noteData = {
        title: 'Untitled Note',
        emoji: '📝',
        coverColor: COLORS[Math.floor(Math.random() * COLORS.length)],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        widgets: [],
        visibility: 'private',
        sharedWith: []
      };
      const docRef = await addDoc(collection(db, 'notes', user.uid, 'notes'), noteData);
      navigate(`/note/${docRef.id}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const handleDeleteClick = (e, noteId) => {
    e.stopPropagation();
    setDeleteConfirm(noteId);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    const path = `notes/${user.uid}/notes/${deleteConfirm}`;
    try {
      await deleteDoc(doc(db, 'notes', user.uid, 'notes', deleteConfirm));
      localStorage.removeItem(`note_${deleteConfirm}`);
      setDeleteConfirm(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-display font-bold">My Notes</h1>
          <button
            onClick={createNewNote}
            id="new-note-btn"
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:scale-[1.05] transition-all shadow-lg shadow-primary/20"
          >
            <Plus size={20} /> New Note
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-surface animate-pulse rounded-2xl border border-border"></div>
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-4 border border-border">
              <FileText size={40} className="text-text-muted" />
            </div>
            <h2 className="text-xl font-medium mb-2">No notes yet</h2>
            <p className="text-text-muted">Click '+ New Note' to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <motion.div
                key={note.id}
                id={`note-card-${note.id}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -5 }}
                onClick={() => navigate(`/note/${note.id}`)}
                className="group relative bg-surface rounded-2xl border border-border overflow-hidden cursor-pointer hover:border-primary/50 transition-all"
              >
                <div className="h-3" style={{ backgroundColor: note.coverColor }}></div>
                <div className="p-6">
                  <div className="text-4xl mb-4">{note.emoji}</div>
                  <h3 className="text-xl font-bold mb-2 line-clamp-1">{note.title}</h3>
                  <p className="text-text-muted text-sm">
                    Updated {note.updatedAt?.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                
                <button
                  onClick={(e) => handleDeleteClick(e, note.id)}
                  className="absolute top-6 right-6 p-2 bg-background/50 backdrop-blur-sm rounded-lg text-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-surface border border-border p-8 rounded-3xl max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Delete Note?</h3>
                  <p className="text-text-muted text-sm">This action cannot be undone.</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-6 py-3 rounded-xl font-bold bg-background border border-border hover:bg-border transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-3 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
