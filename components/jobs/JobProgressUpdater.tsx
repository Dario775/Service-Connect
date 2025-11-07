import React, { useState, useEffect } from 'react';

interface JobProgressUpdaterProps {
  postId: number;
  currentProgress: number;
  onUpdate: (postId: number, progress: number) => void;
}

const JobProgressUpdater: React.FC<JobProgressUpdaterProps> = ({ postId, currentProgress, onUpdate }) => {
  const [progress, setProgress] = useState(currentProgress);
  const [isUpdating, setIsUpdating] = useState(false);
  
  useEffect(() => {
    setProgress(currentProgress);
  }, [currentProgress]);

  const handleUpdate = () => {
    setIsUpdating(true);
    // Simula una operación asíncrona para dar feedback al usuario
    setTimeout(() => {
        onUpdate(postId, progress);
        setIsUpdating(false);
    }, 500);
  };

  return (
    <div className="space-y-4 pt-2">
        <label htmlFor={`progress-${postId}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Actualizar Progreso: <span className="font-bold text-indigo-600 dark:text-indigo-400">{progress}%</span>
        </label>
        
        <div className="relative h-6 flex items-center">
            {/* Base Track */}
            <div className="absolute w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg"></div>
            {/* Filled Track */}
            <div 
                className="absolute h-2 bg-indigo-600 rounded-lg" 
                style={{ width: `${progress}%` }}
            ></div>
            {/* Actual Input - transparent and on top */}
            <input
                id={`progress-${postId}`}
                type="range"
                min="0"
                max="100"
                step="5"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="custom-slider-input absolute w-full h-full appearance-none cursor-pointer bg-transparent focus:outline-none"
            />
        </div>

        <button
            onClick={handleUpdate}
            disabled={isUpdating || progress === currentProgress}
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 dark:disabled:bg-indigo-800 disabled:cursor-not-allowed"
        >
            {isUpdating ? 'Actualizando...' : 'Guardar Progreso'}
        </button>
    </div>
  );
};

export default JobProgressUpdater;