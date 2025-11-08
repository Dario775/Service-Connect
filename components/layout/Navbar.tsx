
import React from 'react';
import { User, Role } from '../../types';
import { BriefcaseIcon, UserCircleIcon, ShieldCheckIcon, LogoutIcon, SearchIcon } from '../icons/IconComponents';

interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
  onNavigateToLogin?: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const RoleIcon: React.FC<{ role: string, className: string }> = ({ role, className }) => {
  switch (role) {
    case Role.CLIENT: return <UserCircleIcon className={className} />;
    case Role.PROFESSIONAL: return <BriefcaseIcon className={className} />;
    case Role.ADMIN: return <ShieldCheckIcon className={className} />;
    default: return null;
  }
};

const Navbar: React.FC<NavbarProps> = ({ currentUser, onLogout, onNavigateToLogin, searchQuery, onSearchChange }) => {
  return (
    <nav className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="/" className="flex items-center cursor-pointer flex-shrink-0">
            <BriefcaseIcon className="h-8 w-8 text-indigo-500" />
            <span className="ml-2 text-2xl font-bold text-slate-800 dark:text-white">Service Connect</span>
          </a>
          
          <div className="flex-1 flex justify-center px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="search"
                name="search"
                id="search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md leading-5 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Buscar por título o descripción..."
              />
            </div>
          </div>

          {currentUser ? (
            <div className="flex items-center space-x-4">
               <div className="flex items-center">
                 <RoleIcon role={currentUser.role} className="h-6 w-6 text-slate-500 dark:text-slate-300" />
                 <span className="ml-2 text-slate-700 dark:text-slate-200 font-medium whitespace-nowrap">{currentUser.name}</span>
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