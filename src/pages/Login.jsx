import { useState } from 'react';
import { auth, db } from '../firebase/config';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass p-8 rounded-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold text-primary mb-2">Nerd Notes</h1>
          <p className="text-text-muted">Welcome back, nerd!</p>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white text-black font-medium py-3 rounded-xl hover:scale-[1.02] transition-transform mb-6"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="h-[1px] flex-1 bg-border"></div>
          <span className="text-text-muted text-sm">── or ──</span>
          <div className="h-[1px] flex-1 bg-border"></div>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 focus:border-primary outline-none transition-colors"
              placeholder="nerd@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 focus:border-primary outline-none transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Logging in...' : <><LogIn size={20} /> Login</>}
          </button>
        </form>

        <p className="text-center mt-6 text-text-muted">
          Don't have an account? <Link to="/signup" className="text-primary hover:underline">Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
}
