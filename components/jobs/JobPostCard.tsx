import React, { useState } from 'react';
import { JobPost, JobStatus, User } from '../../types';
import { StarIcon, LocationMarkerIcon } from '../icons/IconComponents';
import PhotoViewerModal from './PhotoViewerModal';

interface JobPostCardProps {
  post: JobPost;
  users: User[];
  currentUser?: User | null;
  children?: React.ReactNode;
  hideProgressBar?: boolean;
  distance?: number;
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
    case JobStatus.CANCELLED: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
};

const RatingDisplay: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
            <StarIcon key={i} className="h-5 w-5 text-yellow-400" filled={i < rating} />
        ))}
    </div>
);

const JobPostCard: React.FC<JobPostCardProps> = ({ post, users, children, hideProgressBar = false, distance }) => {
  const client = users.find(u => u.id === post.clientId);
  const professional = users.find(u => u.id === post.professionalId);
  const [isPhotoViewerOpen, setIsPhotoViewerOpen] = useState(false);

  return (
    <>
      {post.photo && (
        <PhotoViewerModal
          isOpen={isPhotoViewerOpen}
          onClose={() => setIsPhotoViewerOpen(false)}
          photoSrc={post.photo}
          title={post.title}
        />
      )}
      <div className="bg-white dark:bg-slate-700 rounded-lg shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-xl flex flex-col">
        {post.photo && (
            <div 
            className="h-48 w-full cursor-pointer group relative bg-slate-200 dark:bg-slate-600" 
            onClick={() => setIsPhotoViewerOpen(true)}
            >
            <img src={post.photo} alt={`Vista previa de ${post.title}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                <p className="text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">Ver imagen</p>
            </div>
            </div>
        )}
        <div className="p-6 flex-grow">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">{post.title}</h3>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(post.status)}`}>
              {post.status}
            </span>
          </div>
          <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mt-1">{post.category}</p>
          
           {distance !== undefined && (
            <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mt-2">
              <LocationMarkerIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
              <span>Aprox. {distance.toFixed(1)} km de distancia</span>
            </div>
          )}

          <p className="text-slate-600 dark:text-slate-300 mt-4 text-sm">{post.description}</p>
          
          {post.status === JobStatus.AWAITING_CLIENT_VALIDATION && (
               <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-600/50 rounded-md text-sm text-center">
                  <p className="font-semibold text-slate-700 dark:text-slate-200">Esperando confirmación del cliente</p>
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
          
          {(post.status === JobStatus.AWAITING_ADMIN_FINALIZATION || post.status === JobStatus.COMPLETED) && (post.professionalRating || post.clientRating) && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600 space-y-3">
                   <h4 className="text-sm font-bold text-slate-800 dark:text-white">Calificaciones Finales</h4>
                   {post.professionalRating && (
                       <div>
                           <div className="flex justify-between items-center">
                              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Del Cliente a {professional?.name.split(' ')[0]}</span>
                              <RatingDisplay rating={post.professionalRating} />
                           </div>
                           {post.professionalFeedback && <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 italic">"{post.professionalFeedback}"</p>}
                       </div>
                   )}
                   {client?.name && post.clientRating && (
                        <div>
                           <div className="flex justify-between items-center">
                              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Del Profesional a {client.name.split(' ')[0]}</span>
                              <RatingDisplay rating={post.clientRating} />
                           </div>
                           {post.clientFeedback && <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 italic">"{post.clientFeedback}"</p>}
                       </div>
                   )}
              </div>
          )}

          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex justify-between items-center">
              <div>
                <p>Publicado por: <span className="font-semibold">{client?.name || 'Desconocido'}</span></p>
                {professional && (
                  <p>Asignado a: <span className="font-semibold">{professional.name}</span></p>
                )}
                <p>Publicado el: <span className="font-semibold">{post.createdAt.toLocaleDateString()}</span></p>
              </div>
            </div>
          </div>
        </div>
        {children && (
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-600/50 mt-auto">
            {children}
          </div>
        )}
      </div>
    </>
  );
};

export default JobPostCard;