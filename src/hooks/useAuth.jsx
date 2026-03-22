import { useState, useEffect, createContext, useContext } from 'react';
import { auth, db } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../firebase/errorHandlers';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Check if user exists in Firestore
        const path = `users/${firebaseUser.uid}`;
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (!userDoc.exists()) {
            const userData = {
              displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              email: firebaseUser.email,
              photoURL: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${firebaseUser.email}&background=6c63ff&color=fff`,
              createdAt: serverTimestamp(),
              role: 'user'
            };
            await setDoc(userDocRef, userData);
            setUser({ uid: firebaseUser.uid, ...userData });
          } else {
            setUser({ uid: firebaseUser.uid, ...userDoc.data() });
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, path);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
