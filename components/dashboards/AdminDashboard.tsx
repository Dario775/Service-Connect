import React, { useState } from 'react';
import { JobPost, JobStatus, ServiceCategory, User } from '../../types';
import JobPostCard from '../jobs/JobPostCard';
import { SERVICE_CATEGORIES } from '../../constants';

interface AdminDashboardProps {
  posts: JobPost[];
  users: User[];
  onApprove: (postId: number) => void;
  onReject: (postId: number) => void;
  onFinalize: (postId: number) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ posts, users, onApprove, onReject, onFinalize }) => {
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<ServiceCategory | 'all'>('all');

  const filteredPosts = posts.filter(post => {
    const statusMatch = statusFilter === 'all' || post.status === statusFilter;
    // FIX: Corrected a typo where categoryMatch was being used in its own declaration. It should be compared with categoryFilter.
    const categoryMatch = categoryFilter === 'all' || post.category === categoryFilter;
    return statusMatch && categoryMatch;
  }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Panel de Administrador</h1>
        <p className="text-slate-600 dark:text-slate-300 mt-1">Filtra, revisa y modera todas las solicitudes de servicio.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white shrink-0">
                Solicitudes ({filteredPosts.length})
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div>
                <label htmlFor="status-filter" className="sr-only">Filtrar por estado</label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as JobStatus | 'all')}
                  className="w-full sm:w-auto block pl-3 pr-10 py-2 text-base bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-slate-800 dark:text-slate-200"
                >
                  <option value="all">Todos los Estados</option>
                  {Object.values(JobStatus).map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="category-filter" className="sr-only">Filtrar por categoría</label>
                 <select
                  id="category-filter"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as ServiceCategory | 'all')}
                  className="w-full sm:w-auto block pl-3 pr-10 py-2 text-base bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-slate-800 dark:text-slate-200"
                >
                  <option value="all">Todas las Categorías</option>
                  {SERVICE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
        </div>

        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map(post => (
              <JobPostCard key={post.id} post={post} users={users}>
                {post.status === JobStatus.PENDING && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onApprove(post.id)}
                      className="flex-1 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Aprobar
                    </button>
                    <button
                      onClick={() => onReject(post.id)}
                      className="flex-1 inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-slate-600 shadow-sm text-sm font-medium rounded-md text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Rechazar
                    </button>
                  </div>
                )}
                 {post.status === JobStatus.AWAITING_ADMIN_FINALIZATION && (
                    <button
                      onClick={() => onFinalize(post.id)}
                      className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Aceptar Solución y Finalizar
                    </button>
                )}
              </JobPostCard>
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-500 dark:text-slate-400 py-8">No hay solicitudes que coincidan con los filtros seleccionados.</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;