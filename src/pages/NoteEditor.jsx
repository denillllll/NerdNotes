import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import { useNoteStore } from '../store/useNoteStore';
import Canvas from '../components/Canvas';
import Toolbar from '../components/Toolbar';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../firebase/errorHandlers';

export default function NoteEditor() {
  const { noteId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const store = useNoteStore();
  const [loading, setLoading] = useState(true);
  const [showRecovery, setShowRecovery] = useState(false);
  const [tempNoteData, setTempNoteData] = useState(null);

  useEffect(() => {
    const fetchNote = async () => {
      if (!user || !noteId) return;

      const path = `notes/${user.uid}/notes/${noteId}`;
      try {
        const noteRef = doc(db, 'notes', user.uid, 'notes', noteId);
        const noteSnap = await getDoc(noteRef);

        if (!noteSnap.exists()) {
          navigate('/');
          return;
        }

        const cloudData = { id: noteSnap.id, ...noteSnap.data() };
        const localData = localStorage.getItem(`note_${noteId}`);

        if (localData) {
          const parsedLocal = JSON.parse(localData);
          // Check if local data is different from cloud data (simple check)
          if (JSON.stringify(parsedLocal.widgets) !== JSON.stringify(cloudData.widgets)) {
            setTempNoteData(cloudData);
            setShowRecovery(true);
            setLoading(false);
            return;
          }
        }

        store.actions.loadNote(cloudData);
        store.actions.syncToLocalStorage();
        setLoading(false);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, path);
        navigate('/');
      }
    };

    fetchNote();
  }, [noteId, user]);

  const handleContinueEditing = () => {
    const localData = JSON.parse(localStorage.getItem(`note_${noteId}`));
    store.actions.loadNote(localData);
    setShowRecovery(false);
  };

  const handleReloadFromCloud = () => {
    store.actions.loadNote(tempNoteData);
    store.actions.syncToLocalStorage();
    setShowRecovery(false);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      <Toolbar />
      
      <AnimatePresence>
        {showRecovery && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-[100] glass px-6 py-3 rounded-2xl flex items-center gap-4 shadow-2xl"
          >
            <AlertTriangle className="text-yellow-500" size={20} />
            <span className="text-sm font-medium">You have unsaved changes. Continue editing or reload from cloud?</span>
            <div className="flex gap-2">
              <button
                onClick={handleContinueEditing}
                className="bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:scale-105 transition-all"
              >
                Continue Editing
              </button>
              <button
                onClick={handleReloadFromCloud}
                className="bg-surface border border-border px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-border transition-all"
              >
                Reload from Cloud
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Canvas />
    </div>
  );
}
