export interface NotificationRule {
    event: string;
    notify_roles: string[];
    channels: string[];
}

export interface ValidationRule {
    min_length?: number;
    max_length?: number;
    min?: number;
    max?: number;
    pattern?: string;
    custom_message?: string;
}

export interface FormField {
    id: string;
    name: string;
    type: string;
    label: string;
    required: boolean;
    options?: string[];
    width?: 'full' | '1/2' | '1/3' | '1/4';
    validation?: ValidationRule;
    placeholder?: string;
    help_text?: string;
    default_value?: any;
    resource_type_id?: number;
    resource_display_field?: string;
}

export interface WorkflowConfig {
    parallel_execution: boolean;
    auto_assignment: boolean;
    notification_rules: NotificationRule[];
}

export interface WorkflowStep {
    id: string;
    name: string;
    description: string;
    assignable_roles: string[];
    form: FormField[];
    dependencies?: string[];
}

export interface TicketTemplate {
    id?: number;
    name: string;
    description?: string;
    title_format: string;
    default_priority: string;
    workflow: WorkflowStep[];
    workflow_config: WorkflowConfig;
    created_by?: number;
    created_at?: string;
    updated_at?: string;
}

export interface TicketTemplateCreate {
    name: string;
    description: string;
    title_format: string;
    default_priority: string;
    workflow: WorkflowStep[];
    workflow_config: WorkflowConfig;
    created_by?: number;
    created_at?: string;
    updated_at?: string;
}

export interface TicketTemplateUpdate {
    name?: string;
    description?: string;
    title_format?: string;
    default_priority?: string;
    workflow?: WorkflowStep[];
    workflow_config?: WorkflowConfig;
    created_by?: number;
    created_at?: string;
    updated_at?: string;
}
