import React, { useState } from 'react';
import { auth } from '../../firebase/config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, User as FirebaseUser } from 'firebase/auth';
import { Role } from '../../types';
import { BriefcaseIcon } from '../icons/IconComponents';

interface AuthScreenProps {
  onRegister: (firebaseUser: FirebaseUser, name: string, role: Role) => void;
  onBackToHome: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onRegister, onBackToHome }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>(Role.CLIENT);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!isLogin && (!name || !role)) {
      setError('Por favor, completa todos los campos para registrarte.');
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        // onAuthStateChanged en App.tsx se encargará del resto
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        onRegister(userCredential.user, name, role);
      }
    } catch (err: any) {
      console.error("Authentication Error:", err); // Log the full error for debugging
      let errorMessage = 'Ocurrió un error. Por favor, inténtalo de nuevo.';
      switch (err.code) {
        case 'auth/user-not-found':
          errorMessage = 'No se encontró ningún usuario con este correo electrónico.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'La contraseña es incorrecta.';
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'Este correo electrónico ya está registrado.';
          break;
        case 'auth/weak-password':
          errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
          break;
         case 'auth/invalid-credential':
           errorMessage = 'Las credenciales proporcionadas no son válidas o han caducado.';
           break;
        default:
          // This will catch generic errors like network failures or config issues.
          // The most likely issue is the Firebase config is not set up.
          errorMessage = 'Error de conexión o configuración. Por favor, verifica tu conexión a internet y asegúrate de que la configuración de Firebase en `firebase/config.ts` sea correcta y no contenga valores de marcador de posición.';
          break;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleForm = () => {
      setIsLogin(!isLogin);
      setError('');
      setEmail('');
      setPassword('');
      setName('');
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
            </div>

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <div>
              <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
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