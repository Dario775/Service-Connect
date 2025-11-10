import { User, JobPost, Role, JobStatus, ServiceCategory, ChatMessage } from './types';

// NOTA: Estos usuarios son solo para datos de ejemplo. El inicio de sesión ahora se gestiona a través de Firebase Authentication.
export const INITIAL_USERS: User[] = [
  { id: 'admin-01', name: 'Usuario Administrador', role: Role.ADMIN, email: 'admin@example.com' },
  { id: 'client-01', name: 'Alicia Cliente', role: Role.CLIENT, phone: '555-123-4567', address: 'Calle Falsa 123, Springfield', email: 'alicia@example.com' },
  { id: 'client-02', name: 'Roberto Cliente', role: Role.CLIENT, phone: '555-987-6543', address: 'Avenida Siempreviva 742, Shelbyville', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop', email: 'roberto@example.com' },
  { id: 'prof-01', name: 'Carlos Profesional', role: Role.PROFESSIONAL, latitude: 19.4326, longitude: -99.1332, phone: '555-111-2222', address: 'Plaza de la Constitución, Zócalo', specialties: [ServiceCategory.TECH_SUPPORT, ServiceCategory.ELECTRICAL], email: 'carlos@example.com' },
  { id: 'prof-02', name: 'Diana Profesional', role: Role.PROFESSIONAL, latitude: 19.4014, longitude: -99.1661, phone: '555-333-4444', address: 'Av. de los Insurgentes Sur, Condesa', specialties: [ServiceCategory.REFRIGERATION, ServiceCategory.PLUMBING], photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop', email: 'diana@example.com' },
];

export const INITIAL_JOB_POSTS: JobPost[] = [
  {
    id: 'job-1',
    title: 'Grifo que gotea en la cocina',
    description: 'El grifo del fregadero de mi cocina gotea constantemente. Parece ser una fuga lenta pero constante. He intentado apretarlo, pero no ha servido de nada. Necesito a alguien que lo diagnostique y lo repare.',
    category: ServiceCategory.PLUMBING,
    status: JobStatus.PENDING,
    clientId: 'client-01',
    createdAt: new Date('2023-10-26T10:00:00Z'),
    photo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
    latitude: 19.435,
    longitude: -99.140,
  },
  {
    id: 'job-2',
    title: 'Instalar nuevo ventilador de techo',
    description: 'He comprado un nuevo ventilador de techo y necesito un profesional para instalarlo en mi sala de estar. La lámpara anterior ha sido retirada y el cableado está expuesto y listo.',
    category: ServiceCategory.ELECTRICAL,
    status: JobStatus.ACTIVE,
    clientId: 'client-02',
    createdAt: new Date('2023-10-25T14:30:00Z'),
    latitude: 19.395,
    longitude: -99.170,
  },
  {
    id: 'job-3',
    title: 'Computadora funciona muy lento',
    description: 'Mi laptop se ha vuelto extremadamente lenta en las últimas semanas. Tarda mucho en arrancar y las aplicaciones se traban. Busco un experto técnico para optimizar su rendimiento.',
    category: ServiceCategory.TECH_SUPPORT,
    status: JobStatus.IN_PROGRESS,
    clientId: 'client-01',
    professionalId: 'prof-01',
    createdAt: new Date('2023-10-24T09:00:00Z'),
    progress: 25,
    latitude: 19.436,
    longitude: -99.141,
  },
   {
    id: 'job-4',
    title: 'Refrigerador no enfría correctamente',
    description: 'El refrigerador de mi garaje no mantiene una temperatura fría. La parte del congelador funciona bien, pero la sección de la nevera apenas enfría. Es un modelo de hace 5 años.',
    category: ServiceCategory.REFRIGERATION,
    status: JobStatus.COMPLETED,
    clientId: 'client-02',
    professionalId: 'prof-02',
    createdAt: new Date('2023-10-22T11:00:00Z'),
    professionalRating: 5,
    professionalFeedback: "¡Un trabajo excelente! Diana fue muy profesional y solucionó el problema rápidamente.",
    clientRating: 4,
    clientFeedback: "Roberto fue muy amable y claro con la comunicación. Recomendado.",
    latitude: 19.394,
    longitude: -99.171,
  },
];

export const INITIAL_MESSAGES: ChatMessage[] = [
    {
        id: 'msg-1',
        jobId: 'job-3', // The IN_PROGRESS job
        senderId: 'prof-01', // Carlos
        text: 'Hola Alicia, he revisado tu laptop. Parece ser un problema de software y algo de polvo en los ventiladores. Debería tenerlo listo para mañana.',
        timestamp: new Date(new Date('2023-10-24T10:00:00Z')),
    },
    {
        id: 'msg-2',
        jobId: 'job-3',
        senderId: 'client-01', // Alicia
        text: '¡Genial! Muchas gracias por la rápida actualización, Carlos. ¿A qué hora crees que podrías pasar?',
        timestamp: new Date(new Date('2023-10-24T10:05:00Z')),
    }
];

export const SERVICE_CATEGORIES: ServiceCategory[] = Object.values(ServiceCategory);