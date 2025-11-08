import React, { useState } from 'react';
import { JobPost, User, JobStatus } from '../../types';
import CreateJobPostForm from '../jobs/CreateJobPostForm';
import JobPostCard from '../jobs/JobPostCard';
import RatingModal from '../jobs/RatingModal';
import { UserCircleIcon, PhoneIcon, LocationMarkerIcon, PencilAltIcon } from '../icons/IconComponents';

interface ClientDashboardProps {
  currentUser: User;
  posts: JobPost[];
  users: User[];
  addJobPost: (newPost: Omit<JobPost, 'id' | 'status' | 'createdAt'>) => void;
  onClientComplete: (postId: string, rating: number, feedback: string) => void;
  onUpdateUser: (user: User) => void;
  onCancelJob: (postId: string) => void;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ currentUser, posts, users, addJobPost, onClientComplete, onUpdateUser, onCancelJob }) => {
  const myPosts = posts.filter(p => p.clientId === currentUser.id).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const [ratingPost, setRatingPost] = useState<JobPost | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<User>(currentUser);
  const [saveStatus, setSaveStatus] = useState('');
  const [locationStatus, setLocationStatus] = useState('');
  const [locationSuccess, setLocationSuccess] = useState(false);
  
  const handleOpenRatingModal = (post: JobPost) => {
    setRatingPost(post);
  };
  
  const handleCloseRatingModal = () => {
    setRatingPost(null);
  };

  const handleRatingSubmit = (rating: number, feedback: string) => {
    if (ratingPost) {
      onClientComplete(ratingPost.id, rating, feedback);
      handleCloseRatingModal();
    }
  };
  
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAttachLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('La geolocalización no es compatible con tu navegador.');
      setLocationSuccess(false);
      return;
    }
    setLocationStatus('Obteniendo ubicación...');
    setLocationSuccess(false);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocationStatus('Ubicación obtenida. Obteniendo dirección...');
        
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          if (!response.ok) {
            throw new Error('La respuesta de la red no fue correcta.');
          }
          const data = await response.json();
          const address = data.display_name || 'No se pudo encontrar una dirección para esta ubicación.';

          setProfileData(prev => ({ 
            ...prev, 
            latitude, 
            longitude,
            address: address 
          }));
          setLocationStatus('¡Dirección autocompletada! No olvides guardar.');
          setLocationSuccess(true);
        } catch (error) {
          console.error("Error de geocodificación inversa:", error);
          setProfileData(prev => ({ ...prev, latitude, longitude, address: 'No se pudo obtener la dirección.' }));
          setLocationStatus('Ubicación actualizada, pero no se pudo obtener la dirección.');
          setLocationSuccess(true);
        }
      },
      () => {
        setLocationStatus('No se pudo obtener la ubicación. Comprueba los permisos.');
        setLocationSuccess(false);
      },
      { timeout: 10000 }
    );
  };

  const handleProfileSave = () => {
    onUpdateUser(profileData);
    setIsEditing(false);
    setSaveStatus('¡Perfil guardado con éxito!');
    setLocationStatus('');
    setLocationSuccess(false);
    setTimeout(() => setSaveStatus(''), 3000);
  };
  
  const handleCancelEdit = () => {
    setProfileData(currentUser);
    setIsEditing(false);
    setLocationStatus('');
    setLocationSuccess(false);
  }

  return (
    <>
      {ratingPost && (
        <RatingModal
          isOpen={!!ratingPost}
          onClose={handleCloseRatingModal}
          onSubmit={handleRatingSubmit}
          userNameToRate="el Profesional"
        />
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
                    <UserCircleIcon className="h-8 w-8 mr-3 text-indigo-500" />
                    Mi Perfil
                </h2>
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200">
                        <PencilAltIcon className="h-4 w-4 mr-1"/>
                        Editar
                    </button>
                )}
            </div>
            
            {saveStatus && <p className="text-sm text-green-600 dark:text-green-400 mb-4">{saveStatus}</p>}

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre Completo</label>
                  <input type="text" name="name" id="name" value={profileData.name} onChange={handleProfileChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Teléfono</label>
                  <input type="tel" name="phone" id="phone" value={profileData.phone || ''} onChange={handleProfileChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Dirección</label>
                  <input type="text" name="address" id="address" value={profileData.address || ''} onChange={handleProfileChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                   <button type="button" onClick={handleAttachLocation} className="flex items-center justify-center w-full mt-2 px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md shadow-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                      <LocationMarkerIcon className="h-5 w-5 mr-2" />
                      Usar mi Ubicación para autocompletar
                  </button>
                  {locationStatus && <p className={`mt-2 text-sm text-center ${locationSuccess ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}`}>{locationStatus}</p>}
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button onClick={handleCancelEdit} className="px-4 py-2 text-sm font-medium rounded-md text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-600 hover:bg-slate-200 dark:hover:bg-slate-500">Cancelar</button>
                  <button onClick={handleProfileSave} className="px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">Guardar Cambios</button>
                </div>
              </div>
            ) : (
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
            )}
          </div>
          <CreateJobPostForm clientId={currentUser.id} onSubmit={addJobPost} />
        </div>
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Mis Solicitudes de Servicio</h2>
          {myPosts.length > 0 ? (
            <div className="space-y-6">
              {myPosts.map(post => (
                <JobPostCard key={post.id} post={post} users={users}>
                   {post.status === JobStatus.AWAITING_CLIENT_VALIDATION && (
                     <button
                        onClick={() => handleOpenRatingModal(post)}
                        className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Confirmar y Calificar
                      </button>
                  )}
                  {(post.status === JobStatus.PENDING || (post.status === JobStatus.ACTIVE && !post.professionalId)) && (
                     <button
                        onClick={() => onCancelJob(post.id)}
                        className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Cancelar Solicitud
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
    </>
  );
};

export default ClientDashboard;