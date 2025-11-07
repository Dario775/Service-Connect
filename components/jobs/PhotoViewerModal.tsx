import React, { useState } from 'react';
import { XIcon, ZoomInIcon, ZoomOutIcon } from '../icons/IconComponents';

interface PhotoViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoSrc: string;
  title: string;
}

const PhotoViewerModal: React.FC<PhotoViewerModalProps> = ({ isOpen, onClose, photoSrc, title }) => {
  const [zoom, setZoom] = useState(1);
  
  if (!isOpen) return null;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3)); // Max zoom 300%
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5)); // Min zoom 50%

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the modal content
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white truncate pr-4">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex-grow p-4 overflow-auto flex items-center justify-center">
          <img 
            src={photoSrc} 
            alt={`Foto para ${title}`} 
            className="transition-transform duration-200 ease-in-out rounded-md"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }} 
          />
        </div>

        <div className="flex justify-center items-center p-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
          <button onClick={handleZoomOut} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50" disabled={zoom <= 0.5}>
            <ZoomOutIcon className="h-6 w-6 text-slate-700 dark:text-slate-200" />
          </button>
          <span className="w-20 text-center font-semibold text-slate-700 dark:text-slate-200">{Math.round(zoom * 100)}%</span>
          <button onClick={handleZoomIn} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50" disabled={zoom >= 3}>
            <ZoomInIcon className="h-6 w-6 text-slate-700 dark:text-slate-200" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotoViewerModal;