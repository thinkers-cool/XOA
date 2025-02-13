import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Ticket } from '@/interface/Ticket';
import { TicketTemplate } from '@/interface/TicketTemplate';
import { User } from '@/interface/User';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '@/lib/api';
import { Clock, CheckCircle2, Eye, UserPlus, ChevronDown } from 'lucide-react';
import { FormFieldRenderer } from '@/components/common/FormFieldRenderer';

interface TicketVisualizationProps {
  ticket: Ticket;
  template: TicketTemplate;
  users: Record<number, User>;
  currentUser?: User | null;
  onStepClick: (ticket: Ticket, stepId: string) => void;
  onAssignClick: (ticket: Ticket, stepId: string) => void;
}

export function TicketVisualization({
  ticket,
  template,
  users,
  currentUser,
  onStepClick,
  onAssignClick
}: TicketVisualizationProps) {
  const { t } = useTranslation();
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});
  const currentStep = useMemo(() => {
    return template.workflow.find(step => {
      const stepData = ticket.workflow_data.steps[step.id];
      return stepData && stepData.status !== 'completed';
    }) || template.workflow[template.workflow.length - 1];
  }, [ticket, template]);

  const toggleStepExpand = (stepId: string) => {
    setExpandedSteps(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="mb-3 flex justify-between items-start">
          <h3 className="text-lg font-semibold">{ticket.title}</h3>
          <Badge
            variant={ticket.priority === 'high' ? 'destructive' : 
                    ticket.priority === 'medium' ? 'default' : 
                    'secondary'}
          >
            {t(`tickets.priority.${ticket.priority}`)}
          </Badge>
        </div>

        <div className="relative">
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-3">
            {template.workflow.map((step, index) => {
              const stepData = ticket.workflow_data.steps[step.id];
              const isCurrentStep = step.id === currentStep.id;
              const isCompleted = stepData?.status === 'completed';
              const isInProgress = stepData?.status === 'in_progress';
              const assignee = stepData?.assignee_id ? users[stepData.assignee_id] : null;
              const isExpanded = expandedSteps[step.id];
              const hasFormData = isCompleted && stepData?.form_data && Object.keys(stepData.form_data).length > 0;

              return (
                <div
                  key={step.id}
                  className={`relative pl-8 ${isCurrentStep ? 'opacity-100' : 'opacity-75'}`}
                >
                  <div
                    className={`absolute left-3 -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center
                      ${isCompleted ? 'bg-primary text-primary-foreground' :
                        isInProgress ? 'bg-primary/20 text-primary' :
                        'bg-muted text-muted-foreground'}`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : isInProgress ? (
                      <Clock className="w-3 h-3" />
                    ) : (
                      <span className="text-xs">{index + 1}</span>
                    )}
                  </div>

                  <div className={`p-3 rounded-lg border ${isCurrentStep ? 'bg-accent/50 border-accent' : 'bg-card'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          {assignee && (
                            <Avatar className="h-8 w-8">
                              <AvatarImage 
                                  src={assignee.avatar_url ? `${API_BASE_URL}${assignee.avatar_url}` : undefined} 
                                  alt={assignee.full_name}
                                  className="h-full w-full object-cover" 
                              />
                              <AvatarFallback>{assignee?.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                            </Avatar>
                          )}
                          <div>
                            <h4 className="font-medium truncate">{step.name}</h4>
                            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{step.description}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {hasFormData && (
                          <Button
                            variant="ghost"
                            className="h-7"
                            onClick={() => toggleStepExpand(step.id)}
                          >
                            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                            <span className="ml-1">{isExpanded ? t('common.collapse') : t('common.expand')}</span>
                          </Button>
                        )}
                        {isCompleted ? (
                          <Button
                            variant="ghost"
                            className="h-7"
                            onClick={() => onStepClick(ticket, step.id)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="ml-1">{t('tickets.actions.view')}</span>
                          </Button>
                        ) : isInProgress && stepData?.assignee_id === currentUser?.id ? (
                          <Button
                            variant="ghost"
                            className="h-7"
                            onClick={() => onStepClick(ticket, step.id)}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="ml-1">{t('tickets.actions.complete')}</span>
                          </Button>
                        ) : !isCompleted && !isInProgress && (
                          <Button
                            variant="ghost"
                            className="h-7"
                            onClick={() => onAssignClick(ticket, step.id)}
                          >
                            <UserPlus className="h-4 w-4" />
                            <span className="ml-1">{t('tickets.actions.assign')}</span>
                          </Button>
                        )}
                      </div>
                    </div>

                    {hasFormData && (
                      <div className={`overflow-hidden transition-all duration-200 ${isExpanded ? 'mt-3 max-h-96' : 'max-h-0'}`}>
                        <div className="pt-3 border-t">
                          <div className="flex flex-wrap gap-4">
                            {Object.entries(stepData.form_data).map(([fieldId, value]) => {
                              const fieldDefinition = ticket.workflow_data.metadata.form_definitions[step.id]?.find(
                                (field: any) => field.id === fieldId
                              );
                              if (!fieldDefinition) return null;
                              
                              return (
                                <div 
                                  key={fieldId} 
                                  className={`${fieldDefinition.width === '1/4' ? 'w-[calc(25%-12px)]' : 
                                    fieldDefinition.width === '1/3' ? 'w-[calc(33.333%-12px)]' : 
                                    fieldDefinition.width === '1/2' ? 'w-[calc(50%-12px)]' : 'w-full'}`}
                                >
                                  <FormFieldRenderer 
                                    field={fieldDefinition} 
                                    isPreview={true}
                                    initialValue={value}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}