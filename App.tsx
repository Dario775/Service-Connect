import React, { useState, useCallback, useEffect } from 'react';
// FIX: Use Firebase v9 compat import with default import syntax.
import firebase from 'firebase/compat/app';
import { auth } from './firebase/config';
import { User, Role, JobPost, JobStatus, ChatMessage } from './types';
import { INITIAL_USERS, INITIAL_JOB_POSTS, INITIAL_MESSAGES } from './constants';
import Navbar from './components/layout/Navbar';
import AuthScreen from './components/auth/AuthScreen';
import AdminDashboard from './components/dashboards/AdminDashboard';
import ClientDashboard from './components/dashboards/ClientDashboard';
import ProfessionalDashboard from './components/dashboards/ProfessionalDashboard';
import HomeScreen from './components/home/HomeScreen';

// ===== MODAL ADMIN INTEGRADO (Sin archivos externos) =====
const AdminAccessModal: React.FC<{
  onClose: () => void;
  onAdminLogin: (email: string, password: string) => Promise<void>;
}> = ({ onClose, onAdminLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    console.log('🔐 Intento de acceso administrativo:', email);

    try {
      await auth.signInWithEmailAndPassword(email, password);
      console.log('✅ Autenticación exitosa');
      
      await onAdminLogin(email, password);
      onClose();
    } catch (err: any) {
      console.error('❌ Error de acceso admin:', err);
      
      let errorMessage = 'Acceso denegado. Verifica tus credenciales.';
      
      switch (err.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Email o contraseña incorrectos. Solo administradores autorizados.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Formato de email inválido.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Demasiados intentos. Espera unos minutos.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Error de conexión. Verifica tu internet.';
          break;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-lg shadow-2xl">
        {/* Header */}
        <div className="relative p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Acceso Administrativo</h2>
              <p className="text-sm text-slate-400">Área restringida - Solo personal autorizado</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="admin-email" className="block text-sm font-medium text-slate-300 mb-2">
              Email Administrativo
            </label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
              placeholder="admin@serviceconnect.com"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="admin-password" className="block text-sm font-medium text-slate-300 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg">
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm text-red-200">{error}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-lg shadow-lg shadow-red-900/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Verificando...</span>
              </div>
            ) : (
              'Acceder al Panel'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-800/50 border-t border-slate-700 rounded-b-lg">
          <div className="flex items-center justify-center space-x-2 text-xs text-slate-400">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>Conexión segura · Autenticación Firebase</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== COMPONENTE PRINCIPAL =====
const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const savedUsers = localStorage.getItem('users');
      if (savedUsers) {
        const parsed = JSON.parse(savedUsers);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
      return INITIAL_USERS;
    } catch (error) {
      console.error("Error loading users from localStorage", error);
      return INITIAL_USERS;
    }
  });

  const [posts, setPosts] = useState<JobPost[]>(() => {
    try {
      const savedPosts = localStorage.getItem('posts');
      if (savedPosts) {
        const parsed = JSON.parse(savedPosts);
        if (Array.isArray(parsed)) {
          return parsed.map((p: any) => {
            const createdAt = new Date(p.createdAt);
            return {
              ...p,
              createdAt: isNaN(createdAt.getTime()) ? new Date() : createdAt,
            };
          });
        }
      }
      return INITIAL_JOB_POSTS;
    } catch (error) {
      console.error("Error loading posts from localStorage", error);
      return INITIAL_JOB_POSTS;
    }
  });
  
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const savedMessages = localStorage.getItem('messages');
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        if (Array.isArray(parsed)) {
            return parsed.map((m: any) => ({
                ...m,
                timestamp: new Date(m.timestamp)
            }));
        }
      }
      return INITIAL_MESSAGES;
    } catch (error) {
       console.error("Error loading messages from localStorage", error);
      return INITIAL_MESSAGES;
    }
  });

  const [heroImages, setHeroImages] = useState<string[]>(() => {
    const defaultImages = [
        'https://images.unsplash.com/photo-1581092921440-2a31a755e384?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1517061493165-742d4090c94a?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2070&auto=format&fit=crop',
    ];
    try {
      const savedImages = localStorage.getItem('heroImages');
      if (savedImages) {
        const parsed = JSON.parse(savedImages);
        if (Array.isArray(parsed)) {
            return parsed;
        }
      }
      return defaultImages;
    } catch (error) {
      console.error("Error loading hero images from localStorage", error);
       return defaultImages;
    }
  });
  
  const [firebaseUser, setFirebaseUser] = useState<firebase.User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [screen, setScreen] = useState<'home' | 'auth' | 'dashboard'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // ===== NUEVO: Estado para modal admin =====
  const [showAdminModal, setShowAdminModal] = useState(false);

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem('posts', JSON.stringify(posts));
  }, [posts]);
   useEffect(() => {
    localStorage.setItem('messages', JSON.stringify(messages));
  }, [messages]);
  useEffect(() => {
    localStorage.setItem('heroImages', JSON.stringify(heroImages));
  }, [heroImages]);

  // ===== NUEVO: Hook para detectar acceso admin =====
  useEffect(() => {
    // Detectar combinación de teclas: Ctrl+Shift+A o Cmd+Shift+A
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifierKey = isMac ? e.metaKey : e.ctrlKey;
      
      if (modifierKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        console.log('🔑 Combinación de teclas admin detectada');
        setShowAdminModal(true);
      }
    };

    // Detectar parámetro URL: ?admin=true
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') {
      console.log('🔗 Parámetro URL admin detectado');
      setShowAdminModal(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Detectar ruta oculta: /admin-access
    if (window.location.pathname === '/admin-access') {
      console.log('🚪 Ruta admin detectada');
      setShowAdminModal(true);
      window.history.replaceState({}, document.title, '/');
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Firebase Auth Listener
  useEffect(() => {
    console.log('🔥 Configurando listener de autenticación Firebase');
    
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('🔄 Estado de autenticación cambió:', user ? user.email : 'No autenticado');
      setFirebaseUser(user);
      setIsAuthLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Sync Firebase user with local user profile
  useEffect(() => {
    console.log('🔄 Sincronizando usuario Firebase con perfil local', {
      firebaseEmail: firebaseUser?.email,
      currentScreen: screen,
      totalUsers: users.length
    });

    if (firebaseUser) {
      const userEmail = firebaseUser.email?.toLowerCase() || '';
      let userProfile = users.find(u => u.email.toLowerCase() === userEmail);
      
      console.log('🔍 Búsqueda de perfil:', {
        buscando: userEmail,
        encontrado: !!userProfile,
        perfilEncontrado: userProfile?.email
      });

      if (userProfile) {
        if (userProfile.id !== firebaseUser.uid) {
          console.log('🔧 Actualizando UID del perfil:', {
            viejoId: userProfile.id,
            nuevoId: firebaseUser.uid
          });
          
          const updatedProfile = { ...userProfile, id: firebaseUser.uid };
          setUsers(prevUsers => 
            prevUsers.map(u => u.email.toLowerCase() === userEmail ? updatedProfile : u)
          );
          setCurrentUser(updatedProfile);
        } else {
          setCurrentUser(userProfile);
        }
        
        if (screen === 'auth' || screen === 'home') {
          console.log('✅ Redirigiendo a dashboard:', userProfile.role);
          setScreen('dashboard');
        }
      } else {
        console.warn('⚠️ Usuario autenticado en Firebase pero sin perfil local:', userEmail);
        setCurrentUser(null);
      }
    } else {
      console.log('👤 No hay usuario autenticado');
      setCurrentUser(null);
      
      if (screen === 'dashboard') {
        console.log('🔄 Usuario cerró sesión, volviendo a home');
        setScreen('home');
      }
    }
  }, [firebaseUser, users, screen]);
  
  const handleRegister = useCallback((regFirebaseUser: firebase.User, name: string, role: Role) => {
    console.log('📝 Registrando nuevo usuario:', {
      uid: regFirebaseUser.uid,
      email: regFirebaseUser.email,
      nombre: name,
      rol: role
    });

    const newUser: User = {
      id: regFirebaseUser.uid,
      name,
      role,
      email: regFirebaseUser.email || '',
    };
    
    setUsers(prev => {
      const updatedUsers = [...prev, newUser];
      console.log('✅ Usuario agregado al array local:', {
        totalUsuarios: updatedUsers.length,
        nuevoUsuario: newUser.email
      });
      return updatedUsers;
    });
    
    setCurrentUser(newUser);
    
    console.log('🚀 Redirigiendo a dashboard inmediatamente después del registro');
    setScreen('dashboard');
  }, []);

  // ===== NUEVO: Manejador de login admin =====
  const handleAdminLogin = useCallback(async (email: string, password: string) => {
    console.log('👑 Intentando login como administrador:', email);
    
    const userEmail = email.toLowerCase();
    let userProfile = users.find(u => u.email.toLowerCase() === userEmail);
    
    if (!userProfile) {
      console.log('🔧 Creando perfil de administrador');
      const adminUser: User = {
        id: auth.currentUser?.uid || '',
        email: email,
        name: 'Administrador',
        role: Role.ADMIN,
      };
      
      setUsers(prev => [...prev, adminUser]);
      setCurrentUser(adminUser);
    } else if (userProfile.role !== Role.ADMIN) {
      console.log('🔧 Actualizando rol a administrador');
      const updatedProfile = { ...userProfile, role: Role.ADMIN };
      setUsers(prev => prev.map(u => u.email.toLowerCase() === userEmail ? updatedProfile : u));
      setCurrentUser(updatedProfile);
    } else {
      setCurrentUser(userProfile);
    }
    
    setScreen('dashboard');
    console.log('✅ Acceso admin concedido');
  }, [users]);

  const handleLogout = useCallback(() => {
    console.log('👋 Cerrando sesión');
    auth.signOut();
  }, []);

  const navigateToLogin = useCallback(() => {
    console.log('🔐 Navegando a login');
    setScreen('auth');
  }, []);
  
  const navigateToHome = useCallback(() => {
    console.log('🏠 Navegando a home');
    setScreen('home');
  }, []);
  
  const navigateToDashboard = useCallback(() => {
    if (currentUser) {
      console.log('📊 Navegando a dashboard');
      setScreen('dashboard');
    } else {
      console.log('⚠️ No hay usuario autenticado, redirigiendo a login');
      setScreen('auth');
    }
  }, [currentUser]);

  // Job Post Actions
  const addJobPost = useCallback((newPostData: Omit<JobPost, 'id' | 'status' | 'createdAt'>) => {
    const newPost: JobPost = {
      ...newPostData,
      id: `job-${Date.now()}`,
      status: JobStatus.PENDING,
      createdAt: new Date(),
    };
    setPosts(prev => [newPost, ...prev]);
  }, []);
  
  const updateUser = useCallback((updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  }, [currentUser]);
  
  const addMessage = useCallback((jobId: string, text: string) => {
    if (!currentUser) return;
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      jobId,
      senderId: currentUser.id,
      text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  }, [currentUser]);

  // Admin Actions
  const approveJob = useCallback((postId: string) => setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: JobStatus.ACTIVE } : p)), []);
  const rejectJob = useCallback((postId: string) => setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: JobStatus.REJECTED } : p)), []);
  const finalizeJob = useCallback((postId: string) => setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: JobStatus.COMPLETED } : p)), []);

  // Professional Actions
  const takeJob = useCallback((postId: string) => {
    if (!currentUser || currentUser.role !== Role.PROFESSIONAL) return;
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: JobStatus.IN_PROGRESS, professionalId: currentUser.id, progress: 0 } : p));
  }, [currentUser]);

  const updateProgress = useCallback((postId: string, progress: number) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, progress } : p));
  }, []);

  const professionalCompleteJob = useCallback((postId: string, rating: number, feedback: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: JobStatus.AWAITING_CLIENT_VALIDATION, clientRating: rating, clientFeedback: feedback } : p));
  }, []);

  // Client Actions
  const clientCompleteJob = useCallback((postId: string, rating: number, feedback: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: JobStatus.AWAITING_ADMIN_FINALIZATION, professionalRating: rating, professionalFeedback: feedback } : p));
  }, []);
  
  const cancelJob = useCallback((postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: JobStatus.CANCELLED } : p));
  }, []);

  // Filtered posts
  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    post.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const activeJobs = filteredPosts.filter(p => p.status === JobStatus.ACTIVE);
  const completedJobsWithFeedback = posts.filter(p => p.status === JobStatus.COMPLETED && p.clientRating && p.professionalRating);

  const renderDashboard = () => {
    if (!currentUser) {
      console.warn('⚠️ Intentando renderizar dashboard sin usuario');
      return null;
    }
    
    console.log('📊 Renderizando dashboard para:', currentUser.role);
    
    switch (currentUser.role) {
      case Role.ADMIN:
        return <AdminDashboard posts={filteredPosts} users={users} onApprove={approveJob} onReject={rejectJob} onFinalize={finalizeJob} heroImages={heroImages} onUpdateHeroImages={setHeroImages} />;
      case Role.CLIENT:
        return <ClientDashboard currentUser={currentUser} posts={filteredPosts} users={users} messages={messages} addJobPost={addJobPost} onClientComplete={clientCompleteJob} onUpdateUser={updateUser} onCancelJob={cancelJob} onSendMessage={addMessage} />;
      case Role.PROFESSIONAL:
        return <ProfessionalDashboard currentUser={currentUser} posts={filteredPosts} users={users} messages={messages} onTakeJob={takeJob} onUpdateProgress={updateProgress} onProfessionalComplete={professionalCompleteJob} onUpdateUser={updateUser} onSendMessage={addMessage} />;
      default:
        console.warn('⚠️ Rol de usuario desconocido:', currentUser.role);
        return <HomeScreen activeJobs={activeJobs} completedJobs={completedJobsWithFeedback} users={users} onNavigateToLogin={navigateToLogin} heroImages={heroImages} />;
    }
  };

  const renderContent = () => {
    if (isAuthLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Verificando autenticación...</p>
          </div>
        </div>
      );
    }

    if (screen === 'auth') {
      return <AuthScreen onRegister={handleRegister} onBackToHome={navigateToHome} users={users} />;
    }
    
    if (screen === 'dashboard' && currentUser) {
      return <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">{renderDashboard()}</div>;
    }
    
    return <HomeScreen activeJobs={activeJobs} completedJobs={completedJobsWithFeedback} users={users} onNavigateToLogin={navigateToLogin} heroImages={heroImages} />;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        onNavigateToLogin={navigateToLogin} 
        onNavigateToHome={navigateToHome}
        onNavigateToDashboard={navigateToDashboard}
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery}
      />
      <main className="flex-grow">
        {renderContent()}
      </main>
      
      {/* ===== MODAL DE ACCESO ADMIN ===== */}
      {showAdminModal && (
        <AdminAccessModal
          onClose={() => setShowAdminModal(false)}
          onAdminLogin={handleAdminLogin}
        />
      )}
    </div>
  );
};

export default App;