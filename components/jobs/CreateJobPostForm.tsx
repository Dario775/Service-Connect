
import React, { useState } from 'react';
import { JobPost, ServiceCategory } from '../../types';
import { SERVICE_CATEGORIES } from '../../constants';
import { generateJobDescription } from '../../services/geminiService';
import { SparklesIcon } from '../icons/IconComponents';

interface CreateJobPostFormProps {
  clientId: number;
  onSubmit: (newPost: Omit<JobPost, 'id' | 'status' | 'createdAt'>) => void;
}

const CreateJobPostForm: React.FC<CreateJobPostFormProps> = ({ clientId, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ServiceCategory>(ServiceCategory.OTHER);
  const [isGenerating, setIsGenerating] = useState(false);
  
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
      clientId
    });
    setTitle('');
    setDescription('');
    setCategory(ServiceCategory.OTHER);
  };

  return (
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
        <button type="submit" className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Enviar Solicitud
        </button>
      </form>
    </div>
  );
};

export default CreateJobPostForm;
