import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { templateApi } from '@/lib/api';
import { TicketTemplate } from '@/interface/TicketTemplate';

interface TicketFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function TicketForm({ onSubmit, onCancel }: TicketFormProps) {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState<TicketTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TicketTemplate | null>(null);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await templateApi.getAll();
        setTemplates(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch templates');
        console.error('Error fetching templates:', err);
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === parseInt(templateId));
    setSelectedTemplate(template || null);
    if (template?.title_format) {
      setTitle(template.title_format);
    }
    if (template?.default_priority) {
      setPriority(template.default_priority);
    }
  };

  const handleSubmit = () => {
    if (!selectedTemplate) return;

    const ticketData = {
      template_id: selectedTemplate.id,
      title,
      priority: priority || selectedTemplate.default_priority,
      status: "opened",
      workflow_data: {
        metadata: {
          template_version: "1.0.0",
          created_at: new Date().toISOString(),
          workflow_config: selectedTemplate.workflow_config,
          form_definitions: selectedTemplate.workflow.reduce((acc, step) => ({
            ...acc,
            [step.id]: step.form
          }), {})
        },
        steps: selectedTemplate.workflow.reduce((acc, step) => ({
          ...acc,
          [step.id]: {
            status: "pending",
            assignee_id: null,
            started_at: null,
            form_data: {},
            history: []
          }
        }), {})
      }
    };

    onSubmit(ticketData);
  };

  if (loading) {
    return <div>{t('common.loading')}</div>;
  }

  if (error) {
    return <div className="text-destructive">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="template">{t('tickets.create.selectTemplate')}</Label>
        <Select onValueChange={handleTemplateChange}>
          <SelectTrigger>
            <SelectValue placeholder={t('tickets.create.templatePlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {templates.map((template) => (
              <SelectItem key={template?.id} value={template?.id?.toString() ?? ''}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedTemplate && (
        <>
          <div className="space-y-2">
            <Label htmlFor="title">{t('tickets.list.title')}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('tickets.create.titlePlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">{t('tickets.list.priority')}</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue placeholder={t('tickets.create.priorityPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">{t('template.builder.priority.high')}</SelectItem>
                <SelectItem value="medium">{t('template.builder.priority.medium')}</SelectItem>
                <SelectItem value="low">{t('template.builder.priority.low')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSubmit}>
              {t('common.create')}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}