import { FormField } from '@/interface/TicketTemplate';

export interface ValidationRule {
  min_length?: number;
  max_length?: number;
  min?: number | string;
  max?: number | string;
  pattern?: string;
  allowed_types?: string[];
  max_size?: number;
}

export interface ResourceTypeMetainfo {
  searchable_fields: string[];
  filterable_fields: string[];
  default_sort_field: string;
  tags: string[];
  category: string;
}

export interface ResourceType {
  id?: number;
  name: string;
  description: string;
  version: string;
  fields: FormField[];
  metainfo: ResourceTypeMetainfo;
  created_at?: string;
  updated_at?: string;
}

export interface ResourceEntry {
  id?: number;
  resource_type_id: number;
  data: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface ResourceTypeCreate extends Omit<ResourceType, 'id' | 'created_at' | 'updated_at'> {}

export interface ResourceTypeUpdate extends Partial<ResourceTypeCreate> {}

export interface ResourceEntryCreate extends Omit<ResourceEntry, 'id' | 'created_at' | 'updated_at'> {}

export interface ResourceEntryUpdate extends Partial<ResourceEntryCreate> {}