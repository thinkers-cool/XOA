import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, GripVertical, X, Save, Check } from 'lucide-react';
import { NotificationRulesBuilder } from '@/components/template/NotificationRulesBuilder';
import { roleApi } from '@/lib/api';
import { Role } from '@/interface/Role';

import { FormBuilder } from '@/components/template/FormBuilder';
import { WorkflowGraph } from '@/components/template/WorkflowGraph';
import { TicketTemplate, WorkflowStep, WorkflowConfig } from '@/interface/TicketTemplate';

interface TemplateBuilderProps {
    initialTemplate?: TicketTemplate | null;
    isUpdating? : boolean;
    onSave: (template: any) => void;
    onCancel?: () => void;
}

export function TemplateBuilder({ initialTemplate, isUpdating, onSave, onCancel }: TemplateBuilderProps) {
    const { t } = useTranslation();
    const [templateName, setTemplateName] = useState(initialTemplate?.name ?? '');
    const [templateDescription, setTemplateDescription] = useState(initialTemplate?.description ?? '');
    const [titleFormat, setTitleFormat] = useState(initialTemplate?.title_format ?? '');
    const [defaultPriority, setDefaultPriority] = useState(initialTemplate?.default_priority ?? 'medium');
    const [workflow, setWorkflow] = useState<WorkflowStep[]>(initialTemplate?.workflow ?? []);
    const [roles, setRoles] = useState<Role[]>([]);
    const AVAILABLE_ROLES = roles.map(role => role.name);

    useEffect(() => {
        setTemplateName(initialTemplate?.name ?? '');
        setTemplateDescription(initialTemplate?.description ?? '');
        setTitleFormat(initialTemplate?.title_format ?? '');
        setDefaultPriority(initialTemplate?.default_priority ?? 'medium');
        setWorkflow(initialTemplate?.workflow ?? []);
    }, [initialTemplate]);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const data = await roleApi.getAll();
                setRoles(data);
            } catch (err) {
                console.error('Error fetching roles:', err);
            }
        };
        fetchRoles();
    }, []);

    const [workflowConfig, setWorkflowConfig] = useState<WorkflowConfig>({
        parallel_execution: initialTemplate?.workflow_config?.parallel_execution ?? false,
        auto_assignment: initialTemplate?.workflow_config?.auto_assignment ?? false,
        notification_rules: initialTemplate?.workflow_config?.notification_rules ?? []
    });
    const [formErrors, setFormErrors] = useState<{ [stepId: string]: boolean }>({});

    const addStep = () => {
        const newStep: WorkflowStep = {
            id: crypto.randomUUID(),
            name: '',
            description: '',
            assignable_roles: [],
            form: [],
            dependencies: []
        };
        setWorkflow([...workflow, newStep]);
    };

    const removeStep = (stepId: string) => {
        setWorkflow(workflow.filter(step => step.id !== stepId));
    };

    const updateStep = (stepId: string, field: keyof WorkflowStep, value: any) => {
        setWorkflow(workflow.map(step =>
            step.id === stepId ? { ...step, [field]: value } : step
        ));
    };

    const onDragEnd = (result: any) => {
        if (!result.destination) return;

        const items = Array.from(workflow);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setWorkflow(items);
    };

    const [errors, setErrors] = useState<{
        templateName?: string;
        titleFormat?: string;
        workflow?: { [key: string]: { name?: string; description?: string } };
    }>({});

    const validateTemplate = () => {
        const newErrors: typeof errors = {};

        // Validate template name
        if (!templateName.trim()) {
            newErrors.templateName = t('template.builder.errors.nameRequired');
        }

        // Validate default title
        if (!titleFormat.trim()) {
            newErrors.titleFormat = t('template.builder.errors.titleFormatRequired');
        }

        // Validate workflow
        if (workflow.length === 0) {
            newErrors.workflow = {};
            newErrors.workflow['general'] = { name: t('template.builder.errors.stepRequired') };
        } else {
            const stepErrors: typeof newErrors.workflow = {};
            const stepNames = new Set<string>();
            workflow.forEach(step => {
                if (!step.name.trim() || !step.description.trim()) {
                    stepErrors[step.id] = {};
                    if (!step.name.trim()) {
                        stepErrors[step.id].name = t('template.builder.errors.stepNameRequired');
                    }
                    if (!step.description.trim()) {
                        stepErrors[step.id].description = t('template.builder.errors.stepDescriptionRequired');
                    }
                } else if (stepNames.has(step.name.trim())) {
                    stepErrors[step.id] = stepErrors[step.id] || {};
                    stepErrors[step.id].name = t('template.builder.errors.stepNameDuplicate');
                } else {
                    stepNames.add(step.name.trim());
                }
            });
            if (Object.keys(stepErrors).length > 0) {
                newErrors.workflow = stepErrors;
            }
        }

        setErrors(newErrors);

        // Check if any form fields have validation errors
        const hasFormErrors = Object.values(formErrors).some(hasError => hasError);
        return Object.keys(newErrors).length === 0 && !hasFormErrors;
    };

    const ensureFormFieldAttributes = (fields: any[]) => {
        return fields.map(field => ({
            ...field,
            required: field.required === undefined ? false : field.required,
            label: field.label || field.name || '',
            description: field.description || '',
            placeholder: field.placeholder || '',
            defaultValue: field.defaultValue === undefined ? null : field.defaultValue
        }));
    };

    const handleSave = () => {
        if (!validateTemplate()) {
            return;
        }

        // Ensure all workflow steps have properly formatted form fields
        const validatedWorkflow = workflow.map(step => ({
            ...step,
            form: ensureFormFieldAttributes(step.form || [])
        }));

        const template = {
            name: templateName,
            description: templateDescription,
            titleFormat,
            defaultPriority,
            workflow: validatedWorkflow,
            workflowConfig
        };
        onSave(template);
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="templateName">
                        {t('template.builder.form.templateName')}
                        <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="templateName"
                        value={templateName}
                        onChange={(e) => {
                            setTemplateName(e.target.value);
                            setErrors(prev => ({ ...prev, templateName: undefined }));
                        }}
                        placeholder={t('template.builder.placeholders.templateName')}
                        className={errors.templateName ? 'border-destructive' : ''}
                    />
                    {errors.templateName && (
                        <p className="text-sm text-destructive">{errors.templateName}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="defaultPriority">{t('template.builder.labels.defaultPriority')}</Label>
                    <Select value={defaultPriority} onValueChange={setDefaultPriority}>
                        <SelectTrigger>
                            <SelectValue placeholder={t('template.builder.placeholders.selectPriority')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="low">{t('template.builder.priority.low')}</SelectItem>
                            <SelectItem value="medium">{t('template.builder.priority.medium')}</SelectItem>
                            <SelectItem value="high">{t('template.builder.priority.high')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="templateDescription">{t('template.builder.labels.description')}</Label>
                <Input
                    id="templateDescription"
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    placeholder={t('template.builder.placeholders.templateDescription')}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="titleFormat">
                    {t('template.builder.labels.titleFormat')}
                    <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="titleFormat"
                    value={titleFormat}
                    onChange={(e) => {
                        setTitleFormat(e.target.value);
                        setErrors(prev => ({ ...prev, titleFormat: undefined }));
                    }}
                    placeholder={t('template.builder.placeholders.titleFormat')}
                    className={errors.titleFormat ? 'border-destructive' : ''}
                />
                {errors.titleFormat && (
                    <p className="text-sm text-destructive">{errors.titleFormat}</p>
                )}
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label>{t('template.builder.labels.workflowConfig')}</Label>
                    <p className="text-sm text-muted-foreground">{t('template.builder.descriptions.workflowConfig')}</p>
                </div>
                <Card>
                    <CardContent className="p-4 space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="parallel_execution">{t('template.builder.labels.parallelExecution')}</Label>
                                <Select
                                    value={workflowConfig?.parallel_execution ? 'true' : 'false'}
                                    onValueChange={(value) => setWorkflowConfig(prev => ({
                                        ...prev,
                                        parallel_execution: value === 'true'
                                    }))}
                                >
                                    <SelectTrigger id="parallel_execution">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">{t('common.yes')}</SelectItem>
                                        <SelectItem value="false">{t('common.no')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="auto_assignment">{t('template.builder.labels.autoAssignment')}</Label>
                                <Select
                                    value={workflowConfig?.auto_assignment ? 'true' : 'false'}
                                    onValueChange={(value) => setWorkflowConfig(prev => ({
                                        ...prev,
                                        auto_assignment: value === 'true'
                                    }))}
                                >
                                    <SelectTrigger id="auto_assignment">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">{t('common.yes')}</SelectItem>
                                        <SelectItem value="false">{t('common.no')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>{t('template.builder.labels.notificationRules')}</Label>
                            <NotificationRulesBuilder
                                rules={workflowConfig.notification_rules || []}
                                onChange={(rules) => setWorkflowConfig(prev => ({ ...prev, notification_rules: rules }))}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <h3 className="text-lg font-medium">{t('template.builder.labels.workflow')}</h3>
                            <p className="text-sm text-muted-foreground">{t('template.builder.descriptions.workflow')}</p>
                        </div>
                        <Button onClick={addStep} variant="outline">
                            <Plus className="mr-2 h-4 w-4" />
                            {t('template.builder.buttons.addStep')}
                        </Button>
                    </div>
                    {errors.workflow?.general && (
                        <p className="text-sm text-destructive">{errors.workflow.general.name}</p>
                    )}
                    <div className="relative">
                        <div className="absolute left-8 top-0 bottom-0 w-px bg-border" />
                    </div>
                </div>
                <WorkflowGraph workflow={workflow} />

                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="workflow">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-8">
                                {workflow.map((step, index) => (
                                    <Draggable key={step.id} draggableId={step.id} index={index}>
                                        {(provided) => (
                                            <Card
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className={`relative bg-card hover:bg-accent/10 transition-colors ${errors.workflow?.[step.id] ? 'border-destructive' : ''}`}
                                            >
                                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-background border-2 border-border text-sm font-medium">
                                                    {index + 1}
                                                </div>
                                                <CardContent className="p-4">
                                                    <div className="flex items-start gap-4">
                                                        <div {...provided.dragHandleProps} className="mt-2">
                                                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                                                        </div>
                                                        <div className="flex-1 space-y-6">
                                                            <div className="grid gap-4 md:grid-cols-2">
                                                                <div className="space-y-2">
                                                                    <Label htmlFor={`step-name-${step.id}`}>
                                                                        {t('template.builder.labels.stepName')}
                                                                        <span className="text-destructive">*</span>
                                                                    </Label>
                                                                    <Input
                                                                        id={`step-name-${step.id}`}
                                                                        value={step.name}
                                                                        onChange={(e) => {
                                                                            const newName = e.target.value;
                                                                            updateStep(step.id, 'name', newName);
                                                                            // Force re-render of all MultiSelect components
                                                                            setWorkflow(prev => [...prev]);
                                                                            setErrors(prev => {
                                                                                const newErrors = { ...prev };
                                                                                if (newErrors.workflow?.[step.id]?.name) {
                                                                                    delete newErrors.workflow[step.id].name;
                                                                                    if (Object.keys(newErrors.workflow[step.id]).length === 0) {
                                                                                        delete newErrors.workflow[step.id];
                                                                                    }
                                                                                    if (Object.keys(newErrors.workflow || {}).length === 0) {
                                                                                        delete newErrors.workflow;
                                                                                    }
                                                                                }
                                                                                return newErrors;
                                                                            });
                                                                        }}
                                                                        placeholder={t('template.builder.placeholders.stepName')}
                                                                        className={errors.workflow?.[step.id]?.name ? 'border-destructive' : ''}
                                                                    />
                                                                    {errors.workflow?.[step.id]?.name && (
                                                                        <p className="text-sm text-destructive">{errors.workflow[step.id].name}</p>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-start justify-end">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => removeStep(step.id)}
                                                                        className="hover:bg-destructive/10 hover:text-destructive"
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label htmlFor={`step-desc-${step.id}`}>
                                                                    {t('template.builder.labels.description')}
                                                                    <span className="text-destructive">*</span>
                                                                </Label>
                                                                <Input
                                                                    id={`step-desc-${step.id}`}
                                                                    value={step.description}
                                                                    onChange={(e) => {
                                                                        updateStep(step.id, 'description', e.target.value);
                                                                        setErrors(prev => {
                                                                            const newErrors = { ...prev };
                                                                            if (newErrors.workflow?.[step.id]?.description) {
                                                                                delete newErrors.workflow[step.id].description;
                                                                                if (Object.keys(newErrors.workflow[step.id]).length === 0) {
                                                                                    delete newErrors.workflow[step.id];
                                                                                }
                                                                                if (Object.keys(newErrors.workflow || {}).length === 0) {
                                                                                    delete newErrors.workflow;
                                                                                }
                                                                            }
                                                                            return newErrors;
                                                                        });
                                                                    }}
                                                                    placeholder={t('template.builder.placeholders.stepDescription')}
                                                                    className={`${errors.workflow?.[step.id]?.description ? 'border-destructive' : ''}`}
                                                                />
                                                                {errors.workflow?.[step.id]?.description && (
                                                                    <p className="text-sm text-destructive">{errors.workflow[step.id].description}</p>
                                                                )}
                                                            </div>

                                                            <div className="space-y-4 pt-4 border-t">
                                                                <div className="space-y-4">
                                                                    <Label>{t('template.builder.labels.assignableRoles')}</Label>
                                                                    <MultiSelect
                                                                        options={AVAILABLE_ROLES.map(role => ({
                                                                            label: t(`template.builder.roles.${role}`),
                                                                            value: role
                                                                        }))}
                                                                        value={step.assignable_roles || []}
                                                                        onValueChange={(values) => updateStep(step.id, 'assignable_roles', values)}
                                                                        placeholder={t('template.builder.placeholders.selectRoles')}
                                                                    />
                                                                </div>
                                                                <div className="space-y-4">
                                                                    <Label>{t('template.builder.labels.dependencies')}</Label>
                                                                    <MultiSelect
                                                                        options={workflow
                                                                            .filter(s => s.id !== step.id)
                                                                            .map(s => ({
                                                                                label: s.name || t('template.builder.labels.unnamedStep'),
                                                                                value: s.id
                                                                            }))}
                                                                        value={step.dependencies || []}
                                                                        onValueChange={(values) => {
                                                                            updateStep(step.id, 'dependencies', values.filter(v => v !== step.id));
                                                                        }}
                                                                        placeholder={t('template.builder.placeholders.selectDependencies')}
                                                                        maxCount={5}
                                                                    />
                                                                </div>
                                                                <div className="space-y-4">
                                                                    <div className="flex items-center justify-between">
                                                                        <Label className="text-lg font-medium">{t('template.builder.labels.formFields')}</Label>
                                                                        <p className="text-sm text-muted-foreground">{t('template.builder.descriptions.formFields')}</p>
                                                                    </div>
                                                                    <FormBuilder
                                                                        fields={step.form}
                                                                        onChange={(fields) => updateStep(step.id, 'form', fields)}
                                                                        onValidationChange={(hasErrors) => {
                                                                            setFormErrors(prev => ({ ...prev, [step.id]: hasErrors }));
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>

            <div className="flex justify-end gap-2">
                {onCancel && (
                    <Button variant="outline" onClick={onCancel}>
                        <X className="mr-2 h-4 w-4" />
                        {t('template.builder.buttons.cancel')}
                    </Button>
                )}
                <Button onClick={handleSave}>
                    {initialTemplate ? <Save className="mr-2 h-4 w-4" /> : <Check className="mr-2 h-4 w-4" />}
                    {initialTemplate && isUpdating ? t('template.builder.buttons.update') : t('template.builder.buttons.save')}
                </Button>
            </div>
        </div>
    );
}