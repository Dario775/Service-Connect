import React, { useState, useCallback, useEffect } from 'react';
import { User, Role, JobPost, JobStatus } from './types';
import { INITIAL_USERS, INITIAL_JOB_POSTS } from './constants';
import Navbar from './components/layout/Navbar';
import AuthScreen from './components/auth/AuthScreen';
import AdminDashboard from './components/dashboards/AdminDashboard';
import ClientDashboard from './components/dashboards/ClientDashboard';
import ProfessionalDashboard from './components/dashboards/ProfessionalDashboard';
import HomeScreen from './components/home/HomeScreen';
import { auth } from './firebase/config';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { BriefcaseIcon } from './components/icons/IconComponents';

type View = 'home' | 'login' | 'dashboard';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [jobPosts, setJobPosts] = useState<JobPost[]>(INITIAL_JOB_POSTS);
  const [view, setView] = useState<View>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [heroImages, setHeroImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=2069&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1545239351-ef35f43d514b?q=80&w=1974&auto=format&fit=crop'
  ]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in.
        const userProfile = users.find(u => u.id === firebaseUser.uid);
        if (userProfile) {
          setCurrentUser(userProfile);
          setView('dashboard');
        }
        // If user profile doesn't exist, they will be created via the registration flow.
        // This handles session persistence.
      } else {
        // User is signed out.
        setCurrentUser(null);
        setView('home');
      }
      setIsLoadingAuth(false);
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [users]);


  const handleLogout = () => {
    signOut(auth).then(() => {
        setCurrentUser(null);
        setSearchQuery('');
        setView('home');
    }).catch((error) => {
        console.error("Error al cerrar sesión:", error);
    });
  };
  
  const navigateToLogin = () => {
    setView('login');
  }
  
  const navigateToHome = () => {
    setView('home');
  }

  const handleRegisterUser = (firebaseUser: FirebaseUser, name: string, role: Role) => {
    const newUser: User = {
      id: firebaseUser.uid,
      name: name,
      email: firebaseUser.email || '',
      role: role,
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setView('dashboard');
  };

  const addJobPost = useCallback((newPostData: Omit<JobPost, 'id' | 'status' | 'createdAt'>) => {
    const newPost: JobPost = {
      ...newPostData,
      id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      status: JobStatus.PENDING,
      createdAt: new Date(),
    };
    setJobPosts(prevPosts => [newPost, ...prevPosts]);
  }, []);

  const updateJobStatus = useCallback((postId: string, status: JobStatus) => {
    setJobPosts(prevPosts =>
      prevPosts.map(p => (p.id === postId ? { ...p, status } : p))
    );
  }, []);

  const updateJobProgress = useCallback((postId: string, progress: number) => {
    setJobPosts(prevPosts =>
      prevPosts.map(p => (p.id === postId ? { ...p, progress } : p))
    );
  }, []);

  const takeJob = useCallback((postId: string) => {
    if (!currentUser || currentUser.role !== Role.PROFESSIONAL) return;
    setJobPosts(prevPosts =>
      prevPosts.map(p =>
        p.id === postId ? { ...p, status: JobStatus.IN_PROGRESS, professionalId: currentUser.id, progress: 0 } : p
      )
    );
  }, [currentUser]);
  
  const handleProfessionalCompletion = useCallback((postId: string, rating: number, feedback: string) => {
    setJobPosts(prev => prev.map(p => p.id === postId ? { 
        ...p, 
        status: JobStatus.AWAITING_CLIENT_VALIDATION, 
        progress: 100,
        clientRating: rating,
        clientFeedback: feedback,
    } : p));
  }, []);

  const handleClientCompletion = useCallback((postId: string, rating: number, feedback: string) => {
      setJobPosts(prev => prev.map(p => p.id === postId ? { 
          ...p, 
          status: JobStatus.AWAITING_ADMIN_FINALIZATION,
          professionalRating: rating,
          professionalFeedback: feedback,
      } : p));
  }, []);

  const handleAdminFinalization = useCallback((postId: string) => {
      setJobPosts(prev => prev.map(p => p.id === postId ? { ...p, status: JobStatus.COMPLETED } : p));
  }, []);
  
  const handleUpdateUser = useCallback((updatedUser: User) => {
    setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser && currentUser.id === updatedUser.id) {
        setCurrentUser(updatedUser);
    }
  }, [currentUser]);

  const handleCancelJob = useCallback((postId: string) => {
    setJobPosts(prev => prev.map(p => p.id === postId ? { ...p, status: JobStatus.CANCELLED } : p));
  }, []);
  
  const handleUpdateHeroImages = useCallback((images: string[]) => {
    setHeroImages(images);
  }, []);


  const filteredPosts = searchQuery
    ? jobPosts.filter(
        post =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : jobPosts;


  const renderDashboard = () => {
    if (!currentUser) return null;

    switch (currentUser.role) {
      case Role.ADMIN:
        return <AdminDashboard 
                  posts={filteredPosts} 
                  users={users}
                  onApprove={(id) => updateJobStatus(id, JobStatus.ACTIVE)} 
                  onReject={(id) => updateJobStatus(id, JobStatus.REJECTED)}
                  onFinalize={handleAdminFinalization}
                  heroImages={heroImages}
                  onUpdateHeroImages={handleUpdateHeroImages}
                />;
      case Role.CLIENT:
        return <ClientDashboard 
                  currentUser={currentUser} 
                  posts={filteredPosts} 
                  users={users}
                  addJobPost={addJobPost}
                  onClientComplete={handleClientCompletion}
                  onUpdateUser={handleUpdateUser}
                  onCancelJob={handleCancelJob}
                />;
      case Role.PROFESSIONAL:
        return <ProfessionalDashboard 
                  currentUser={currentUser} 
                  posts={filteredPosts} 
                  users={users}
                  onTakeJob={takeJob} 
                  onUpdateProgress={updateJobProgress} 
                  onProfessionalComplete={handleProfessionalCompletion}
                  onUpdateUser={handleUpdateUser}
                />;
      default:
        return <p>No hay un panel disponible para este rol.</p>;
    }
  };
  
  if (isLoadingAuth) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900">
            <BriefcaseIcon className="h-16 w-16 text-indigo-500 animate-pulse" />
            <p className="text-slate-600 dark:text-slate-300 mt-4">Cargando aplicación...</p>
        </div>
    );
  }

  if (!currentUser) {
    if (view === 'login') {
      return <AuthScreen onRegister={handleRegisterUser} onBackToHome={navigateToHome} />;
    }
    const activeJobs = filteredPosts.filter(p => p.status === JobStatus.ACTIVE);
    const completedJobs = jobPosts.filter(p => p.status === JobStatus.COMPLETED && p.professionalRating && p.professionalFeedback);
    return (
       <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
          <Navbar 
            currentUser={null} 
            onLogout={handleLogout} 
            onNavigateToLogin={navigateToLogin} 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          <HomeScreen 
            activeJobs={activeJobs}
            completedJobs={completedJobs}
            users={users}
            onNavigateToLogin={navigateToLogin}
            heroImages={heroImages}
          />
       </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <Navbar 
        currentUser={currentUser} 
        onLogout={handleLogout}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {renderDashboard()}
      </main>
    </div>
  );
};

export default App;