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

export enum JobPriority {
  NORMAL = 'Normal',
  URGENT = 'Urgente',
  SCHEDULED = 'Programado'
}


export interface User {
  id: string; // Changed to string to accommodate Firebase UID
  name: string;
  role: Role;
  phone?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  photo?: string;
  specialties?: ServiceCategory[];
  email?: string; // Added email for authentication
  isVerified?: boolean;
}

export interface JobPost {
  id: string; // Changed to string for consistency
  title: string;
  description: string;
  category: ServiceCategory;
  status: JobStatus;
  clientId: string; // Changed to string
  professionalId?: string; // Changed to string
  createdAt: Date;
  priority: JobPriority;
  dueDate?: Date;
  progress?: number;
  professionalRating?: number;
  professionalFeedback?: string;
  clientRating?: number;
  clientFeedback?: string;
  photo?: string;
  latitude?: number;
  longitude?: number;
}

export interface ChatMessage {
  id: string;
  jobId: string;
  senderId: string;
  text: string;
  timestamp: Date;
}