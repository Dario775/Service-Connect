
import React from 'react';
import { User, Role } from '../../types';
import { BriefcaseIcon, UserCircleIcon, ShieldCheckIcon, LogoutIcon } from '../icons/IconComponents';

interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
  onNavigateToLogin?: () => void;
}

const RoleIcon: React.FC<{ role: string, className: string }> = ({ role, className }) => {
  switch (role) {
    case Role.CLIENT: return <UserCircleIcon className={className} />;
    case Role.PROFESSIONAL: return <BriefcaseIcon className={className} />;
    case Role.ADMIN: return <ShieldCheckIcon className={className} />;
    default: return null;
  }
};

const Navbar: React.FC<NavbarProps> = ({ currentUser, onLogout, onNavigateToLogin }) => {
  return (
    <nav className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="/" className="flex items-center cursor-pointer">
            <BriefcaseIcon className="h-8 w-8 text-indigo-500" />
            <span className="ml-2 text-2xl font-bold text-slate-800 dark:text-white">Service Connect</span>
          </a>
          {currentUser ? (
            <div className="flex items-center space-x-4">
               <div className="flex items-center">
                 <RoleIcon role={currentUser.role} className="h-6 w-6 text-slate-500 dark:text-slate-300" />
                 <span className="ml-2 text-slate-700 dark:text-slate-200 font-medium">{currentUser.name}</span>
                 <span className="ml-2 text-xs font-semibold uppercase px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">{currentUser.role}</span>
              </div>
              <button onClick={onLogout} className="flex items-center p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <LogoutIcon className="h-6 w-6" />
                <span className="sr-only">Cerrar sesión</span>
              </button>
            </div>
          ) : (
             <button
              onClick={onNavigateToLogin}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Iniciar Sesión
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;