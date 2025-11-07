import React, { useState } from 'react';
import { StarIcon } from '../icons/IconComponents';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, feedback: string) => void;
  userNameToRate: string;
}

const RatingModal: React.FC<RatingModalProps> = ({ isOpen, onClose, onSubmit, userNameToRate }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Por favor, selecciona una calificación.');
      return;
    }
    onSubmit(rating, feedback);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-6 animate-fade-in-up">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Calificar a {userNameToRate}</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Calificación (de 1 a 5 estrellas)</label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <StarIcon
                      className={`h-8 w-8 transition-colors ${
                        (hoverRating || rating) >= star ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600'
                      }`}
                      filled={(hoverRating || rating) >= star}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="feedback" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Reseña (opcional)</label>
              <textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-slate-800 dark:text-slate-200"
                placeholder={`Deja un comentario sobre tu experiencia con ${userNameToRate}...`}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Enviar Calificación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;