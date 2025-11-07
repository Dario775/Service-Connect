import { User, JobPost, Role, JobStatus, ServiceCategory } from './types';

export const USERS: User[] = [
  { id: 1, name: 'Usuario Administrador', role: Role.ADMIN },
  { id: 2, name: 'Alicia Cliente', role: Role.CLIENT, phone: '555-123-4567', address: 'Calle Falsa 123, Springfield' },
  { id: 3, name: 'Roberto Cliente', role: Role.CLIENT, phone: '555-987-6543', address: 'Avenida Siempreviva 742, Shelbyville' },
  { id: 4, name: 'Carlos Profesional', role: Role.PROFESSIONAL },
  { id: 5, name: 'Diana Profesional', role: Role.PROFESSIONAL },
];

export const JOB_POSTS: JobPost[] = [
  {
    id: 1,
    title: 'Grifo que gotea en la cocina',
    description: 'El grifo del fregadero de mi cocina gotea constantemente. Parece ser una fuga lenta pero constante. He intentado apretarlo, pero no ha servido de nada. Necesito a alguien que lo diagnostique y lo repare.',
    category: ServiceCategory.PLUMBING,
    status: JobStatus.PENDING,
    clientId: 2,
    createdAt: new Date('2023-10-26T10:00:00Z'),
  },
  {
    id: 2,
    title: 'Instalar nuevo ventilador de techo',
    description: 'He comprado un nuevo ventilador de techo y necesito un profesional para instalarlo en mi sala de estar. La lámpara anterior ha sido retirada y el cableado está expuesto y listo.',
    category: ServiceCategory.ELECTRICAL,
    status: JobStatus.ACTIVE,
    clientId: 3,
    createdAt: new Date('2023-10-25T14:30:00Z'),
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
  },
];

export const SERVICE_CATEGORIES: ServiceCategory[] = Object.values(ServiceCategory);
