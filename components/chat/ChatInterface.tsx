import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, User } from '../../types';
import { PaperAirplaneIcon } from '../icons/IconComponents';

interface ChatInterfaceProps {
    messages: ChatMessage[];
    currentUser: User;
    users: User[];
    onSendMessage: (text: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, currentUser, users, onSendMessage }) => {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;
        onSendMessage(newMessage.trim());
        setNewMessage('');
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-100 dark:bg-slate-900/50 rounded-t-lg">
                {messages.map((msg, index) => {
                    const sender = users.find(u => u.id === msg.senderId);
                    const isCurrentUser = msg.senderId === currentUser.id;

                    return (
                        <div key={msg.id} className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                            {!isCurrentUser && (
                                <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-600 flex-shrink-0">
                                    {sender?.photo && <img src={sender.photo} alt={sender.name} className="w-full h-full rounded-full object-cover" />}
                                </div>
                            )}
                            <div className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg ${isCurrentUser ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200'}`}>
                                <p className="text-sm">{msg.text}</p>
                                <p className={`text-xs mt-1 ${isCurrentUser ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500'} text-right`}>
                                    {formatTime(msg.timestamp)}
                                </p>
                            </div>
                             {isCurrentUser && (
                                <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-600 flex-shrink-0">
                                    {currentUser?.photo && <img src={currentUser.photo} alt={currentUser.name} className="w-full h-full rounded-full object-cover" />}
                                </div>
                            )}
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 rounded-b-lg">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        className="flex-grow block w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-full shadow-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        autoComplete="off"
                    />
                    <button
                        type="submit"
                        className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        disabled={!newMessage.trim()}
                    >
                        <PaperAirplaneIcon className="h-5 w-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatInterface;
