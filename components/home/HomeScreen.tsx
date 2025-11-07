import React from 'react';
import { JobPost } from '../../types';
import JobPostCard from '../jobs/JobPostCard';
import { PencilAltIcon, UsersIcon, CheckCircleIcon } from '../icons/IconComponents';
import Footer from '../layout/Footer';

interface HomeScreenProps {
  activeJobs: JobPost[];
  completedJobs: JobPost[];
  onNavigateToLogin: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ activeJobs, completedJobs, onNavigateToLogin }) => {

  const handleScrollToJobs = () => {
    document.getElementById('available-jobs')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      {/* Hero Section with Animated Background */}
      <section className="hero-section">
        <div className="slide slide1"></div>
        <div className="slide slide2"></div>
        <div className="slide slide3"></div>
        <div className="hero-content max-w-7xl mx-auto py-24 sm:py-32 px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl">
            Encuentra ayuda. Ofrece tu talento. Soluciona.
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-slate-200">
            La plataforma que conecta tus necesidades con profesionales de confianza de forma rápida y segura.
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <button
              onClick={onNavigateToLogin}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Publicar un Trabajo
            </button>
            <button
              onClick={handleScrollToJobs}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:text-indigo-900 dark:bg-white dark:hover:bg-slate-200"
            >
              Ver Trabajos Disponibles
            </button>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">¿Cómo Funciona?</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-500 dark:text-slate-400">
              Conectarse es más fácil que nunca. Sigue estos tres simples pasos.
            </p>
          </div>
          <div className="mt-12 grid gap-10 lg:grid-cols-3">
            <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
              <PencilAltIcon className="mx-auto h-12 w-12 text-indigo-500" />
              <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">1. Publica</h3>
              <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
                Describe el servicio que necesitas. Es rápido, fácil y completamente gratis.
              </p>
            </div>
            <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
              <UsersIcon className="mx-auto h-12 w-12 text-indigo-500" />
              <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">2. Conecta</h3>
              <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
                Profesionales calificados verán tu solicitud y se pondrán en contacto.
              </p>
            </div>
            <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
              <CheckCircleIcon className="mx-auto h-12 w-12 text-indigo-500" />
              <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">3. Soluciona</h3>
              <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
                Elige al mejor profesional para el trabajo y ve cómo tu problema se resuelve.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Available Jobs Section */}
      <section id="available-jobs" className="py-20 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Últimas Solicitudes de Servicio</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-500 dark:text-slate-400">
              Estas son algunas de las oportunidades disponibles ahora mismo. ¡Únete para aplicar!
            </p>
          </div>
          {activeJobs.length > 0 ? (
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {activeJobs.map(job => (
                <JobPostCard key={job.id} post={job} />
              ))}
            </div>
          ) : (
            <div className="mt-12 text-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 p-12 rounded-lg">
              <p>No hay trabajos disponibles en este momento. ¡Vuelve más tarde!</p>
            </div>
          )}
        </div>
      </section>

      <Footer completedJobs={completedJobs} />
    </div>
  );
};

export default HomeScreen;