import React from 'react';
import { JobPost, User, ChatMessage, Role } from '../../types';
import { XIcon, UserCircleIcon, BriefcaseIcon } from '../icons/IconComponents';
import ChatInterface from '../chat/ChatInterface';

interface JobDetailModalProps {
  job: JobPost;
  currentUser: User;
  users: User[];
  allMessages: ChatMessage[];
  onSendMessage: (jobId: string, text: string) => void;
  onClose: () => void;
}

const JobDetailModal: React.FC<JobDetailModalProps> = ({ job, currentUser, users, allMessages, onSendMessage, onClose }) => {
  const otherUserId = currentUser.role === Role.CLIENT ? job.professionalId : job.clientId;
  const otherUser = users.find(u => u.id === otherUserId);
  const client = users.find(u => u.id === job.clientId);

  const messagesForJob = allMessages
    .filter(m => m.jobId === job.id)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  const handleSendMessage = (text: string) => {
    onSendMessage(job.id, text);
  };
  
  const RoleIcon: React.FC<{ role: Role | undefined, className: string }> = ({ role, className }) => {
    switch (role) {
      case Role.CLIENT: return <UserCircleIcon className={className} />;
      case Role.PROFESSIONAL: return <BriefcaseIcon className={className} />;
      default: return null;
    }
  };


  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] max-h-[700px] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white truncate pr-4">{job.title}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Chat con {otherUser?.name || 'Usuario'}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 flex-grow overflow-hidden">
            {/* Job Details Panel */}
            <div className="md:col-span-1 p-4 overflow-y-auto border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hidden md:block">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">Detalles del Trabajo</h3>
                <div className="space-y-4 text-sm">
                    <div>
                        <h4 className="font-semibold text-slate-600 dark:text-slate-400">Categoría</h4>
                        <p className="text-slate-800 dark:text-slate-200">{job.category}</p>
                    </div>
                     <div>
                        <h4 className="font-semibold text-slate-600 dark:text-slate-400">Descripción</h4>
                        <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{job.description}</p>
                    </div>
                    {client && (
                        <div>
                            <h4 className="font-semibold text-slate-600 dark:text-slate-400 mb-2">Participantes</h4>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <RoleIcon role={client.role} className="h-5 w-5 text-indigo-500"/>
                                    <span className="font-medium text-slate-800 dark:text-slate-200">{client.name}</span>
                                    <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200">Cliente</span>
                                </div>
                                {otherUser && (
                                    <div className="flex items-center gap-2">
                                        <RoleIcon role={otherUser.role} className="h-5 w-5 text-indigo-500"/>
                                        <span className="font-medium text-slate-800 dark:text-slate-200">{otherUser.name}</span>
                                        <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200">Profesional</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Panel */}
            <div className="md:col-span-2 flex flex-col h-full">
                <ChatInterface
                    messages={messagesForJob}
                    currentUser={currentUser}
                    users={users}
                    onSendMessage={handleSendMessage}
                />
            </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailModal;
