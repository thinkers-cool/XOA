import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormBuilder } from '@/components/template/FormBuilder';
import { Save, Check, X } from 'lucide-react';

interface ResourceBuilderProps {
  initialResource?: any;
  onSave: (resource: any) => void;
  onCancel?: () => void;
}

export function ResourceBuilder({ initialResource, onSave, onCancel }: ResourceBuilderProps) {
  const { t } = useTranslation();
  const [resourceName, setResourceName] = useState(initialResource?.name ?? '');
  const [resourceDescription, setResourceDescription] = useState(initialResource?.description ?? '');
  const [formFields, setFormFields] = useState(initialResource?.fields ?? []);
  const [version, setVersion] = useState(initialResource?.version ?? '1');
  const [metainfo, _] = useState(initialResource?.metainfo ?? {
    searchable_fields: [],
    filterable_fields: [],
    default_sort_field: '',
    tags: [],
    category: ''
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: boolean }>({});
  const [errors, setErrors] = useState<{
    resourceName?: string;
    fields?: string;
    version?: string;
  }>({});

  const validateResource = () => {
    const newErrors: typeof errors = {};

    if (!resourceName.trim()) {
      newErrors.resourceName = t('resources.builder.errors.nameRequired');
    }

    if (formFields.length === 0) {
      newErrors.fields = t('resources.builder.errors.fieldsRequired');
    }

    if (!version.trim()) {
      newErrors.version = t('resources.builder.errors.versionRequired');
    }

    setErrors(newErrors);
    const hasFormErrors = Object.values(formErrors).some(hasError => hasError);
    return Object.keys(newErrors).length === 0 && !hasFormErrors;
  };

  const handleSave = () => {
    if (!validateResource()) {
      return;
    }

    const resource = {
      name: resourceName,
      description: resourceDescription,
      fields: formFields,
      version: version,
      metainfo: metainfo
    };
    onSave(resource);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="resourceName">
          {t('resources.builder.form.resourceName')}
          <span className="text-destructive">*</span>
        </Label>
        <Input
          id="resourceName"
          value={resourceName}
          onChange={(e) => {
            setResourceName(e.target.value);
            setErrors(prev => ({ ...prev, resourceName: undefined }));
          }}
          placeholder={t('resources.builder.placeholders.resourceName')}
          className={errors.resourceName ? 'border-destructive' : ''}
        />
        {errors.resourceName && (
          <p className="text-sm text-destructive">{errors.resourceName}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="version">
          {t('resources.builder.labels.version')}
          <span className="text-destructive">*</span>
        </Label>
        <Input
          id="version"
          value={version}
          onChange={(e) => {
            setVersion(e.target.value);
            setErrors(prev => ({ ...prev, version: undefined }));
          }}
          placeholder={t('resources.builder.placeholders.version')}
          className={errors.version ? 'border-destructive' : ''}
        />
        {errors.version && (
          <p className="text-sm text-destructive">{errors.version}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="resourceDescription">{t('resources.builder.labels.description')}</Label>
        <Input
          id="resourceDescription"
          value={resourceDescription}
          onChange={(e) => setResourceDescription(e.target.value)}
          placeholder={t('resources.builder.placeholders.resourceDescription')}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-medium">{t('resources.builder.labels.fields')}</Label>
          <p className="text-sm text-muted-foreground">{t('resources.builder.descriptions.fields')}</p>
        </div>
        <Card>
          <CardContent className="p-4">
            <FormBuilder
              fields={formFields}
              onChange={setFormFields}
              onValidationChange={(hasErrors) => {
                if (formErrors.fields !== hasErrors) {
                  setFormErrors(prev => ({ ...prev, fields: hasErrors }));
                }
              }}
            />
          </CardContent>
        </Card>
        {errors.fields && (
          <p className="text-sm text-destructive">{errors.fields}</p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button variant="neutral" onClick={onCancel}>
            <X className="mr-2 h-4 w-4" />
            {t('resources.builder.buttons.cancel')}
          </Button>
        )}
        <Button onClick={handleSave}>
          {initialResource ? <Save className="mr-2 h-4 w-4" /> : <Check className="mr-2 h-4 w-4" />}
          {initialResource ? t('resources.builder.buttons.update') : t('resources.builder.buttons.save')}
        </Button>
      </div>
    </div>
  );
}