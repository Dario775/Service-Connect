import React, { useState, useEffect, useMemo } from 'react';
// FIX: Use Firebase v9 compat import with default import syntax.
import firebase from 'firebase/compat/app';
import { auth } from '../../firebase/config';
import { Role, User } from '../../types';
import { BriefcaseIcon, CheckCircleIcon } from '../icons/IconComponents';

interface AuthScreenProps {
  onRegister: (firebaseUser: firebase.User, name: string, role: Role) => void;
  onBackToHome: () => void;
  users: User[];
}

const PasswordRequirement: React.FC<{ isValid: boolean; text: string }> = ({ isValid, text }) => (
    <li className={`flex items-center text-sm ${isValid ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}`}>
        <CheckCircleIcon className={`h-4 w-4 mr-2 ${isValid ? 'text-green-500' : 'text-slate-400'}`} />
        {text}
    </li>
);


const AuthScreen: React.FC<AuthScreenProps> = ({ onRegister, onBackToHome, users }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>(Role.CLIENT);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // FIX: Nuevo estado para manejar completar perfil
  const [needsProfile, setNeedsProfile] = useState(false);
  const [pendingFirebaseUser, setPendingFirebaseUser] = useState<firebase.User | null>(null);
  
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false,
  });

  const isPasswordStrong = useMemo(() => Object.values(passwordValidation).every(Boolean), [passwordValidation]);

  useEffect(() => {
    if (!isLogin) {
        setPasswordValidation({
            minLength: password.length >= 8,
            hasUpper: /[A-Z]/.test(password),
            hasLower: /[a-z]/.test(password),
            hasNumber: /\d/.test(password),
            hasSpecial: /[^A-Za-z0-9]/.test(password),
        });
    }
  }, [password, isLogin]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // ===== DEBUGGING: Log de entrada =====
    console.log('🔐 Intento de autenticación:', {
      isLogin,
      email,
      passwordLength: password.length,
      hasPassword: !!password
    });

    if (!isLogin) {
        if (!name || !role) {
            setError('Por favor, completa todos los campos para registrarte.');
            setIsLoading(false);
            return;
        }
        if (!isPasswordStrong) {
            setError('La contraseña no cumple con todos los requisitos de seguridad.');
            setIsLoading(false);
            return;
        }
    }

    // Validación adicional del email
    if (!email || !email.includes('@')) {
        setError('Por favor, ingresa un correo electrónico válido.');
        setIsLoading(false);
        return;
    }

    // Validación de contraseña
    if (!password || password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        setIsLoading(false);
        return;
    }

    try {
      if (isLogin) {
        console.log('📧 Intentando iniciar sesión con:', email);
        
        // INTENTO DIRECTO DE LOGIN
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log('✅ Login exitoso en Firebase:', userCredential.user?.email);
        
        // FIX: Verificar si el usuario tiene perfil local
        const userEmail = userCredential.user?.email?.toLowerCase() || '';
        const userProfile = users.find(u => u.email.toLowerCase() === userEmail);
        
        if (!userProfile) {
            console.log('⚠️ Usuario sin perfil local, solicitando información');
            setPendingFirebaseUser(userCredential.user);
            setNeedsProfile(true);
            setIsLoading(false);
            return;
        }
        
        console.log('✅ Usuario con perfil local encontrado, onAuthStateChanged manejará la redirección');
        // onAuthStateChanged en App.tsx se encargará del resto
      } else {
        console.log('📝 Intentando registrar nuevo usuario:', email);
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        
        if (userCredential.user) {
          console.log('✅ Registro exitoso:', userCredential.user.email);
          onRegister(userCredential.user, name, role);
        }
      }
    } catch (err: any) {
        console.error("❌ Error de autenticación:", {
          code: err.code,
          message: err.message,
          fullError: err
        });

        let errorMessage = 'Ocurrió un error inesperado.';

        // MANEJO ESPECÍFICO DE ERRORES
        switch (err.code) {
            // ===== ERRORES DE LOGIN =====
            case 'auth/invalid-credential':
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                errorMessage = 'Correo electrónico o contraseña incorrectos. Verifica tus credenciales e intenta nuevamente.';
                break;

            // ===== ERRORES DE REGISTRO =====
            case 'auth/email-already-in-use':
                errorMessage = 'Este correo electrónico ya está registrado. Usa "Iniciar Sesión" en su lugar.';
                break;

            case 'auth/weak-password':
                errorMessage = 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres y cumplir con los requisitos de seguridad.';
                break;

            case 'auth/invalid-email':
                errorMessage = 'El formato del correo electrónico no es válido. Verifica que esté escrito correctamente.';
                break;

            // ===== ERRORES DE CONFIGURACIÓN =====
            case 'auth/configuration-not-found':
            case 'auth/operation-not-allowed':
                errorMessage = '⚠️ ERROR DE CONFIGURACIÓN: El método de autenticación Email/Password no está habilitado en Firebase Console. Ve a Authentication > Sign-in method y actívalo.';
                console.error('🔧 ACCIÓN REQUERIDA: Habilita Email/Password en Firebase Console');
                break;

            // ===== ERRORES DE RED =====
            case 'auth/network-request-failed':
                errorMessage = 'Error de conexión. Verifica tu conexión a internet e intenta nuevamente.';
                break;

            case 'auth/too-many-requests':
                errorMessage = 'Demasiados intentos fallidos. Por favor, espera unos minutos antes de intentar nuevamente.';
                break;

            // ===== ERRORES DE DOMINIO =====
            case 'auth/unauthorized-domain':
                errorMessage = '⚠️ ERROR DE CONFIGURACIÓN: El dominio no está autorizado. Agrega "localhost" y tu dominio de producción en Firebase Console > Authentication > Settings > Authorized domains';
                break;

            default:
                errorMessage = `Error: ${err.message || 'Ocurrió un error inesperado'}`;
                console.error('⚠️ Error no manejado:', err.code);
                break;
        }

        setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  // FIX: Nuevo handler para completar perfil
  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !role || !pendingFirebaseUser) {
        setError('Por favor, completa todos los campos.');
        return;
    }
    
    console.log('✅ Completando perfil para:', pendingFirebaseUser.email);
    
    // Registrar el usuario con su perfil
    onRegister(pendingFirebaseUser, name, role);
    
    // Limpiar estados
    setNeedsProfile(false);
    setPendingFirebaseUser(null);
  };
  
  const toggleForm = () => {
      setIsLogin(!isLogin);
      setError('');
      setEmail('');
      setPassword('');
      setName('');
      setNeedsProfile(false);
      setPendingFirebaseUser(null);
  }
  
  // FIX: Renderizar formulario de completar perfil
  if (needsProfile && pendingFirebaseUser) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
                <BriefcaseIcon className="h-12 w-12 text-indigo-500 mx-auto" />
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white mt-4">
                  Completa tu Perfil
                </h1>
                <p className="text-slate-600 dark:text-slate-300 mt-2">
                    Bienvenido de nuevo, {pendingFirebaseUser.email}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Por favor, completa tu información para continuar
                </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg">
              <form onSubmit={handleCompleteProfile} className="space-y-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre Completo</label>
                    <input 
                        id="name" 
                        name="name" 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
                        placeholder="Ingresa tu nombre completo"
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" 
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Soy un...</label>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                        <label className={`relative flex items-center justify-center p-3 rounded-md cursor-pointer border ${role === Role.CLIENT ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600'}`}>
                            <input type="radio" name="role" value={Role.CLIENT} checked={role === Role.CLIENT} onChange={() => setRole(Role.CLIENT)} className="sr-only" />
                            <span className={`text-sm font-medium ${role === Role.CLIENT ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-800 dark:text-slate-200'}`}>Cliente</span>
                        </label>
                        <label className={`relative flex items-center justify-center p-3 rounded-md cursor-pointer border ${role === Role.PROFESSIONAL ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600'}`}>
                            <input type="radio" name="role" value={Role.PROFESSIONAL} checked={role === Role.PROFESSIONAL} onChange={() => setRole(Role.PROFESSIONAL)} className="sr-only" />
                            <span className={`text-sm font-medium ${role === Role.PROFESSIONAL ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-800 dark:text-slate-200'}`}>Profesional</span>
                        </label>
                    </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                <div>
                  <button 
                    type="submit" 
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Continuar al Dashboard
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <button 
                    onClick={() => {
                        auth.signOut();
                        setNeedsProfile(false);
                        setPendingFirebaseUser(null);
                    }} 
                    className="text-sm text-slate-500 dark:text-slate-400 hover:underline"
                >
                    Usar otra cuenta
                </button>
              </div>
            </div>
          </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
      <div className="w-full max-w-md">
         <div className="text-center mb-8">
            <BriefcaseIcon className="h-12 w-12 text-indigo-500 mx-auto" />
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mt-4">
              {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
                {isLogin ? 'Bienvenido de nuevo a Service Connect' : 'Únete a nuestra comunidad de profesionales y clientes'}
            </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
                <>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre Completo</label>
                        <input id="name" name="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Soy un...</label>
                        <div className="mt-2 grid grid-cols-2 gap-3">
                            <label className={`relative flex items-center justify-center p-3 rounded-md cursor-pointer border ${role === Role.CLIENT ? 'bg-indigo-50 border-indigo-500' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600'}`}>
                                <input type="radio" name="role" value={Role.CLIENT} checked={role === Role.CLIENT} onChange={() => setRole(Role.CLIENT)} className="sr-only" />
                                <span className={`text-sm font-medium ${role === Role.CLIENT ? 'text-indigo-700' : 'text-slate-800 dark:text-slate-200'}`}>Cliente</span>
                            </label>
                             <label className={`relative flex items-center justify-center p-3 rounded-md cursor-pointer border ${role === Role.PROFESSIONAL ? 'bg-indigo-50 border-indigo-500' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600'}`}>
                                <input type="radio" name="role" value={Role.PROFESSIONAL} checked={role === Role.PROFESSIONAL} onChange={() => setRole(Role.PROFESSIONAL)} className="sr-only" />
                                <span className={`text-sm font-medium ${role === Role.PROFESSIONAL ? 'text-indigo-700' : 'text-slate-800 dark:text-slate-200'}`}>Profesional</span>
                            </label>
                        </div>
                    </div>
                </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Correo Electrónico</label>
              <input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>

            <div>
              <label htmlFor="password"className="block text-sm font-medium text-slate-700 dark:text-slate-300">Contraseña</label>
              <input id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
              {isLogin && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Mínimo 6 caracteres
                </p>
              )}
            </div>
            
            {!isLogin && password.length > 0 && (
                <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">Requisitos de contraseña:</p>
                    <ul className="space-y-1">
                        <PasswordRequirement isValid={passwordValidation.minLength} text="Al menos 8 caracteres" />
                        <PasswordRequirement isValid={passwordValidation.hasUpper} text="Una letra mayúscula" />
                        <PasswordRequirement isValid={passwordValidation.hasLower} text="Una letra minúscula" />
                        <PasswordRequirement isValid={passwordValidation.hasNumber} text="Un número" />
                        <PasswordRequirement isValid={passwordValidation.hasSpecial} text="Un carácter especial (!@#...)" />
                    </ul>
                </div>
            )}


            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div>
              <button type="submit" disabled={isLoading || (!isLogin && !isPasswordStrong)} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Registrarse')}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button onClick={toggleForm} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
              {isLogin ? '¿No tienes una cuenta? Regístrate' : '¿Ya tienes una cuenta? Inicia Sesión'}
            </button>
             <p className="mt-2">
                <button onClick={onBackToHome} className="text-sm text-slate-500 dark:text-slate-400 hover:underline">
                    &larr; Volver al Inicio
                </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;