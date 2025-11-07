import React from 'react';
import { JobPost } from '../../types';
import { USERS } from '../../constants';
import { StarIcon } from '../icons/IconComponents';

interface TestimonialCardProps {
  post: JobPost;
}

const RatingDisplay: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex items-center justify-center">
        {[...Array(5)].map((_, i) => (
            <StarIcon key={i} className="h-5 w-5 text-yellow-400" filled={i < rating} />
        ))}
    </div>
);

const TestimonialCard: React.FC<TestimonialCardProps> = ({ post }) => {
  const client = USERS.find(u => u.id === post.clientId);
  const professional = USERS.find(u => u.id === post.professionalId);

  return (
    <div className="text-center max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        {/* Client's Feedback */}
        <div className="flex flex-col">
          <h4 className="font-bold text-sm uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">Opinión del Cliente</h4>
          <div className="flex-grow">
            <RatingDisplay rating={post.professionalRating || 0} />
            <blockquote className="italic text-slate-600 dark:text-slate-300 mt-2 text-base">
              "{post.professionalFeedback || 'Sin comentarios.'}"
            </blockquote>
          </div>
          <footer className="font-semibold text-slate-800 dark:text-white mt-3 text-sm">
            - {client?.name}
          </footer>
        </div>

        {/* Professional's Feedback */}
        <div className="flex flex-col">
          <h4 className="font-bold text-sm uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">Opinión del Profesional</h4>
          <div className="flex-grow">
            <RatingDisplay rating={post.clientRating || 0} />
            <blockquote className="italic text-slate-600 dark:text-slate-300 mt-2 text-base">
              "{post.clientFeedback || 'Sin comentarios.'}"
            </blockquote>
          </div>
          <footer className="font-semibold text-slate-800 dark:text-white mt-3 text-sm">
            - {professional?.name}
          </footer>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;