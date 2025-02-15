import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { resourceTypeApi } from '@/lib/api';
import { ResourceType } from '@/interface/Resource';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, GripVertical, X, Type, List, Eye, CheckSquare, Calendar, RectangleHorizontal, Columns2, Columns3, Columns4, FileText, Hash, ListChecks, CircleDot, Upload } from 'lucide-react';

import { FormField } from '@/interface/TicketTemplate';
import { FormPreview } from '@/components/common/FormPreview';
import { useTranslation } from 'react-i18next';

interface FormBuilderProps {
    fields: FormField[];
    onChange: (fields: FormField[]) => void;
    onValidationChange?: (hasErrors: boolean) => void;
}

const FIELD_TYPES = [
    { type: 'text', label: 'Text Input', icon: Type },
    { type: 'textarea', label: 'Text Area', icon: FileText },
    { type: 'number', label: 'Number Input', icon: Hash },
    { type: 'select', label: 'Dropdown', icon: List },
    { type: 'multiselect', label: 'Multi Select', icon: ListChecks },
    { type: 'radio', label: 'Radio Group', icon: CircleDot },
    { type: 'checkbox', label: 'Checkbox', icon: CheckSquare },
    { type: 'date', label: 'Date Picker', icon: Calendar },
    { type: 'file', label: 'File Upload', icon: Upload },
    { type: 'resource', label: 'Resource Select', icon: List },
    { type: 'resource_multi', label: 'Resource Multi Select', icon: ListChecks },
];

const WIDTH_OPTIONS = [
    { value: 'full', label: 'Full Width', icon: RectangleHorizontal },
    { value: '1/2', label: 'Half Width', icon: Columns2 },
    { value: '1/3', label: 'One Third', icon: Columns3 },
    { value: '1/4', label: 'One Quarter', icon: Columns4 },
];

export function FormBuilder({ fields, onChange, onValidationChange }: FormBuilderProps) {
    const { t } = useTranslation();
    const [editingField, setEditingField] = useState<FormField | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: { label?: string; name?: string; options?: string; resource_type?: string } }>({});
    const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([]);

    useEffect(() => {
        const fetchResourceTypes = async () => {
            try {
                const types = await resourceTypeApi.getAll();
                setResourceTypes(types);
            } catch (error) {
                console.error('Failed to fetch resource types:', error);
            }
        };
        fetchResourceTypes();
    }, []);

    useEffect(() => {
        const hasErrors = fields.some(field => errors[field.id] && Object.keys(errors[field.id]).length > 0);
        onValidationChange?.(hasErrors);
    }, [fields, errors, onValidationChange]);

    const validateField = (field: FormField): boolean => {
        const fieldErrors: { label?: string; name?: string; options?: string; required?: string; resource_type?: string } = {};

        if (!field.label.trim()) {
            fieldErrors.label = t('template.builder.form.errors.labelRequired');
        }

        if (!field.name.trim()) {
            fieldErrors.name = t('template.builder.form.errors.nameRequired');
        } else if (!/^[a-zA-Z0-9_-]+$/.test(field.name)) {
            fieldErrors.name = t('template.builder.form.errors.nameInvalid', { allowedChars: 'a-z, A-Z, 0-9, -, _' });
        } else if (fields.some(f => f.id !== field.id && f.name === field.name)) {
            fieldErrors.name = t('template.builder.form.errors.nameDuplicate');
        }

        if ((field.type === 'select' || field.type === 'multiselect') && (!field.options || field.options.some(opt => !opt.trim()))) {
            fieldErrors.options = t('template.builder.form.errors.optionsRequired');
        }

        if ((field.type === 'resource' || field.type === 'resource_multi') && !field.resource_type_id) {
            fieldErrors.resource_type = t('template.builder.form.errors.resourceTypeRequired');
        }

        if (field.required && !field.label.trim()) {
            fieldErrors.required = t('template.builder.form.errors.requiredFieldLabel');
        }
        setErrors(prev => ({ ...prev, [field.id]: fieldErrors }));
        return Object.keys(fieldErrors).length === 0;
    };

    const addField = (type: string) => {
        const newField: FormField = {
            id: `field-${Date.now()}`,
            type,
            name: `field_${Date.now()}`,
            label: '',
            required: false,
            options: type === 'select' || type === 'checkbox_group' ? [''] : undefined,
            validation: {},
            placeholder: '',
            help_text: '',
            resource_type_id: type === 'resource' || type === 'resource_multi' ? undefined : undefined,
            resource_display_field: type === 'resource' || type === 'resource_multi' ? undefined : undefined
        };
        onChange([...fields, newField]);
        setEditingField(newField);
        setErrors(prev => ({ ...prev, [newField.id]: {} }));
    };

    const removeField = (fieldId: string) => {
        onChange(fields.filter(field => field.id !== fieldId));
        if (editingField?.id === fieldId) {
            setEditingField(null);
        }
    };

    const updateField = (fieldId: string, updates: Partial<FormField>) => {
        const updatedFields = fields.map(field => {
            if (field.id === fieldId) {
                const updatedField = { ...field, ...updates };
                validateField(updatedField);
                return updatedField;
            }
            return field;
        });
        onChange(updatedFields);
        if (editingField?.id === fieldId) {
            setEditingField(prev => prev ? { ...prev, ...updates } : null);
        }
    };

    const onDragEnd = (result: any) => {
        if (!result.destination) return;

        const items = Array.from(fields);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        onChange(items);
    };

    const addOption = (fieldId: string) => {
        const field = fields.find(f => f.id === fieldId);
        if (field && field.options) {
            updateField(fieldId, { options: [...field.options, ''] });
        }
    };

    const updateOption = (fieldId: string, index: number, value: string) => {
        const field = fields.find(f => f.id === fieldId);
        if (field && field.options) {
            const newOptions = [...field.options];
            newOptions[index] = value;
            updateField(fieldId, { options: newOptions });
        }
    };

    const removeOption = (fieldId: string, index: number) => {
        const field = fields.find(f => f.id === fieldId);
        if (field && field.options) {
            const newOptions = field.options.filter((_, i) => i !== index);
            updateField(fieldId, { options: newOptions });
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-6">
                <div className="flex overflow-x-auto gap-4 pb-2">
                    {FIELD_TYPES.map(({ type, label, icon: Icon }) => (
                        <Button
                            key={type}
                            variant="outline"
                            className="flex items-center justify-center h-8 w-8"
                            onClick={() => addField(type)}
                            title={label}
                        >
                            <Icon className="h-6 w-6" />
                        </Button>
                    ))}
                </div>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="form-fields">
                    {(provided) => (
                        <div className="relative">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute -top-10 right-0 z-10 group"
                                title="Preview"
                            >
                                <Eye className="h-4 w-4" />
                                <div className="absolute z-50 right-0 top-full mt-2 w-96 hidden group-hover:block">
                                    <div className="border rounded-lg p-4 space-y-4 bg-background shadow-lg">
                                        <h3 className="text-lg font-medium">{t('template.builder.form.preview')}</h3>
                                        <FormPreview fields={fields} />
                                    </div>
                                </div>
                            </Button>
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="grid grid-cols-12 gap-4 min-h-[200px] p-4 border-2 border-dashed border-muted rounded-lg">
                                {fields.length === 0 && (
                                    <div className="col-span-12 flex items-center justify-center h-32 text-muted-foreground">
                                        <span>{t('template.builder.form.dragAndDrop')}</span>
                                    </div>
                                )}
                                {fields.map((field, index) => (
                                    <Draggable key={field.id} draggableId={field.id} index={index}>
                                        {(provided) => (
                                            <Card
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className={`${field.width === '1/4' ? 'col-span-3' : field.width === '1/3' ? 'col-span-4' : field.width === '1/2' ? 'col-span-6' : 'col-span-12'} ${editingField?.id === field.id ? 'ring-2 ring-primary' : ''}`}
                                            >
                                                <CardContent className="p-4">
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between gap-2 border-b pb-2">
                                                            <div className="flex items-center gap-2">
                                                                <div {...provided.dragHandleProps} className="cursor-grab">
                                                                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                                                                </div>
                                                                {FIELD_TYPES.find(f => f.type === field.type)?.icon && (
                                                                    <div className="text-muted-foreground">
                                                                        {React.createElement(FIELD_TYPES.find(f => f.type === field.type)!.icon, { className: "h-5 w-5" })}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center gap-2 bg-muted rounded-md p-1">
                                                                {WIDTH_OPTIONS.map(option => (
                                                                    <Button
                                                                        key={option.value}
                                                                        variant={field.width === option.value ? 'outline' : 'ghost'}
                                                                        size="icon"
                                                                        onClick={() => updateField(field.id, { width: option.value as FormField['width'] })}
                                                                        title={option.label}
                                                                        className={`h-7 w-7 ${field.width === option.value ? 'bg-background shadow-sm' : 'hover:bg-background/50'}`}
                                                                    >
                                                                        <option.icon className="h-4 w-4" />
                                                                    </Button>
                                                                ))}
                                                            </div>

                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => removeField(field.id)}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                        <div className="flex-1 space-y-4 min-w-0">
                                                            <div className="space-y-2">
                                                                <Input
                                                                    value={field.name}
                                                                    onChange={(e) => updateField(field.id, { name: e.target.value })}
                                                                    placeholder={t('template.builder.form.fieldName')}
                                                                    className={`w-full ${errors[field.id]?.name ? 'border-destructive ring-destructive' : ''}`}
                                                                />
                                                                {errors[field.id]?.name && (
                                                                    <p className="text-sm text-destructive">{errors[field.id].name}</p>
                                                                )}
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Input
                                                                    value={field.label}
                                                                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                                                                    placeholder={t('template.builder.form.fieldLabel')}
                                                                    className={`w-full ${errors[field.id]?.label ? 'border-destructive ring-destructive' : ''}`}
                                                                />
                                                                {errors[field.id]?.label && (
                                                                    <p className="text-sm text-destructive">{errors[field.id].label}</p>
                                                                )}
                                                            </div>
                                                            <div className="space-y-4">
                                                                <div className="flex items-center space-x-2">
                                                                    <Checkbox
                                                                        id={`required-${field.id}`}
                                                                        checked={field.required}
                                                                        onCheckedChange={(checked) =>
                                                                            updateField(field.id, { required: checked as boolean })
                                                                        }
                                                                    />
                                                                    <Label htmlFor={`required-${field.id}`}>{t('template.builder.form.required')}</Label>
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <Input
                                                                        value={field.placeholder || ''}
                                                                        onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                                                        placeholder={t('template.builder.form.placeholder')}
                                                                        className="w-full"
                                                                    />
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <Input
                                                                        value={field.help_text || ''}
                                                                        onChange={(e) => updateField(field.id, { help_text: e.target.value })}
                                                                        placeholder={t('template.builder.form.helpText')}
                                                                        className="w-full"
                                                                    />
                                                                </div>

                                                                {(field.type === 'resource' || field.type === 'resource_multi') && (
                                                                    <div className="space-y-2">
                                                                        <Label>{t('template.builder.form.resourceType')}</Label>
                                                                        <Select
                                                                            value={field.resource_type_id?.toString() || ''}
                                                                            onValueChange={(value) => {
                                                                                const resourceType = resourceTypes.find(t => t.id === parseInt(value));
                                                                                updateField(field.id, {
                                                                                    resource_type_id: parseInt(value),
                                                                                    resource_display_field: resourceType?.fields[0]?.name || ''
                                                                                });
                                                                            }}
                                                                        >
                                                                            <SelectTrigger>
                                                                                <SelectValue placeholder={t('template.builder.form.selectResourceType')} />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                {resourceTypes.map((type) => (
                                                                                    <SelectItem key={type.id} value={type.id?.toString() || ''}>
                                                                                        {type.name}
                                                                                    </SelectItem>
                                                                                ))}
                                                                            </SelectContent>
                                                                        </Select>

                                                                        {field.resource_type_id && (
                                                                            <div className="mt-2">
                                                                                <Label>{t('template.builder.form.displayField')}</Label>
                                                                                <Select
                                                                                    value={field.resource_display_field || ''}
                                                                                    onValueChange={(value) => updateField(field.id, { resource_display_field: value })}
                                                                                >
                                                                                    <SelectTrigger>
                                                                                        <SelectValue placeholder={t('template.builder.form.selectDisplayField')} />
                                                                                    </SelectTrigger>
                                                                                    <SelectContent>
                                                                                        {resourceTypes
                                                                                            .find(t => t.id === field.resource_type_id)?.fields
                                                                                            .map((f) => (
                                                                                                <SelectItem key={f.name} value={f.name}>
                                                                                                    {f.label}
                                                                                                </SelectItem>
                                                                                            ))}
                                                                                    </SelectContent>
                                                                                </Select>
                                                                            </div>
                                                                        )}

                                                                        {errors[field.id]?.resource_type && (
                                                                            <p className="text-sm text-destructive">{errors[field.id].resource_type}</p>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                <div className="space-y-2">
                                                                    <Label>{t('template.builder.form.validation')}</Label>
                                                                    {field.type === 'text' && (
                                                                        <>
                                                                            <Input
                                                                                type="number"
                                                                                value={field.validation?.min_length || ''}
                                                                                onChange={(e) => updateField(field.id, {
                                                                                    validation: {
                                                                                        ...field.validation,
                                                                                        min_length: e.target.value ? parseInt(e.target.value) : undefined
                                                                                    }
                                                                                })}
                                                                                placeholder={t('template.builder.form.minLength')}
                                                                                className="w-full mb-2"
                                                                            />
                                                                            <Input
                                                                                type="number"
                                                                                value={field.validation?.max_length || ''}
                                                                                onChange={(e) => updateField(field.id, {
                                                                                    validation: {
                                                                                        ...field.validation,
                                                                                        max_length: e.target.value ? parseInt(e.target.value) : undefined
                                                                                    }
                                                                                })}
                                                                                placeholder={t('template.builder.form.maxLength')}
                                                                                className="w-full mb-2"
                                                                            />
                                                                        </>
                                                                    )}
                                                                    {field.type === 'number' && (
                                                                        <>
                                                                            <Input
                                                                                type="number"
                                                                                value={field.validation?.min || ''}
                                                                                onChange={(e) => updateField(field.id, {
                                                                                    validation: {
                                                                                        ...field.validation,
                                                                                        min: e.target.value ? parseInt(e.target.value) : undefined
                                                                                    }
                                                                                })}
                                                                                placeholder={t('template.builder.form.minValue')}
                                                                                className="w-full mb-2"
                                                                            />
                                                                            <Input
                                                                                type="number"
                                                                                value={field.validation?.max || ''}
                                                                                onChange={(e) => updateField(field.id, {
                                                                                    validation: {
                                                                                        ...field.validation,
                                                                                        max: e.target.value ? parseInt(e.target.value) : undefined
                                                                                    }
                                                                                })}
                                                                                placeholder={t('template.builder.form.maxValue')}
                                                                                className="w-full mb-2"
                                                                            />
                                                                        </>
                                                                    )}
                                                                    <Input
                                                                        value={field.validation?.pattern || ''}
                                                                        onChange={(e) => updateField(field.id, {
                                                                            validation: {
                                                                                ...field.validation,
                                                                                pattern: e.target.value
                                                                            }
                                                                        })}
                                                                        placeholder={t('template.builder.form.pattern')}
                                                                        className="w-full mb-2"
                                                                    />
                                                                    <Input
                                                                        value={field.validation?.custom_message || ''}
                                                                        onChange={(e) => updateField(field.id, {
                                                                            validation: {
                                                                                ...field.validation,
                                                                                custom_message: e.target.value
                                                                            }
                                                                        })}
                                                                        placeholder={t('template.builder.form.validationMessage')}
                                                                        className="w-full"
                                                                    />
                                                                </div>
                                                            </div>
                                                            {field.type === 'select' && (
                                                                <div className="space-y-2">
                                                                    <Label>{t('template.builder.form.options')}</Label>
                                                                    {field.options?.map((option, optionIndex) => (
                                                                        <div key={optionIndex} className="flex gap-2">
                                                                            <div className="flex-1">
                                                                                <Input
                                                                                    value={option}
                                                                                    onChange={(e) =>
                                                                                        updateOption(field.id, optionIndex, e.target.value)
                                                                                    }
                                                                                    placeholder={`${t('template.builder.form.option')} ${optionIndex + 1}`}
                                                                                    className={`w-full ${errors[field.id]?.options ? 'border-destructive ring-destructive' : ''}`}
                                                                                />
                                                                                {optionIndex === 0 && errors[field.id]?.options && (
                                                                                    <p className="text-sm text-destructive mt-1">{errors[field.id].options}</p>
                                                                                )}
                                                                            </div>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={() => removeOption(field.id, optionIndex)}
                                                                            >
                                                                                <X className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>
                                                                    ))}
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => addOption(field.id)}
                                                                    >
                                                                        <Plus className="h-4 w-4 mr-2" />
                                                                        {t('template.builder.form.addOption')}
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        </div>
                    )
                    }
                </Droppable>
            </DragDropContext>
        </div >
    );
}
