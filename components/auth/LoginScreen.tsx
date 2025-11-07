
import React from 'react';
import { USERS } from '../../constants';
import { User, Role } from '../../types';
import { BriefcaseIcon, UserCircleIcon, ShieldCheckIcon } from '../icons/IconComponents';

interface LoginScreenProps {
  onLogin: (user: User) => void;
  onBackToHome: () => void;
}

const RoleIcon: React.FC<{ role: string, className: string }> = ({ role, className }) => {
  switch (role) {
    case Role.CLIENT: return <UserCircleIcon className={className} />;
    case Role.PROFESSIONAL: return <BriefcaseIcon className={className} />;
    case Role.ADMIN: return <ShieldCheckIcon className={className} />;
    default: return null;
  }
};

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onBackToHome }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
      <div className="text-center mb-8">
          <BriefcaseIcon className="h-16 w-16 text-indigo-500 mx-auto" />
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white mt-4">Bienvenido a Service Connect</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-2">Tu plataforma central para servicios profesionales.</p>
      </div>
      <div className="w-full max-w-md bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-white mb-6">Selecciona tu Perfil</h2>
        <div className="space-y-4">
          {USERS.map((user) => (
            <button
              key={user.id}
              onClick={() => onLogin(user)}
              className="w-full flex items-center p-4 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-indigo-600 transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <RoleIcon role={user.role} className="h-8 w-8 text-indigo-500" />
              <div className="ml-4 text-left">
                <p className="font-semibold text-slate-800 dark:text-white">{user.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-300">{user.role}</p>
              </div>
            </button>
          ))}
        </div>
        <div className="mt-6 text-center">
            <button onClick={onBackToHome} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                &larr; Volver al Inicio
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;