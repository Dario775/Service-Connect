import React, { useState, useRef, useEffect } from 'react';
import { JobPost, JobStatus, User, ServiceCategory, ChatMessage } from '../../types';
import JobPostCard from '../jobs/JobPostCard';
import JobProgressUpdater from '../jobs/JobProgressUpdater';
import RatingModal from '../jobs/RatingModal';
import CameraModal from '../jobs/CameraModal';
import { UserCircleIcon, PhotographIcon, CameraIcon, XIcon, LocationMarkerIcon, PencilAltIcon, PhoneIcon, ChatAltIcon, CheckBadgeIcon } from '../icons/IconComponents';
import { SERVICE_CATEGORIES } from '../../constants';
import JobDetailModal from '../jobs/JobDetailModal';

interface ProfessionalDashboardProps {
  currentUser: User;
  posts: JobPost[];
  users: User[];
  messages: ChatMessage[];
  onTakeJob: (postId: string) => void;
  onUpdateProgress: (postId: string, progress: number) => void;
  onProfessionalComplete: (postId: string, rating: number, feedback: string) => void;
  onUpdateUser: (user: User) => void;
  onSendMessage: (jobId: string, text: string) => void;
}

declare const L: any;

const MapView: React.FC<{ latitude: number, longitude: number }> = ({ latitude, longitude }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);

    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current) {
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            });
            
            mapRef.current = L.map(mapContainerRef.current, { zoomControl: false, scrollWheelZoom: false, dragging: false }).setView([latitude, longitude], 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapRef.current);
            L.marker([latitude, longitude]).addTo(mapRef.current);
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [latitude, longitude]);
    
    return <div ref={mapContainerRef} className="h-48 w-full rounded-md" />;
};


const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

const ProfessionalDashboard: React.FC<ProfessionalDashboardProps> = ({ currentUser, posts, users, messages, onTakeJob, onUpdateProgress, onProfessionalComplete, onUpdateUser, onSendMessage }) => {
  const [ratingPost, setRatingPost] = useState<JobPost | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
  const [searchRadius, setSearchRadius] = useState(50); // Default 50km
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [profileData, setProfileData] = useState<User>(currentUser);
  const [saveStatus, setSaveStatus] = useState('');
  const [locationStatus, setLocationStatus] = useState('');
  const [locationSuccess, setLocationSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const professionalLocation = {
    lat: currentUser.latitude,
    lon: currentUser.longitude,
  };

  const availableJobs = posts
    .filter(p =>
      p.status === JobStatus.ACTIVE &&
      (currentUser.specialties?.length ?? 0) > 0 &&
      currentUser.specialties?.includes(p.category)
    )
    .map(job => {
        if (professionalLocation.lat && professionalLocation.lon && job.latitude && job.longitude) {
            const distance = haversineDistance(professionalLocation.lat, professionalLocation.lon, job.latitude, job.longitude);
            return { ...job, distance };
        }
        return { ...job, distance: undefined };
    })
    .filter(job => {
        // Radius of 101 means "any distance"
        if (searchRadius >= 101) {
            return true;
        }
        return job.distance !== undefined && job.distance <= searchRadius;
    })
    .sort((a, b) => {
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        return a.distance - b.distance;
    });
  
  const myJobs = posts.filter(p => p.professionalId === currentUser.id).sort((a,b) => a.status === JobStatus.IN_PROGRESS ? -1 : 1);

  const handleOpenRatingModal = (post: JobPost) => {
    setRatingPost(post);
  };
  
  const handleCloseRatingModal = () => {
    setRatingPost(null);
  };

  const handleRatingSubmit = (rating: number, feedback: string) => {
    if (ratingPost) {
      onProfessionalComplete(ratingPost.id, rating, feedback);
      handleCloseRatingModal();
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoCapture = (imageDataUrl: string) => {
    setProfileData(prev => ({ ...prev, photo: imageDataUrl }));
    setIsCameraOpen(false);
  };
  
  const handleSpecialtyChange = (category: ServiceCategory) => {
    setProfileData(prev => {
      const currentSpecialties = prev.specialties || [];
      const newSpecialties = currentSpecialties.includes(category)
        ? currentSpecialties.filter(s => s !== category)
        : [...currentSpecialties, category];
      return { ...prev, specialties: newSpecialties };
    });
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
          setLocationStatus('¡Ubicación y dirección actualizadas! No olvides guardar.');
          setLocationSuccess(true);
        } catch (error) {
          console.error("Error de geocodificación inversa:", error);
          setProfileData(prev => ({ ...prev, latitude, longitude, address: 'No se pudo obtener la dirección.' }));
          setLocationStatus('Ubicación actualizada, pero no se pudo obtener la dirección.');
          setLocationSuccess(true); // Location was still successful
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
          userNameToRate="el Cliente"
        />
      )}
       <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handlePhotoCapture}
      />
       {selectedJob && (
          <JobDetailModal
            job={selectedJob}
            currentUser={currentUser}
            users={users}
            allMessages={messages}
            onSendMessage={onSendMessage}
            onClose={() => setSelectedJob(null)}
          />
      )}
      <div className="space-y-8">
         <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Panel de Profesional</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1">Encuentra nuevas oportunidades y gestiona tu trabajo actual.</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Mi Perfil</h2>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200">
                <PencilAltIcon className="h-4 w-4 mr-1"/>
                Editar
              </button>
            )}
          </div>
          {saveStatus && !isEditing && <p className="text-sm text-green-600 dark:text-green-400 mb-4">{saveStatus}</p>}
          
          {isEditing ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 flex flex-col items-center space-y-4">
                  {profileData.photo ? (
                    <img src={profileData.photo} alt="Foto de perfil" className="w-32 h-32 rounded-full object-cover shadow-lg" />
                  ) : (
                    <UserCircleIcon className="w-32 h-32 text-slate-300 dark:text-slate-600" />
                  )}
                  <div className="flex space-x-2">
                    <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600" title="Subir foto"><PhotographIcon className="h-5 w-5 text-slate-600 dark:text-slate-300" /></button>
                    <input ref={fileInputRef} type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                    <button onClick={() => setIsCameraOpen(true)} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600" title="Tomar foto"><CameraIcon className="h-5 w-5 text-slate-600 dark:text-slate-300" /></button>
                    {profileData.photo && <button onClick={() => setProfileData(prev => ({...prev, photo: undefined}))} className="p-2 bg-red-100 dark:bg-red-900/50 rounded-full hover:bg-red-200 dark:hover:bg-red-800/50" title="Eliminar foto"><XIcon className="h-5 w-5 text-red-600 dark:text-red-400" /></button>}
                  </div>
                </div>
                <div className="md:col-span-2 space-y-4">
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
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Mis Especialidades</label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Selecciona las categorías de servicios en las que te especializas.</p>
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 border border-slate-200 dark:border-slate-700 p-3 rounded-md">
                      {SERVICE_CATEGORIES.map(category => (
                        <label key={category} className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-150">
                          <input
                            type="checkbox"
                            checked={profileData.specialties?.includes(category) || false}
                            onChange={() => handleSpecialtyChange(category)}
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-slate-900 dark:border-slate-600"
                          />
                          <span className="text-sm text-slate-800 dark:text-slate-200">{category}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Ubicación para Búsqueda</label>
                     <div className="mt-1 flex items-center gap-4">
                       <button type="button" onClick={handleAttachLocation} className="flex items-center justify-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md shadow-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                          <LocationMarkerIcon className="h-5 w-5 mr-2" />
                          Actualizar a mi Ubicación Actual
                      </button>
                      {locationStatus && <p className={`text-sm ${locationSuccess ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}`}>{locationStatus}</p>}
                     </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
                  <button onClick={handleCancelEdit} className="px-4 py-2 text-sm font-medium rounded-md text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-600 hover:bg-slate-200 dark:hover:bg-slate-500">Cancelar</button>
                  <button onClick={handleProfileSave} className="px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">Guardar Cambios</button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 flex flex-col items-center space-y-4">
                {currentUser.photo ? (
                  <img src={currentUser.photo} alt="Foto de perfil" className="w-32 h-32 rounded-full object-cover shadow-lg" />
                ) : (
                  <UserCircleIcon className="w-32 h-32 text-slate-300 dark:text-slate-600" />
                )}
              </div>
              <div className="md:col-span-2 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Nombre Completo</h3>
                   <div className="flex items-center gap-2">
                      <p className="mt-1 text-slate-800 dark:text-white font-semibold text-lg">{currentUser.name}</p>
                      {currentUser.isVerified && <CheckBadgeIcon className="h-6 w-6 text-blue-500" title="Perfil Verificado" />}
                   </div>
                </div>
                <div className="flex items-center">
                  <PhoneIcon className="h-5 w-5 mr-3 text-slate-400" />
                  <p className="text-slate-800 dark:text-white">{currentUser.phone || 'Teléfono no especificado'}</p>
                </div>
                <div className="flex items-start">
                  <LocationMarkerIcon className="h-5 w-5 mr-3 text-slate-400 mt-1 flex-shrink-0" />
                  <p className="text-slate-800 dark:text-white">{currentUser.address || 'Dirección no especificada'}</p>
                </div>
                 {currentUser.latitude && currentUser.longitude && (
                    <div>
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2 mb-2">Mi Área de Operación</h3>
                        <MapView latitude={currentUser.latitude} longitude={currentUser.longitude} />
                    </div>
                  )}
                 <div>
                  <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Especialidades</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {currentUser.specialties && currentUser.specialties.length > 0 ? (
                      currentUser.specialties.map(spec => (
                        <span key={spec} className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                          {spec}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500 dark:text-slate-400">No hay especialidades especificadas.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {myJobs.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Mis Trabajos ({myJobs.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myJobs.map(post => (
                      <JobPostCard key={post.id} post={post} users={users} currentUser={currentUser} hideProgressBar>
                        <div className="space-y-2">
                            <button
                                onClick={() => setSelectedJob(post)}
                                className="w-full inline-flex justify-center py-2 px-4 border border-slate-300 dark:border-slate-500 shadow-sm text-sm font-medium rounded-md text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600"
                            >
                                <ChatAltIcon className="h-5 w-5 mr-2" />
                                Ver Detalles y Chatear
                            </button>
                            {post.status === JobStatus.IN_PROGRESS && (
                              <div className="space-y-4 pt-2">
                                <JobProgressUpdater
                                  postId={post.id}
                                  currentProgress={post.progress || 0}
                                  onUpdate={onUpdateProgress}
                                />
                                 <button
                                    onClick={() => handleOpenRatingModal(post)}
                                    className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                  >
                                    Marcar como Terminado
                                  </button>
                              </div>
                            )}
                        </div>
                      </JobPostCard>
                    ))}
                </div>
            </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Trabajos Disponibles ({availableJobs.length})</h2>
            {currentUser.latitude && currentUser.longitude && (
              <div className="w-full md:max-w-xs">
                <label htmlFor="distance-slider" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Mostrar trabajos dentro de: <span className="font-bold text-indigo-600 dark:text-indigo-400">{searchRadius > 100 ? 'Cualquier distancia' : `${searchRadius} km`}</span>
                </label>
                <input
                    id="distance-slider"
                    type="range"
                    min="1"
                    max="101"
                    step="1"
                    value={searchRadius}
                    onChange={(e) => setSearchRadius(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-600 custom-slider-input"
                />
                 <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span>1km</span>
                    <span>100km+</span>
                </div>
              </div>
            )}
          </div>
          {availableJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableJobs.map(post => (
                <JobPostCard key={post.id} post={post} users={users} currentUser={currentUser} distance={post.distance}>
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
            <p className="text-center text-slate-500 dark:text-slate-400 py-8">
              {(!currentUser.specialties || currentUser.specialties.length === 0)
                ? 'No has seleccionado ninguna especialidad. ¡Añade tus habilidades en tu perfil para ver trabajos disponibles!'
                : 'No hay trabajos disponibles que coincidan con tus especialidades y radio de búsqueda. ¡Intenta ampliar la distancia o vuelve más tarde!'}
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfessionalDashboard;