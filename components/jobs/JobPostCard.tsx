import React, { useState, useEffect, useRef } from 'react';
import { JobPost, JobStatus, User, JobPriority } from '../../types';
import { StarIcon, LocationMarkerIcon, FireIcon, CalendarIcon, MapIcon, XIcon } from '../icons/IconComponents';
import PhotoViewerModal from './PhotoViewerModal';

interface JobPostCardProps {
  post: JobPost;
  users: User[];
  currentUser?: User | null;
  children?: React.ReactNode;
  hideProgressBar?: boolean;
  distance?: number;
}

declare const L: any;

const MapModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  lat: number;
  lon: number;
  title: string;
}> = ({ isOpen, onClose, lat, lon, title }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);

    useEffect(() => {
        if (!isOpen) return;

        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        const initializeMap = () => {
          if (mapContainerRef.current && !mapRef.current) {
              mapRef.current = L.map(mapContainerRef.current).setView([lat, lon], 14);
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              }).addTo(mapRef.current);
              L.marker([lat, lon]).addTo(mapRef.current)
                .bindPopup(`Ubicación aproximada para:<br><b>${title}</b>`)
                .openPopup();
          }
        };

        const timeoutId = setTimeout(initializeMap, 100);

        return () => {
            clearTimeout(timeoutId);
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [isOpen, lat, lon, title]);
    
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-2xl h-[60vh]" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">Ubicación del Trabajo</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                        <XIcon className="h-6 w-6 text-slate-600 dark:text-slate-300"/>
                    </button>
                </div>
                <div ref={mapContainerRef} className="w-full h-[calc(60vh-65px)] rounded-b-lg" />
            </div>
        </div>
    );
};

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

const PriorityDisplay: React.FC<{ priority: JobPriority, dueDate?: Date }> = ({ priority, dueDate }) => {
    if (priority === JobPriority.URGENT) {
        return (
            <div className="flex items-center text-sm text-red-600 dark:text-red-400 font-semibold">
                <FireIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
                <span>Urgente</span>
            </div>
        );
    }
    if (priority === JobPriority.SCHEDULED && dueDate) {
        return (
            <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                <CalendarIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
                <span>{new Date(dueDate).toLocaleDateString()}</span>
            </div>
        );
    }
    return null;
};


const JobPostCard: React.FC<JobPostCardProps> = ({ post, users, children, hideProgressBar = false, distance }) => {
  const client = users.find(u => u.id === post.clientId);
  const professional = users.find(u => u.id === post.professionalId);
  const [isPhotoViewerOpen, setIsPhotoViewerOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

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
      {post.latitude && post.longitude && (
        <MapModal
            isOpen={isMapModalOpen}
            onClose={() => setIsMapModalOpen(false)}
            lat={post.latitude}
            lon={post.longitude}
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
          <div className="flex justify-between items-center mt-1">
            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{post.category}</p>
            <PriorityDisplay priority={post.priority} dueDate={post.dueDate} />
          </div>
          
          <div className="flex items-center justify-between mt-2 text-sm text-slate-500 dark:text-slate-400">
              {distance !== undefined ? (
                  <div className="flex items-center">
                      <LocationMarkerIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
                      <span>Aprox. {distance.toFixed(1)} km de distancia</span>
                  </div>
              ) : <div />}
              
              {post.latitude && post.longitude && (
                  <button
                      onClick={() => setIsMapModalOpen(true)}
                      className="flex items-center font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                      <MapIcon className="h-4 w-4 mr-1" />
                      Ver Mapa
                  </button>
              )}
          </div>

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