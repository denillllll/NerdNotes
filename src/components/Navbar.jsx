import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { useAuth } from '../hooks/useAuth';
import { LogOut, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="h-16 glass sticky top-0 z-50 px-6 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <span className="text-2xl font-display font-bold text-primary">Nerd Notes</span>
      </Link>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-surface border border-border">
          {user?.photoURL ? (
            <img src={user.photoURL} alt={user.displayName} className="w-7 h-7 rounded-full object-cover" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
          )}
          <span className="text-sm font-medium hidden sm:block">{user?.displayName}</span>
        </div>
        
        <button
          onClick={() => signOut(auth)}
          className="p-2 text-text-muted hover:text-red-400 transition-colors"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
}
