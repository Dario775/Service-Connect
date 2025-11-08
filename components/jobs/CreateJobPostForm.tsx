import React, { useState, useRef } from 'react';
import { JobPost, ServiceCategory } from '../../types';
import { SERVICE_CATEGORIES } from '../../constants';
import { generateJobDescription } from '../../services/geminiService';
import { SparklesIcon, CameraIcon, PhotographIcon, XIcon, LocationMarkerIcon } from '../icons/IconComponents';
import CameraModal from './CameraModal';

interface CreateJobPostFormProps {
  clientId: number;
  onSubmit: (newPost: Omit<JobPost, 'id' | 'status' | 'createdAt'>) => void;
}

const CreateJobPostForm: React.FC<CreateJobPostFormProps> = ({ clientId, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ServiceCategory>(ServiceCategory.OTHER);
  const [isGenerating, setIsGenerating] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerateDescription = async () => {
    if (!title) {
        alert("Por favor, ingresa un título primero.");
        return;
    }
    setIsGenerating(true);
    const generatedDesc = await generateJobDescription(title, category);
    setDescription(generatedDesc);
    setIsGenerating(false);
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoCapture = (imageDataUrl: string) => {
    setPhoto(imageDataUrl);
    setIsCameraOpen(false);
  };
  
  const handleAttachLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('La geolocalización no es compatible con tu navegador.');
      return;
    }
    setLocationStatus('Obteniendo ubicación...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lon: longitude });
        setLocationStatus(`Ubicación añadida correctamente.`);
      },
      () => {
        setLocationStatus('No se pudo obtener la ubicación. Comprueba los permisos.');
      },
      { timeout: 10000 }
    );
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory(ServiceCategory.OTHER);
    setPhoto(null);
    setLocation(null);
    setLocationStatus('');
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      alert('Por favor, completa todos los campos.');
      return;
    }
    onSubmit({
      title,
      description,
      category,
      clientId,
      photo: photo || undefined,
      latitude: location?.lat,
      longitude: location?.lon
    });
    resetForm();
  };

  return (
    <>
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handlePhotoCapture}
      />
      <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Crear Nueva Solicitud</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Título</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-800 dark:text-slate-200"
              placeholder="Ej: Arreglar grifo de la cocina"
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Categoría</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ServiceCategory)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-slate-800 dark:text-slate-200"
            >
              {SERVICE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
              <div className="flex justify-between items-center">
                  <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Descripción</label>
                   <button type="button" onClick={handleGenerateDescription} disabled={isGenerating || !title} className="flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed">
                      <SparklesIcon className={`h-5 w-5 mr-1 ${isGenerating ? 'animate-spin' : ''}`} />
                      {isGenerating ? 'Generando...' : 'Generar con IA'}
                  </button>
              </div>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-800 dark:text-slate-200"
              placeholder="Describe el problema en detalle..."
            />
          </div>
          
          {/* Location Section */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Ubicación del Trabajo (Opcional)</label>
            <div className="mt-2 flex items-center gap-4">
              <button
                type="button"
                onClick={handleAttachLocation}
                className="flex items-center justify-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md shadow-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600"
              >
                <LocationMarkerIcon className="h-5 w-5 mr-2" />
                Usar mi Ubicación Actual
              </button>
              {locationStatus && <p className={`text-sm ${location ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'}`}>{locationStatus}</p>}
            </div>
          </div>
          
          {/* Photo Upload Section */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Foto del Problema (Opcional)</label>
            <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {photo ? (
                  <div className="relative group">
                    <img src={photo} alt="Vista previa" className="mx-auto h-32 w-auto rounded-md object-cover"/>
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setPhoto(null)} className="p-2 bg-red-600 rounded-full text-white hover:bg-red-700">
                        <XIcon className="h-6 w-6"/>
                      </button>
                    </div>
                  </div>
                ) : (
                  <PhotographIcon className="mx-auto h-12 w-12 text-slate-400" />
                )}
                
                <div className="flex text-sm text-slate-600 dark:text-slate-400 justify-center gap-4 mt-2">
                   <button type="button" onClick={() => fileInputRef.current?.click()} className="relative cursor-pointer bg-white dark:bg-slate-700 rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 px-3 py-1 border border-slate-300 dark:border-slate-600">
                      <span>Subir Foto</span>
                    </button>
                    <input ref={fileInputRef} id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                    <button type="button" onClick={() => setIsCameraOpen(true)} className="flex items-center relative cursor-pointer bg-white dark:bg-slate-700 rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 px-3 py-1 border border-slate-300 dark:border-slate-600">
                        <CameraIcon className="h-5 w-5 mr-2" />
                        <span>Tomar Foto</span>
                    </button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-500">PNG, JPG, GIF hasta 10MB</p>
              </div>
            </div>
          </div>


          <button type="submit" className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Enviar Solicitud
          </button>
        </form>
      </div>
    </>
  );
};

export default CreateJobPostForm;