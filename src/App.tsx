import React, { Component } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import NoteEditor from './pages/NoteEditor';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<any, any> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong.";
      try {
        const parsed = JSON.parse(this.state.error?.message || "{}");
        if (parsed.error) errorMessage = parsed.error;
      } catch (e) {
        errorMessage = this.state.error?.message || "Unknown error";
      }

      return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-background p-6 text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-6">
            <AlertCircle size={32} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Application Error</h1>
          <p className="text-text-muted mb-8 max-w-md">{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all"
          >
            <RefreshCw size={20} /> Reload Application
          </button>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-background text-primary">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/note/:noteId" 
              element={
                <ProtectedRoute>
                  <NoteEditor />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
