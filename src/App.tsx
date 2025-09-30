import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { AuthForm } from './components/Auth/AuthForm';
import { Dashboard } from './components/Dashboard/Dashboard';
import { VideoEditor } from './components/Editor/VideoEditor';
import { projectService } from './services/projectService';
import { Loader2 } from 'lucide-react';

function DashboardPage() {
  const navigate = useNavigate();

  const handleProjectSelect = (projectId: string) => {
    navigate(`/editor/${projectId}`);
  };

  const handleNewProject = async () => {
    try {
      const project = await projectService.createProject(`Project ${Date.now()}`);
      navigate(`/editor/${project.id}`);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  return (
    <Dashboard
      onProjectSelect={handleProjectSelect}
      onNewProject={handleNewProject}
    />
  );
}

function EditorPage() {
  const params = new URLSearchParams(window.location.search);
  const pathParts = window.location.pathname.split('/');
  const projectId = pathParts[pathParts.length - 1];

  if (!projectId) {
    return <Navigate to="/" replace />;
  }

  return <VideoEditor projectId={projectId} />;
}

function AppContent() {
  const { user, loading } = useAuth();
  const [authRefresh, setAuthRefresh] = useState(0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthForm onAuthSuccess={() => setAuthRefresh(prev => prev + 1)} />;
  }

  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/editor/:projectId" element={<EditorPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
