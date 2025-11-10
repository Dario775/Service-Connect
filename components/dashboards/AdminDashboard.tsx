import React, { useState, useRef } from 'react';
import { JobPost, JobStatus, ServiceCategory, User, Role } from '../../types';
import JobPostCard from '../jobs/JobPostCard';
import { SERVICE_CATEGORIES } from '../../constants';
import { PhotographIcon, XIcon, PencilAltIcon, CheckBadgeIcon, TrashIcon, SearchIcon, UserCircleIcon } from '../icons/IconComponents';


interface AdminDashboardProps {
  currentUser: User;
  posts: JobPost[];
  users: User[];
  onApprove: (postId: string) => void;
  onReject: (postId: string) => void;
  onFinalize: (postId: string) => void;
  heroImages: string[];
  onUpdateHeroImages: (images: string[]) => void;
  onToggleUserVerification: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
}

const HeroImageManager: React.FC<{
  images: string[];
  onUpdate: (images: string[]) => void;
}> = ({ images, onUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleFileSelect = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('image/')) {
        return reject(new Error('Por favor, selecciona un archivo de imagen.'));
      }
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const base64Image = await handleFileSelect(file);
      const newImages = [...images];

      if (editingIndex !== null) {
        // Replace image
        newImages[editingIndex] = base64Image;
      } else {
        // Add new image
        if (newImages.length < 5) {
          newImages.push(base64Image);
        }
      }
      onUpdate(newImages);
    } catch (error) {
      console.error(error);
      alert('Hubo un error al procesar la imagen.');
    } finally {
      setEditingIndex(null);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = (index: number | null = null) => {
    setEditingIndex(index);
    fileInputRef.current?.click();
  };

  const removeImage = (indexToRemove: number) => {
    onUpdate(images.filter((_, index) => index !== indexToRemove));
  };
  
  return (
     <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Gestionar Imágenes del Inicio</h2>
        <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {images.map((image, index) => (
                <div key={index} className="relative group aspect-video rounded-lg overflow-hidden shadow-sm">
                    <img src={image} alt={`Imagen de fondo ${index + 1}`} className="w-full h-full object-cover"/>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center gap-2">
                        <button onClick={() => triggerFileInput(index)} className="p-2 bg-white/80 rounded-full text-slate-800 hover:bg-white scale-0 group-hover:scale-100 transition-transform" title="Cambiar imagen">
                            <PencilAltIcon className="h-5 w-5"/>
                        </button>
                        <button onClick={() => removeImage(index)} className="p-2 bg-red-600/80 rounded-full text-white hover:bg-red-600 scale-0 group-hover:scale-100 transition-transform delay-75" title="Eliminar imagen">
                            <XIcon className="h-5 w-5"/>
                        </button>
                    </div>
                </div>
            ))}
            {images.length < 5 && (
                <button 
                  onClick={() => triggerFileInput(null)}
                  className="aspect-video border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-indigo-500 transition-colors"
                >
                    <PhotographIcon className="h-8 w-8"/>
                    <span className="text-sm mt-2">Añadir Imagen</span>
                </button>
            )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">Puedes tener hasta 5 imágenes en la rotación de la página de inicio.</p>
    </div>
  )
}

const UserManager: React.FC<{
  users: User[];
  onToggleVerification: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  currentAdminId: string;
}> = ({ users, onToggleVerification, onDeleteUser, currentAdminId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all');

  const filteredUsers = users
    .filter(u => u.id !== currentAdminId)
    .filter(u => roleFilter === 'all' || u.role === roleFilter)
    .filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white shrink-0">
          Gestionar Usuarios ({filteredUsers.length})
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-slate-400" />
              </div>
            <input
              type="search"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full block pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value as 'all' | Role)}
            className="w-full sm:w-auto block pl-3 pr-10 py-2 text-base bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-slate-800 dark:text-slate-200"
          >
            <option value="all">Todos los Roles</option>
            <option value={Role.CLIENT}>Clientes</option>
            <option value={Role.PROFESSIONAL}>Profesionales</option>
          </select>
        </div>
      </div>
      
      {filteredUsers.length > 0 ? (
        <ul role="list" className="divide-y divide-slate-200 dark:divide-slate-700">
          {filteredUsers.map(user => (
            <li key={user.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
              <div className="flex items-center gap-x-4">
                {user.photo ? (
                  <img className="h-10 w-10 flex-none rounded-full bg-slate-50 object-cover" src={user.photo} alt="" />
                ) : (
                  <UserCircleIcon className="h-10 w-10 flex-none text-slate-400" />
                )}
                <div className="min-w-0 flex-auto">
                  <p className="text-sm font-semibold leading-6 text-slate-900 dark:text-white flex items-center gap-x-2">
                    {user.name}
                    {user.isVerified && <CheckBadgeIcon className="h-5 w-5 text-blue-500" title="Profesional Verificado" />}
                  </p>
                  <p className="mt-1 truncate text-xs leading-5 text-slate-500 dark:text-slate-400">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-x-6 w-full sm:w-auto">
                 <div className="hidden sm:block">
                    <p className="text-sm text-slate-500 dark:text-slate-400">{user.role}</p>
                </div>
                <div className="flex items-center gap-x-2 flex-1 sm:flex-initial justify-end">
                    {user.role === Role.PROFESSIONAL && (
                    <button
                        onClick={() => onToggleVerification(user.id)}
                        className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm ${
                        user.isVerified
                            ? 'text-yellow-800 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-200 dark:hover:bg-yellow-900'
                            : 'text-green-800 bg-green-100 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-200 dark:hover:bg-green-900'
                        }`}
                    >
                       {user.isVerified ? 'Quitar Verificación' : 'Verificar'}
                    </button>
                    )}
                    <button
                        onClick={() => onDeleteUser(user.id)}
                        className="p-2 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
                        title="Eliminar usuario"
                    >
                        <TrashIcon className="h-5 w-5" />
                    </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-slate-500 dark:text-slate-400 py-8">No se encontraron usuarios que coincidan con la búsqueda.</p>
      )}
    </div>
  );
};


const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, posts, users, onApprove, onReject, onFinalize, heroImages, onUpdateHeroImages, onToggleUserVerification, onDeleteUser }) => {
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<ServiceCategory | 'all'>('all');

  const filteredPosts = posts.filter(post => {
    const statusMatch = statusFilter === 'all' || post.status === statusFilter;
    const categoryMatch = categoryFilter === 'all' || post.category === categoryFilter;
    return statusMatch && categoryMatch;
  }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Panel de Administrador</h1>
        <p className="text-slate-600 dark:text-slate-300 mt-1">Modera solicitudes, gestiona usuarios y configura la página de inicio.</p>
      </div>

      <UserManager 
        users={users}
        currentAdminId={currentUser.id}
        onToggleVerification={onToggleUserVerification}
        onDeleteUser={onDeleteUser}
      />

      <HeroImageManager images={heroImages} onUpdate={onUpdateHeroImages} />

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white shrink-0">
                Solicitudes de Servicio ({filteredPosts.length})
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