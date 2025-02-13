import axios from 'axios';
import { TicketTemplate, TicketTemplateCreate, TicketTemplateUpdate } from '@/interface/TicketTemplate';
import { User, UserRole, UserCreate, UserUpdate } from '@/interface/User';
import { Role } from '@/interface/Role';
import { Ticket, TicketCreate, TicketUpdate } from '@/interface/Ticket';
import { useAuth } from '@/hooks/useAuth';
import { ResourceType, ResourceTypeCreate, ResourceTypeUpdate, ResourceEntry, ResourceEntryCreate, ResourceEntryUpdate } from '@/interface/Resource';
export const API_BASE_URL = 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to dynamically add auth token
api.interceptors.request.use((config) => {
  const { token } = useAuth.getState();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// User API endpoints
export const userApi = {
  create: async (user: UserCreate): Promise<User> => {
    const response = await api.post('/users', user);
    return response.data;
  },

  update: async (id: number, user: UserUpdate): Promise<User> => {
    const response = await api.put(`/users/${id}`, user);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  getById: async (id: number): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  getRoleById: async (id: number): Promise<UserRole[]> => {
    const response = await api.get(`/users/${id}/roles`);
    return response.data;
  },

  createRole: async (id: number, role: { role_id: number, reports_to_id: number | null }): Promise<UserRole> => {
    const response = await api.post(`/users/${id}/roles`, {...role, user_id: id});
    return response.data;
  },

  deleteRole: async (id: number): Promise<UserRole[]> => {
    const response = await api.delete(`/users/${id}/roles`);
    return response.data;
  },

};

// Role API endpoints
export const roleApi = {
  create: async (role: Omit<Role, 'id'>): Promise<Role> => {
    const response = await api.post('/roles', role);
    return response.data;
  },

  update: async (id: number, role: Partial<Role>): Promise<Role> => {
    const response = await api.put(`/roles/${id}`, role);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/roles/${id}`);
  },

  getAll: async (): Promise<Role[]> => {
    const response = await api.get('/roles');
    return response.data;
  },

  getById: async (id: number): Promise<Role> => {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  },

  getUserById: async (id: number): Promise<User[]> => {
    const response = await api.get(`/roles/${id}/users`);
    return response.data;
  },

};

// Template API endpoints
export const templateApi = {
  create: async (template: TicketTemplateCreate): Promise<TicketTemplate> => {
    const response = await api.post('/ticket-templates', template);
    return response.data;
  },

  update: async (id: number, template: TicketTemplateUpdate): Promise<TicketTemplate> => {
    const response = await api.put(`/ticket-templates/${id}`, template);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/ticket-templates/${id}`);
  },

  getAll: async (): Promise<TicketTemplate[]> => {
    const response = await api.get('/ticket-templates');
    return response.data;
  },

  getById: async (id: number): Promise<TicketTemplate> => {
    const response = await api.get(`/ticket-templates/${id}`);
    return response.data;
  },
};

// Ticket API endpoints
export const ticketApi = {
  create: async (ticket: TicketCreate): Promise<Ticket> => {
    const response = await api.post('/tickets', ticket);
    return response.data;
  },

  update: async (id: number, ticket: TicketUpdate): Promise<Ticket> => {
    const response = await api.put(`/tickets/${id}`, ticket);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/tickets/${id}`);
  },

  getAll: async (): Promise<Ticket[]> => {
    const response = await api.get('/tickets');
    return response.data;
  },

  getById: async (id: number): Promise<Ticket> => {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  },
};

// File API endpoints
export const fileApi = {
  upload: async (files: File[]): Promise<{ files: { original_name: string, saved_name: string, content_type: string, size: number }[] }> => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    
    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  download: async (filename: string): Promise<Blob> => {
    const response = await api.get(`/files/download/${filename}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  delete: async (filename: string): Promise<void> => {
    await api.delete(`/files/${filename}`);
  },
};

// Resource Type API endpoints
export const resourceTypeApi = {
  create: async (resourceType: ResourceTypeCreate): Promise<ResourceType> => {
    const response = await api.post('/resources/types', resourceType);
    return response.data;
  },

  update: async (id: number, resourceType: ResourceTypeUpdate): Promise<ResourceType> => {
    const response = await api.put(`/resources/types/${id}`, resourceType);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/resources/types/${id}`);
  },

  getAll: async (): Promise<ResourceType[]> => {
    const response = await api.get('/resources/types');
    return response.data;
  },

  getById: async (id: number): Promise<ResourceType> => {
    const response = await api.get(`/resources/types/${id}`);
    return response.data;
  },
};

// Resource Entry API endpoints
export const resourceEntryApi = {
  create: async (entry: ResourceEntryCreate): Promise<ResourceEntry> => {
    const response = await api.post('/resources/entries', entry);
    return response.data;
  },

  update: async (id: number, entry: ResourceEntryUpdate): Promise<ResourceEntry> => {
    const response = await api.put(`/resources/entries/${id}`, entry);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/resources/entries/${id}`);
  },

  getByTypeId: async (resourceTypeId?: number): Promise<ResourceEntry[]> => {
    const response = await api.get(`/resources/types/${resourceTypeId}/entries`);
    return response.data;
  },

  getById: async (id: number): Promise<ResourceEntry> => {
    const response = await api.get(`/resources/entries/${id}`);
    return response.data;
  },
};