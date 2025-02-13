import { FormField, NotificationRule } from '@/interface/TicketTemplate';

export interface Ticket {
    id: number;
    title: string;
    description: string;
    priority: string;
    status: string;
    template_id: number;
    created_by: number;
    created_at: string;
    updated_at: string;
    workflow_data: {
        metadata: {
            template_version: string;
            created_at: string;
            workflow_config: {
                parallel_execution: boolean;
                auto_assignment: boolean;
                notification_rules: NotificationRule[];
            };
            form_definitions: Record<string, FormField[]>;
        };
        steps: {
            [key: string]: {
                status: 'pending' | 'in_progress' | 'completed';
                assignee_id: number | null;
                started_at: string | null;
                completed_at: string | null;
                form_data: Record<string, any>;
                history: Array<{
                    timestamp: string;
                    type: string;
                    from: string;
                    to: string;
                }>;
            };
        };
    };
}

export interface TicketCreate {
    title: string;
    description: string;
    priority: string;
    status: string;
    template_id: number;
    workflow_data?: Record<string, any>;
}

export interface TicketUpdate {
    title?: string;
    description?: string;
    priority?: string;
    status?: string;
    workflow_data?: Record<string, any>;
}