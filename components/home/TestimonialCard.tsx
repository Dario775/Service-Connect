import React from 'react';
import { JobPost, User } from '../../types';
import { StarIcon, UserCircleIcon, CheckBadgeIcon } from '../icons/IconComponents';

interface TestimonialCardProps {
  post: JobPost;
  users: User[];
}

const RatingDisplay: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex items-center justify-center">
        {[...Array(5)].map((_, i) => (
            <StarIcon key={i} className="h-5 w-5 text-yellow-400" filled={i < rating} />
        ))}
    </div>
);

const TestimonialCard: React.FC<TestimonialCardProps> = ({ post, users }) => {
  const client = users.find(u => u.id === post.clientId);
  const professional = users.find(u => u.id === post.professionalId);

  const UserAvatar: React.FC<{ user?: User }> = ({ user }) => {
    if (user?.photo) {
      return <img src={user.photo} alt={user.name} className="w-16 h-16 rounded-full object-cover mx-auto mb-4 shadow-md" />;
    }
    return <UserCircleIcon className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />;
  };

  return (
    <div className="text-center max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        {/* Client's Feedback */}
        <div className="flex flex-col">
          <UserAvatar user={client} />
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
          <UserAvatar user={professional} />
          <h4 className="font-bold text-sm uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">Opinión del Profesional</h4>
          <div className="flex-grow">
            <RatingDisplay rating={post.clientRating || 0} />
            <blockquote className="italic text-slate-600 dark:text-slate-300 mt-2 text-base">
              "{post.clientFeedback || 'Sin comentarios.'}"
            </blockquote>
          </div>
          <footer className="font-semibold text-slate-800 dark:text-white mt-3 text-sm flex items-center justify-center gap-2">
            <span>- {professional?.name}</span>
            {professional?.isVerified && <CheckBadgeIcon className="h-5 w-5 text-blue-500" title="Profesional Verificado" />}
          </footer>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;