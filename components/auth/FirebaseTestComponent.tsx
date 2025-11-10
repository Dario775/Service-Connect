import React, { useState, useEffect } from 'react';
import { auth } from '../../firebase/config';

/**
 * FirebaseTestComponent - Componente de diagnóstico
 * 
 * Este componente ayuda a diagnosticar problemas de configuración de Firebase.
 * Puedes agregarlo temporalmente a tu App.tsx para verificar que todo funcione.
 */
const FirebaseTestComponent: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const addResult = (message: string, isError = false) => {
    const prefix = isError ? '❌' : '✅';
    setTestResults(prev => [...prev, `${prefix} ${message}`]);
    console.log(`${prefix} ${message}`);
  };

  const runDiagnostics = async () => {
    setIsLoading(true);
    setTestResults([]);

    // Test 1: Verificar que Firebase Auth está inicializado
    try {
      if (auth) {
        addResult('Firebase Auth está inicializado correctamente');
      } else {
        addResult('Firebase Auth NO está inicializado', true);
      }
    } catch (error) {
      addResult('Error al acceder a Firebase Auth', true);
    }

    // Test 2: Verificar configuración de Auth
    try {
      const app = auth.app;
      // FIX: Cast app.options to any to access properties that are not on the generic Object type.
      addResult(`Proyecto Firebase: ${(app.options as any).projectId}`);
      addResult(`Auth Domain: ${(app.options as any).authDomain}`);
    } catch (error) {
      addResult('No se pudo obtener la configuración de Firebase', true);
    }

    // Test 3: Verificar estado de autenticación actual
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        addResult(`Usuario actual: ${currentUser.email}`);
      } else {
        addResult('No hay usuario autenticado actualmente');
      }
    } catch (error) {
      addResult('Error al verificar usuario actual', true);
    }

    // Test 4: Intentar crear un usuario de prueba
    addResult('Esperando para test de creación de usuario...');
    
    setIsLoading(false);
  };

  const testCreateUser = async () => {
    setIsLoading(true);
    const testEmail = `test${Date.now()}@ejemplo.com`;
    const testPassword = 'Test123!@#';

    addResult(`Intentando crear usuario de prueba: ${testEmail}`);

    try {
      const userCredential = await auth.createUserWithEmailAndPassword(testEmail, testPassword);
      addResult(`✅ ÉXITO: Usuario de prueba creado exitosamente`);
      addResult(`Email: ${userCredential.user?.email}`);
      addResult(`UID: ${userCredential.user?.uid}`);
      
      // Limpiar: eliminar el usuario de prueba
      if (userCredential.user) {
        await userCredential.user.delete();
        addResult('Usuario de prueba eliminado');
      }
    } catch (error: any) {
      addResult(`ERROR al crear usuario: ${error.code}`, true);
      addResult(`Mensaje: ${error.message}`, true);
      
      // Diagnósticos específicos según el error
      if (error.code === 'auth/operation-not-allowed') {
        addResult('🔧 SOLUCIÓN: Ve a Firebase Console > Authentication > Sign-in method', true);
        addResult('🔧 Habilita "Email/Password" como proveedor de autenticación', true);
      } else if (error.code === 'auth/network-request-failed') {
        addResult('🔧 SOLUCIÓN: Verifica tu conexión a internet', true);
      } else if (error.code === 'auth/unauthorized-domain') {
        addResult('🔧 SOLUCIÓN: Agrega tu dominio en Firebase Console > Authentication > Settings > Authorized domains', true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const testLogin = async () => {
    const email = prompt('Ingresa el correo electrónico de prueba:');
    const password = prompt('Ingresa la contraseña:');

    if (!email || !password) {
      addResult('Test de login cancelado', true);
      return;
    }

    setIsLoading(true);
    addResult(`Intentando iniciar sesión con: ${email}`);

    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      addResult('✅ LOGIN EXITOSO');
      addResult(`Usuario: ${userCredential.user?.email}`);
    } catch (error: any) {
      addResult(`ERROR en login: ${error.code}`, true);
      addResult(`Mensaje: ${error.message}`, true);

      // Diagnósticos específicos
      if (error.code === 'auth/invalid-credential' || 
          error.code === 'auth/user-not-found' || 
          error.code === 'auth/wrong-password') {
        addResult('🔧 El usuario no existe o la contraseña es incorrecta', true);
        addResult('🔧 Prueba primero crear el usuario', true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 overflow-auto bg-white dark:bg-slate-800 rounded-lg shadow-2xl border-2 border-indigo-500 p-4 z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
          🔥 Firebase Diagnostics
        </h3>
        <button
          onClick={runDiagnostics}
          disabled={isLoading}
          className="text-xs bg-indigo-500 text-white px-2 py-1 rounded hover:bg-indigo-600 disabled:opacity-50"
        >
          Recargar
        </button>
      </div>

      <div className="space-y-1 mb-3 max-h-48 overflow-y-auto bg-slate-50 dark:bg-slate-900 p-2 rounded text-xs font-mono">
        {testResults.length === 0 ? (
          <p className="text-slate-500">Ejecutando diagnósticos...</p>
        ) : (
          testResults.map((result, index) => (
            <p key={index} className="text-slate-700 dark:text-slate-300">
              {result}
            </p>
          ))
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={testCreateUser}
          disabled={isLoading}
          className="flex-1 bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600 disabled:opacity-50"
        >
          Test Crear Usuario
        </button>
        <button
          onClick={testLogin}
          disabled={isLoading}
          className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
        >
          Test Login
        </button>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
        Elimina este componente en producción
      </p>
    </div>
  );
};

export default FirebaseTestComponent;