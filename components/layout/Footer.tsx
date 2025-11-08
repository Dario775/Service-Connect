import React, { useState, useEffect } from 'react';
import { JobPost, User } from '../../types';
import TestimonialCard from '../home/TestimonialCard';

interface FooterProps {
  completedJobs: JobPost[];
  users: User[];
}

const Footer: React.FC<FooterProps> = ({ completedJobs, users }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (completedJobs.length <= 1) return;

    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % completedJobs.length);
        setIsFading(false);
      }, 500); // Duration of the fade-out transition
    }, 5000); // Change testimonial every 5 seconds

    return () => clearInterval(interval);
  }, [completedJobs.length]);

  const currentJob = completedJobs[currentIndex];

  return (
    <footer className="bg-slate-200 dark:bg-slate-900/50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {completedJobs.length > 0 && currentJob && (
          <div className="mb-8 min-h-[220px] flex items-center justify-center">
            <div className={`transition-opacity duration-500 ease-in-out w-full ${isFading ? 'opacity-0' : 'opacity-100'}`}>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Historias de Éxito</h3>
              <TestimonialCard post={currentJob} users={users} />
            </div>
          </div>
        )}
        <div className="mt-8 border-t border-slate-300 dark:border-slate-700 pt-8">
            <p className="text-sm text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} Service Connect. Todos los derechos reservados.
            </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;