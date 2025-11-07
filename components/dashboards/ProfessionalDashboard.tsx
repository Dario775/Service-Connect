import React from 'react';
import { JobPost, JobStatus, User } from '../../types';
import JobPostCard from '../jobs/JobPostCard';
import JobProgressUpdater from '../jobs/JobProgressUpdater';

interface ProfessionalDashboardProps {
  currentUser: User;
  posts: JobPost[];
  onTakeJob: (postId: number) => void;
  onUpdateProgress: (postId: number, progress: number) => void;
  onMarkComplete: (postId: number) => void;
}

const ProfessionalDashboard: React.FC<ProfessionalDashboardProps> = ({ currentUser, posts, onTakeJob, onUpdateProgress, onMarkComplete }) => {
  const availableJobs = posts.filter(p => p.status === JobStatus.ACTIVE);
  const myJobs = posts.filter(p => p.professionalId === currentUser.id).sort((a,b) => a.status === JobStatus.IN_PROGRESS ? -1 : 1);

  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Panel de Profesional</h1>
        <p className="text-slate-600 dark:text-slate-300 mt-1">Encuentra nuevas oportunidades y gestiona tu trabajo actual.</p>
      </div>
      
      {myJobs.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Mis Trabajos ({myJobs.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myJobs.map(post => (
                    <JobPostCard key={post.id} post={post} hideProgressBar>
                      {post.status === JobStatus.IN_PROGRESS && (
                        <div className="space-y-4">
                          <JobProgressUpdater
                            postId={post.id}
                            currentProgress={post.progress || 0}
                            onUpdate={onUpdateProgress}
                          />
                           <button
                              onClick={() => onMarkComplete(post.id)}
                              className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              Marcar como Terminado
                            </button>
                        </div>
                      )}
                    </JobPostCard>
                  ))}
              </div>
          </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Trabajos Disponibles ({availableJobs.length})</h2>
        {availableJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableJobs.map(post => (
              <JobPostCard key={post.id} post={post}>
                <button
                  onClick={() => onTakeJob(post.id)}
                  className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Aceptar Trabajo
                </button>
              </JobPostCard>
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-500 dark:text-slate-400 py-8">No hay trabajos disponibles en este momento. ¡Vuelve más tarde!</p>
        )}
      </div>
    </div>
  );
};

export default ProfessionalDashboard;