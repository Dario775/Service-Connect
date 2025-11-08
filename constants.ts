import { User, JobPost, Role, JobStatus, ServiceCategory } from './types';

export const INITIAL_USERS: User[] = [
  { id: 1, name: 'Usuario Administrador', role: Role.ADMIN },
  { id: 2, name: 'Alicia Cliente', role: Role.CLIENT, phone: '555-123-4567', address: 'Calle Falsa 123, Springfield' },
  { id: 3, name: 'Roberto Cliente', role: Role.CLIENT, phone: '555-987-6543', address: 'Avenida Siempreviva 742, Shelbyville', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop' },
  { id: 4, name: 'Carlos Profesional', role: Role.PROFESSIONAL, latitude: 19.4326, longitude: -99.1332, phone: '555-111-2222', address: 'Plaza de la Constitución, Zócalo', specialties: [ServiceCategory.TECH_SUPPORT, ServiceCategory.ELECTRICAL] },
  { id: 5, name: 'Diana Profesional', role: Role.PROFESSIONAL, latitude: 19.4014, longitude: -99.1661, phone: '555-333-4444', address: 'Av. de los Insurgentes Sur, Condesa', specialties: [ServiceCategory.REFRIGERATION, ServiceCategory.PLUMBING], photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop' },
];

export const INITIAL_JOB_POSTS: JobPost[] = [
  {
    id: 1,
    title: 'Grifo que gotea en la cocina',
    description: 'El grifo del fregadero de mi cocina gotea constantemente. Parece ser una fuga lenta pero constante. He intentado apretarlo, pero no ha servido de nada. Necesito a alguien que lo diagnostique y lo repare.',
    category: ServiceCategory.PLUMBING,
    status: JobStatus.PENDING,
    clientId: 2,
    createdAt: new Date('2023-10-26T10:00:00Z'),
    // FIX: The original base64 string was corrupted and unterminated, causing a syntax error.
    // Replaced with a small, valid placeholder image to correct the object literal.
    photo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
    latitude: 19.435,
    longitude: -99.140,
  },
  {
    id: 2,
    title: 'Instalar nuevo ventilador de techo',
    description: 'He comprado un nuevo ventilador de techo y necesito un profesional para instalarlo en mi sala de estar. La lámpara anterior ha sido retirada y el cableado está expuesto y listo.',
    category: ServiceCategory.ELECTRICAL,
    status: JobStatus.ACTIVE,
    clientId: 3,
    createdAt: new Date('2023-10-25T14:30:00Z'),
    latitude: 19.395,
    longitude: -99.170,
  },
  {
    id: 3,
    title: 'Computadora funciona muy lento',
    description: 'Mi laptop se ha vuelto extremadamente lenta en las últimas semanas. Tarda mucho en arrancar y las aplicaciones se traban. Busco un experto técnico para optimizar su rendimiento.',
    category: ServiceCategory.TECH_SUPPORT,
    status: JobStatus.IN_PROGRESS,
    clientId: 2,
    professionalId: 4,
    createdAt: new Date('2023-10-24T09:00:00Z'),
    progress: 25,
    latitude: 19.436,
    longitude: -99.141,
  },
   {
    id: 4,
    title: 'Refrigerador no enfría correctamente',
    description: 'El refrigerador de mi garaje no mantiene una temperatura fría. La parte del congelador funciona bien, pero la sección de la nevera apenas enfría. Es un modelo de hace 5 años.',
    category: ServiceCategory.REFRIGERATION,
    status: JobStatus.COMPLETED,
    clientId: 3,
    professionalId: 5,
    createdAt: new Date('2023-10-22T11:00:00Z'),
    professionalRating: 5,
    professionalFeedback: "¡Un trabajo excelente! Diana fue muy profesional y solucionó el problema rápidamente.",
    clientRating: 4,
    clientFeedback: "Roberto fue muy amable y claro con la comunicación. Recomendado.",
    latitude: 19.394,
    longitude: -99.171,
  },
];

export const SERVICE_CATEGORIES: ServiceCategory[] = Object.values(ServiceCategory);