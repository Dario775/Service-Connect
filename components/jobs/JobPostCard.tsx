import React from 'react';
import { JobPost, JobStatus, User } from '../../types';
import { USERS } from '../../constants';

interface JobPostCardProps {
  post: JobPost;
  children?: React.ReactNode;
  hideProgressBar?: boolean;
}

const getStatusColor = (status: JobStatus) => {
  switch (status) {
    case JobStatus.PENDING: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case JobStatus.ACTIVE: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case JobStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case JobStatus.AWAITING_CLIENT_VALIDATION: return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case JobStatus.AWAITING_ADMIN_FINALIZATION: return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
    case JobStatus.COMPLETED: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
    case JobStatus.REJECTED: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
};

const JobPostCard: React.FC<JobPostCardProps> = ({ post, children, hideProgressBar = false }) => {
  const client = USERS.find(u => u.id === post.clientId);
  const professional = USERS.find(u => u.id === post.professionalId);

  return (
    <div className="bg-white dark:bg-slate-700 rounded-lg shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-xl flex flex-col">
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">{post.title}</h3>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(post.status)}`}>
            {post.status}
          </span>
        </div>
        <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mt-1">{post.category}</p>
        <p className="text-slate-600 dark:text-slate-300 mt-4 text-sm">{post.description}</p>
        
        {(post.status === JobStatus.AWAITING_CLIENT_VALIDATION || post.status === JobStatus.AWAITING_ADMIN_FINALIZATION) && (
             <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-600/50 rounded-md text-sm text-center">
                <p className="font-semibold text-slate-700 dark:text-slate-200">Estado del Proceso:</p>
                <p className="text-slate-600 dark:text-slate-300">{post.status}</p>
            </div>
        )}
        
        {!hideProgressBar && post.progress !== undefined && (post.status === JobStatus.IN_PROGRESS || post.status === JobStatus.AWAITING_CLIENT_VALIDATION) && (
            <div className="mt-4">
                <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Progreso</span>
                    <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{post.progress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2.5">
                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${post.progress}%` }}></div>
                </div>
            </div>
        )}

        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600 text-xs text-slate-500 dark:text-slate-400">
          <p>Publicado por: <span className="font-semibold">{client?.name || 'Desconocido'}</span></p>
          {professional && (
            <p>Asignado a: <span className="font-semibold">{professional.name}</span></p>
          )}
          <p>Publicado el: <span className="font-semibold">{post.createdAt.toLocaleDateString()}</span></p>
        </div>
      </div>
      {children && (
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-600/50 mt-auto">
          {children}
        </div>
      )}
    </div>
  );
};

export default JobPostCard;