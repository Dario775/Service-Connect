export enum Role {
  CLIENT = 'Cliente',
  PROFESSIONAL = 'Profesional',
  ADMIN = 'Administrador'
}

export enum JobStatus {
  PENDING = 'Pendiente de Aprobación',
  ACTIVE = 'Activo',
  IN_PROGRESS = 'En Progreso',
  AWAITING_CLIENT_VALIDATION = 'Esperando Validación del Cliente',
  AWAITING_ADMIN_FINALIZATION = 'Esperando Finalización del Admin',
  COMPLETED = 'Completado',
  REJECTED = 'Rechazado',
  CANCELLED = 'Cancelado'
}

export enum ServiceCategory {
  PLUMBING = 'Plomería',
  ELECTRICAL = 'Electricidad',
  REFRIGERATION = 'Refrigeración',
  TECH_SUPPORT = 'Soporte Técnico',
  CARPENTRY = 'Carpintería',
  CLEANING = 'Limpieza',
  OTHER = 'Otro'
}

export interface User {
  id: number;
  name: string;
  role: Role;
  phone?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  photo?: string;
  specialties?: ServiceCategory[];
}

export interface JobPost {
  id: number;
  title: string;
  description: string;
  category: ServiceCategory;
  status: JobStatus;
  clientId: number;
  professionalId?: number;
  createdAt: Date;
  progress?: number;
  professionalRating?: number;
  professionalFeedback?: string;
  clientRating?: number;
  clientFeedback?: string;
  photo?: string;
  latitude?: number;
  longitude?: number;
}