// Enums
export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  AGENT = 'agent',
  VIEWER = 'viewer',
}

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  WAITING = 'waiting',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum ChannelType {
  WHATSAPP_CLOUD = 'whatsapp_cloud',
  WHATSAPP_BAILEYS = 'whatsapp_baileys',
  TELEGRAM = 'telegram',
  INSTAGRAM = 'instagram',
  EMAIL = 'email',
}

export enum ChannelStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  CONNECTING = 'connecting',
  ERROR = 'error',
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  DOCUMENT = 'document',
  LOCATION = 'location',
  CONTACT = 'contact',
}

export enum MessageDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
}

// Interfaces base
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantEntity extends BaseEntity {
  companyId: string;
}

// Entidades principais
export interface Company extends BaseEntity {
  name: string;
  domain?: string;
  settings: CompanySettings;
  isActive: boolean;
}

export interface CompanySettings {
  timezone: string;
  language: string;
  businessHours: BusinessHours;
  autoAssignment: boolean;
  slaHours: number;
}

export interface BusinessHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isOpen: boolean;
  openTime?: string; // HH:mm
  closeTime?: string; // HH:mm
}

export interface User extends TenantEntity {
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  notifications: NotificationSettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
}

export interface ApiKey extends TenantEntity {
  name: string;
  key: string;
  permissions: string[];
  expiresAt?: Date;
  lastUsedAt?: Date;
}

export interface Contact extends TenantEntity {
  externalId: string;
  channelId: string;
  name: string;
  phone?: string;
  email?: string;
  avatar?: string;
  metadata: Record<string, any>;
  tags: string[];
  isActive: boolean;
}

export interface Channel extends TenantEntity {
  name: string;
  type: ChannelType;
  status: ChannelStatus;
  config: ChannelConfig;
  metadata: Record<string, any>;
  lastActivityAt?: Date;
}

export interface ChannelConfig {
  credentials: Record<string, any>;
  webhookUrl?: string;
  settings: Record<string, any>;
}

export interface Ticket extends TenantEntity {
  externalId: string;
  channelId: string;
  contactId: string;
  assignedToId?: string;
  status: TicketStatus;
  priority: TicketPriority;
  subject: string;
  tags: string[];
  metadata: Record<string, any>;
  resolvedAt?: Date;
  closedAt?: Date;
  slaDueAt?: Date;
}

export interface Message extends TenantEntity {
  ticketId: string;
  channelId: string;
  contactId: string;
  userId?: string;
  type: MessageType;
  direction: MessageDirection;
  content: string;
  mediaUrl?: string;
  mediaType?: string;
  mediaSize?: number;
  metadata: Record<string, any>;
  deliveredAt?: Date;
  readAt?: Date;
  dedupKey?: string;
}

// DTOs para validação
export const companySchema = {
  name: 'string',
  domain: 'string?',
  settings: 'object',
  isActive: 'boolean',
};

export const userSchema = {
  email: 'string',
  name: 'string',
  role: 'string',
  avatar: 'string?',
  isActive: 'boolean',
  preferences: 'object',
};

export const ticketSchema = {
  externalId: 'string',
  channelId: 'string',
  contactId: 'string',
  assignedToId: 'string?',
  status: 'string',
  priority: 'string',
  subject: 'string',
  tags: 'array',
  metadata: 'object',
};

export const messageSchema = {
  ticketId: 'string',
  channelId: 'string',
  contactId: 'string',
  userId: 'string?',
  type: 'string',
  direction: 'string',
  content: 'string',
  mediaUrl: 'string?',
  mediaType: 'string?',
  mediaSize: 'number?',
  metadata: 'object',
  dedupKey: 'string?',
};

// Tipos de resposta da API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Eventos do WebSocket
export interface WebSocketEvent {
  type: string;
  data: any;
  timestamp: Date;
  companyId: string;
}

export interface TicketUpdatedEvent {
  ticketId: string;
  status: TicketStatus;
  assignedToId?: string;
  updatedAt: Date;
}

export interface MessageCreatedEvent {
  messageId: string;
  ticketId: string;
  content: string;
  createdAt: Date;
}

export interface ChannelStatusEvent {
  channelId: string;
  status: ChannelStatus;
  lastActivityAt: Date;
}
