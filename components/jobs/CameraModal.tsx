import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CameraIcon } from '../icons/IconComponents';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const cleanupStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    if (isOpen) {
      const startCamera = async () => {
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
          });
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        } catch (err) {
          console.error("Error accessing camera:", err);
          setError("No se pudo acceder a la cámara. Asegúrate de haber otorgado los permisos necesarios.");
        }
      };
      startCamera();
    } else {
      cleanupStream();
    }
    // Cleanup on component unmount
    return cleanupStream;
  }, [isOpen, cleanupStream]);


  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        onCapture(dataUrl);
        handleClose();
      }
    }
  };

  const handleClose = () => {
    cleanupStream();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl p-4 relative">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Tomar Foto</h2>
        <div className="relative bg-black rounded-md overflow-hidden">
          {error ? (
            <div className="aspect-video flex items-center justify-center text-red-500 p-4">{error}</div>
          ) : (
            <video ref={videoRef} autoPlay playsInline className="w-full h-full" />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>
        <div className="mt-4 flex justify-between items-center">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleCapture}
            disabled={!stream}
            className="p-4 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 disabled:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <CameraIcon className="h-8 w-8" />
          </button>
          <div className="w-24"></div> {/* Spacer */}
        </div>
      </div>
    </div>
  );
};

export default CameraModal;