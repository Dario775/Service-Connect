import React, { useState, useCallback } from 'react';
import { User, Role, JobPost, JobStatus } from './types';
import { USERS, JOB_POSTS } from './constants';
import Navbar from './components/layout/Navbar';
import LoginScreen from './components/auth/LoginScreen';
import AdminDashboard from './components/dashboards/AdminDashboard';
import ClientDashboard from './components/dashboards/ClientDashboard';
import ProfessionalDashboard from './components/dashboards/ProfessionalDashboard';
import HomeScreen from './components/home/HomeScreen';

type View = 'home' | 'login' | 'dashboard';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [jobPosts, setJobPosts] = useState<JobPost[]>(JOB_POSTS);
  const [view, setView] = useState<View>('home');

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('home');
  };
  
  const navigateToLogin = () => {
    setView('login');
  }
  
  const navigateToHome = () => {
    setView('home');
  }

  const addJobPost = useCallback((newPostData: Omit<JobPost, 'id' | 'status' | 'createdAt'>) => {
    const newPost: JobPost = {
      ...newPostData,
      id: Math.max(...jobPosts.map(p => p.id), 0) + 1,
      status: JobStatus.PENDING,
      createdAt: new Date(),
    };
    setJobPosts(prevPosts => [newPost, ...prevPosts]);
  }, [jobPosts]);

  const updateJobStatus = useCallback((postId: number, status: JobStatus) => {
    setJobPosts(prevPosts =>
      prevPosts.map(p => (p.id === postId ? { ...p, status } : p))
    );
  }, []);

  const updateJobProgress = useCallback((postId: number, progress: number) => {
    setJobPosts(prevPosts =>
      prevPosts.map(p => (p.id === postId ? { ...p, progress } : p))
    );
  }, []);

  const takeJob = useCallback((postId: number) => {
    if (!currentUser || currentUser.role !== Role.PROFESSIONAL) return;
    setJobPosts(prevPosts =>
      prevPosts.map(p =>
        p.id === postId ? { ...p, status: JobStatus.IN_PROGRESS, professionalId: currentUser.id, progress: 0 } : p
      )
    );
  }, [currentUser]);
  
  const handleProfessionalMarkComplete = useCallback((postId: number) => {
    setJobPosts(prev => prev.map(p => p.id === postId ? { ...p, status: JobStatus.AWAITING_CLIENT_VALIDATION, progress: 100 } : p));
  }, []);

  const handleClientValidation = useCallback((postId: number) => {
      setJobPosts(prev => prev.map(p => p.id === postId ? { ...p, status: JobStatus.AWAITING_ADMIN_FINALIZATION } : p));
  }, []);

  const handleAdminFinalization = useCallback((postId: number) => {
      setJobPosts(prev => prev.map(p => p.id === postId ? { ...p, status: JobStatus.COMPLETED } : p));
  }, []);


  const renderDashboard = () => {
    if (!currentUser) return null;

    switch (currentUser.role) {
      case Role.ADMIN:
        return <AdminDashboard 
                  posts={jobPosts} 
                  onApprove={(id) => updateJobStatus(id, JobStatus.ACTIVE)} 
                  onReject={(id) => updateJobStatus(id, JobStatus.REJECTED)}
                  onFinalize={handleAdminFinalization}
                />;
      case Role.CLIENT:
        return <ClientDashboard 
                  currentUser={currentUser} 
                  posts={jobPosts} 
                  addJobPost={addJobPost}
                  onValidate={handleClientValidation}
                />;
      case Role.PROFESSIONAL:
        return <ProfessionalDashboard 
                  currentUser={currentUser} 
                  posts={jobPosts} 
                  onTakeJob={takeJob} 
                  onUpdateProgress={updateJobProgress} 
                  onMarkComplete={handleProfessionalMarkComplete}
                />;
      default:
        return <p>No hay un panel disponible para este rol.</p>;
    }
  };

  if (!currentUser) {
    if (view === 'login') {
      return <LoginScreen onLogin={handleLogin} onBackToHome={navigateToHome} />;
    }
    const activeJobs = jobPosts.filter(p => p.status === JobStatus.ACTIVE);
    return (
       <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
          <Navbar currentUser={null} onLogout={handleLogout} onNavigateToLogin={navigateToLogin} />
          <HomeScreen activeJobs={activeJobs} onNavigateToLogin={navigateToLogin} />
       </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <Navbar currentUser={currentUser} onLogout={handleLogout} />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {renderDashboard()}
      </main>
    </div>
  );
};

export default App;