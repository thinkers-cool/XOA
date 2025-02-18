import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ResourceTypeCreate, ResourceTypeUpdate } from '@/interface/Resource';

interface ResourceTypeFormProps {
  initialData?: ResourceTypeUpdate;
  onSubmit: (data: ResourceTypeCreate | ResourceTypeUpdate) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ResourceTypeForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false
}: ResourceTypeFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ResourceTypeCreate>(() => ({
    name: initialData?.name || '',
    description: initialData?.description || '',
    version: (initialData?.version || 1).toString(),
    fields: initialData?.fields || [],
    metainfo: initialData?.metainfo || { searchable_fields: [], filterable_fields: [], default_sort_field: '', tags: [], category: '' }
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">{t('resources.form.name')}</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder={t('resources.form.namePlaceholder')}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t('resources.form.description')}</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder={t('resources.form.descriptionPlaceholder')}
          required
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="neutral"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {t('common.cancel')}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t('common.submitting') : t('common.save')}
        </Button>
      </div>
    </form>
  );
}