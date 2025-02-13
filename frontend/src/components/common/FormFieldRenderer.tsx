import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FormField as FormFieldType } from '@/interface/TicketTemplate';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { FileUploadField } from '@/components/common/FileUploadField';
import { API_BASE_URL, resourceEntryApi } from '@/lib/api';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { FileIcon, defaultStyles } from 'react-file-icon';
import { Upload } from 'lucide-react';
import { ResourceEntry } from '@/interface/Resource';

interface FormFieldRendererProps {
    field: FormFieldType;
    isPreview?: boolean;
    form?: any;
    baseInputClasses?: string;
    baseLabelClasses?: string;
    initialValue?: any;
}

const FileUploadContent = ({ t }: { t: (key: string) => string }) => (
    <>
        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{t('template.builder.form.dropFiles')}</span>
    </>
);

const FieldLabel = ({ label, required, className }: { label: string; required?: boolean; className?: string }) => (
    <Label className={className}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
    </Label>
);

export function FormFieldRenderer({ 
    field, 
    isPreview = false,
    form,
    baseInputClasses = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
    baseLabelClasses = "text-left font-medium text-sm text-foreground mb-1.5",
    initialValue
}: FormFieldRendererProps) {
    const { t } = useTranslation();
    const [resourceOptions, setResourceOptions] = useState<Array<ResourceEntry>>([]);

    useEffect(() => {
        if ((field.type === 'resource' || field.type === 'resource_multi') && field.resource_type_id) {
            resourceEntryApi.getByTypeId(field.resource_type_id).then(resources => {
                setResourceOptions(resources);
            }).catch(error => {
                console.error('Failed to fetch resources:', error);
            });
        }
    }, [field.type, field.resource_type_id]);

    const renderField = (isPreviewMode: boolean) => {
        if (isPreviewMode) {
            const commonWrapperClasses = "space-y-1.5 grid";

            switch (field.type) {
                case 'text':
                case 'number':
                    return (
                        <div className={commonWrapperClasses}>
                            <FieldLabel label={field.label} required={field.required} className={baseLabelClasses} />
                            <Input disabled type={field.type} className={baseInputClasses} value={initialValue || ''} />
                        </div>
                    );
                case 'textarea':
                    return (
                        <div className={commonWrapperClasses}>
                            <FieldLabel label={field.label} required={field.required} className={baseLabelClasses} />
                            <textarea
                                disabled
                                className={`${baseInputClasses} min-h-[100px] resize-y`}
                                value={initialValue || ''}
                            />
                        </div>
                    );
                case 'select':
                    return (
                        <div className={commonWrapperClasses}>
                            <FieldLabel label={field.label} required={field.required} className={baseLabelClasses} />
                            <select disabled className={`${baseInputClasses} h-10`} value={initialValue || ''}>
                                <option value="">Select {field.label.toLowerCase()}</option>
                                {field.options?.map((option, index) => (
                                    <option key={index} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                    );
                case 'multiselect':
                    return (
                        <div className={commonWrapperClasses}>
                            <FieldLabel label={field.label} required={field.required} className={baseLabelClasses} />
                            <select
                                disabled
                                multiple
                                className={`${baseInputClasses} min-h-[100px]`}
                                value={initialValue || []}
                            >
                                {field.options?.map((option, index) => (
                                    <option key={index} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                    );
                case 'radio':
                    return (
                        <div className={commonWrapperClasses}>
                            <FieldLabel label={field.label} required={field.required} className={baseLabelClasses} />
                            <div className="space-y-2 pt-1">
                                {field.options?.map((option, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            disabled
                                            checked={initialValue === option}
                                            className="h-4 w-4 border border-input bg-background text-primary focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                        <Label className="text-sm font-normal">{option}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                case 'checkbox':
                    return (
                        <div className={commonWrapperClasses}>
                            <FieldLabel label={field.label} required={field.required} className={baseLabelClasses} />
                            <div className="flex items-center space-x-2 pt-1">
                                <Checkbox disabled id={`preview-${field.id}`} checked={initialValue || false} />
                                <Label className="text-sm font-normal">{t('template.builder.form.yes')}</Label>
                            </div>
                        </div>
                    );
                case 'date':
                    return (
                        <div className={commonWrapperClasses}>
                            <FieldLabel label={field.label} required={field.required} className={baseLabelClasses} />
                            <Input
                                disabled
                                type="date"
                                className={baseInputClasses}
                                placeholder="Select date"
                                value={initialValue || ''}
                            />
                        </div>
                    );
                case 'file':
                    return (
                        <div className={commonWrapperClasses}>
                            <FieldLabel label={field.label} required={field.required} className={baseLabelClasses} />
                            {initialValue ? (
                                <div className="flex flex-wrap items-center gap-2 p-3 border rounded-md bg-muted/30">
                                    {Array.isArray(initialValue) ? (
                                        initialValue.map((file: { original_name: string; saved_name: string }, index: number) => (
                                            <FilePreview key={index} file={file} />
                                        ))
                                    ) : (
                                        <span className="text-sm text-muted-foreground">{t('common.noFileUploaded')}</span>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center w-full">
                                    <label className={`${baseInputClasses} h-32 flex flex-col items-center justify-center border-dashed hover:border-primary hover:bg-muted/30 transition-all duration-200 cursor-not-allowed`}>
                                        <FileUploadContent t={t} />
                                    </label>
                                </div>
                            )}
                        </div>
                    );
                case 'resource':
                    return (
                        <div className={commonWrapperClasses}>
                            <FieldLabel label={field.label} required={field.required} className={baseLabelClasses} />
                            <select disabled className={`${baseInputClasses} h-10`} value={initialValue || ''}>
                                <option value="">Select {field.label.toLowerCase()}</option>
                                {resourceOptions.map((resource) => (
                                    <option key={resource.id} value={resource.id?.toString() || ''}>
                                        {resource.data[field.resource_display_field || 'id']}
                                    </option>
                                ))}
                            </select>
                        </div>
                    );
                case'resource_multi':
                    return (
                        <div className={commonWrapperClasses}>
                            <FieldLabel label={field.label} required={field.required} className={baseLabelClasses} />
                            <select
                                disabled
                                multiple
                                className={`${baseInputClasses} min-h-[100px]`}
                                value={initialValue || []}
                            >
                                {resourceOptions.map((resource) => (
                                    <option key={resource.id} value={resource.id?.toString() || ''}>
                                        {resource.data[field.resource_display_field || 'id']}
                                    </option>
                                ))}
                            </select>
                        </div>
                    );
                default:
                    return (
                        <div className={commonWrapperClasses}>
                            <FieldLabel label={field.label} required={field.required} className={baseLabelClasses} />
                            <Input disabled className={baseInputClasses} value={initialValue || ''} />
                        </div>
                    );
            }
        }

        return (
            <FormField
                control={form.control}
                name={field.id as never}
                render={({ field: formField }) => (
                    <FormItem>
                        <FormLabel>{field.label}{field.required && <span className="text-destructive ml-1">*</span>}</FormLabel>
                        <FormControl>
                            {(() => {
                                switch (field.type) {
                                    case 'textarea':
                                        return (
                                            <Textarea
                                                {...formField}
                                                placeholder={field.placeholder}
                                                defaultValue={initialValue}
                                            />
                                        );
                                    case 'select':
                                        return (
                                            <Select
                                                onValueChange={formField.onChange}
                                                defaultValue={initialValue || formField.value}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder={field.placeholder} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {field.options?.map((option) => (
                                                        <SelectItem key={option} value={option}>
                                                            {option}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        );
                                    case 'radio':
                                        return (
                                            <RadioGroup
                                                onValueChange={formField.onChange}
                                                defaultValue={initialValue || formField.value}
                                                className="flex flex-col space-y-1"
                                            >
                                                {field.options?.map((option) => (
                                                    <div key={option} className="flex items-center space-x-2">
                                                        <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                                                        <label htmlFor={`${field.id}-${option}`}>{option}</label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        );
                                    case 'checkbox':
                                        return (
                                            <Checkbox
                                                checked={formField.value}
                                                onCheckedChange={formField.onChange}
                                                defaultChecked={initialValue}
                                            />
                                        );
                                    case 'date':
                                        return (
                                            <Input
                                                {...formField}
                                                type="date"
                                                placeholder={field.placeholder}
                                                defaultValue={initialValue}
                                            />
                                        );
                                    case 'file':
                                        return (
                                            <FileUploadField
                                                {...formField}
                                                placeholder={field.placeholder}
                                                key={`${field.id}-${initialValue ? JSON.stringify(initialValue) : 'empty'}`}
                                                value={initialValue}
                                            />
                                        );
                                    case 'number':
                                        return (
                                            <Input
                                                {...formField}
                                                type="number"
                                                placeholder={field.placeholder}
                                                defaultValue={initialValue}
                                            />
                                        );
                                    case 'resource':
                                        return (
                                            <Select
                                                onValueChange={formField.onChange}
                                                defaultValue={initialValue || formField.value}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder={field.placeholder} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {resourceOptions.map((resource) => (
                                                        <SelectItem key={resource.id} value={resource.id?.toString() || ''}>
                                                            {resource.data[field.resource_display_field || 'id']}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        );
                                    case'resource_multi':
                                        return (
                                            <MultiSelect
                                                onValueChange={formField.onChange}
                                                defaultValue={initialValue || formField.value}
                                                placeholder={field.placeholder}
                                                options={resourceOptions.map((resource) => ({
                                                    label: resource.data[field.resource_display_field || 'id'],
                                                    value: resource.id?.toString() || '',
                                                }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder={field.placeholder} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {resourceOptions.map((resource) => (
                                                        <SelectItem key={resource.id} value={resource.id?.toString() || ''}>
                                                            {resource.data[field.resource_display_field || 'id']}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </MultiSelect>
                                        );
                                    default:
                                        return (
                                            <Input
                                                {...formField}
                                                placeholder={field.placeholder}
                                                defaultValue={initialValue}
                                            />
                                        );
                                }
                            })()}
                        </FormControl>
                        {field.help_text && <p className="text-sm text-muted-foreground">{field.help_text}</p>}
                        <FormMessage />
                    </FormItem>
                )}
            />
        );
    };

    return renderField(isPreview);
}

import { DefaultExtensionType } from 'react-file-icon';

const getFileType = (filename: string): DefaultExtensionType => {
  const ext = (filename.split('.').pop()?.toLowerCase() || '') as DefaultExtensionType;
  return ext;
};

const isImageFile = (filename: string) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  return imageExtensions.includes(getFileType(filename));
};

const FilePreview = ({ file }: { file: { original_name: string; saved_name: string } }) => {
  const fileType = getFileType(file.original_name);
  const isImage = isImageFile(file.original_name);

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <a
          href={`${API_BASE_URL}/files/download/${file.saved_name}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-background text-sm text-foreground hover:text-primary transition-colors rounded-md border hover:border-primary"
        >
          <div className="w-4 h-4">
            <FileIcon extension={fileType} {...defaultStyles[fileType]} />
          </div>
          {file.original_name}
        </a>
      </HoverCardTrigger>
      {isImage && (
        <HoverCardContent className="w-80">
          <img
            src={`${API_BASE_URL}/files/download/${file.saved_name}`}
            alt={file.original_name}
            className="w-full h-auto rounded-md"
          />
        </HoverCardContent>
      )}
    </HoverCard>
  );
};
