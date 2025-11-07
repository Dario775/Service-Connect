import React from 'react';
import { JobPost, User, JobStatus } from '../../types';
import CreateJobPostForm from '../jobs/CreateJobPostForm';
import JobPostCard from '../jobs/JobPostCard';
import { UserCircleIcon, PhoneIcon, LocationMarkerIcon } from '../icons/IconComponents';

interface ClientDashboardProps {
  currentUser: User;
  posts: JobPost[];
  addJobPost: (newPost: Omit<JobPost, 'id' | 'status' | 'createdAt'>) => void;
  onValidate: (postId: number) => void;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ currentUser, posts, addJobPost, onValidate }) => {
  const myPosts = posts.filter(p => p.clientId === currentUser.id).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-8">
        <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 flex items-center">
                <UserCircleIcon className="h-8 w-8 mr-3 text-indigo-500" />
                Mi Perfil
            </h2>
            <div className="space-y-4">
                <div>
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Nombre Completo</h3>
                    <p className="mt-1 text-slate-800 dark:text-white font-semibold">{currentUser.name}</p>
                </div>
                <div className="flex items-center">
                    <PhoneIcon className="h-5 w-5 mr-3 text-slate-400" />
                    <p className="text-slate-800 dark:text-white">{currentUser.phone || 'Teléfono no especificado'}</p>
                </div>
                <div className="flex items-start">
                    <LocationMarkerIcon className="h-5 w-5 mr-3 text-slate-400 mt-1 flex-shrink-0" />
                    <p className="text-slate-800 dark:text-white">{currentUser.address || 'Dirección no especificada'}</p>
                </div>
            </div>
        </div>
        <CreateJobPostForm clientId={currentUser.id} onSubmit={addJobPost} />
      </div>
      <div className="lg:col-span-2">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Mis Solicitudes de Servicio</h2>
        {myPosts.length > 0 ? (
          <div className="space-y-6">
            {myPosts.map(post => (
              <JobPostCard key={post.id} post={post}>
                {post.status === JobStatus.AWAITING_CLIENT_VALIDATION && (
                   <button
                      onClick={() => onValidate(post.id)}
                      className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Confirmar y Validar Finalización
                    </button>
                )}
              </JobPostCard>
            ))}
          </div>
        ) : (
          <div className="text-center bg-white dark:bg-slate-800 p-12 rounded-lg shadow-md">
              <p className="text-slate-500 dark:text-slate-400">Aún no has publicado ninguna solicitud de servicio.</p>
              <p className="text-slate-500 dark:text-slate-400 mt-2">¡Usa el formulario para empezar!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;