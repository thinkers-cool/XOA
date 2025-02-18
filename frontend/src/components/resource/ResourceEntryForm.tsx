import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { ResourceType } from '@/interface/Resource';
import { FormFieldRenderer } from '@/components/common/FormFieldRenderer';

interface ResourceEntryFormProps {
  resourceType: ResourceType;
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ResourceEntryForm({
  resourceType,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false
}: ResourceEntryFormProps) {
  const { t } = useTranslation();

  const formSchema = z.object(
    resourceType.fields.reduce((acc, field) => {
      let validator;

      if (field.type === 'text' || field.type === 'textarea') {
        validator = z.string();
        if (field.validation?.min_length) validator = validator.min(field.validation.min_length, `Minimum ${field.validation.min_length} characters required`);
        if (field.validation?.max_length) validator = validator.max(field.validation.max_length, `Maximum ${field.validation.max_length} characters allowed`);
        if (field.validation?.pattern) validator = validator.regex(new RegExp(field.validation.pattern), field.validation?.custom_message || 'Invalid format');
      } else if (field.type === 'number') {
        validator = z.preprocess(
          (val) => (val === '' ? undefined : Number(val)),
          z.number().or(z.undefined())
        );
        if (field.validation?.min) validator = validator.pipe(z.number().min(field.validation.min, `Minimum value is ${field.validation.min}`));
        if (field.validation?.max) validator = validator.pipe(z.number().max(field.validation.max, `Maximum value is ${field.validation.max}`));
      } else if (field.type === 'select') {
        validator = z.string().min(1, 'Please select an option');
      } else if (field.type === 'multiselect') {
        validator = z.array(z.string()).min(1, 'Please select at least one option');
      } else if (field.type === 'radio') {
        validator = z.string().min(1, 'Please select an option');
      } else if (field.type === 'checkbox') {
        validator = z.boolean();
      } else if (field.type === 'date') {
        validator = z.string().min(1, 'Please select a date');
      } else if (field.type === 'file') {
        validator = z.union([
          z.instanceof(FileList),
          z.array(z.object({
            original_name: z.string(),
            saved_name: z.string()
          }))
        ])
          .refine((value) => {
            if (value instanceof FileList) {
              return value.length > 0;
            }
            return Array.isArray(value) && value.length > 0;
          }, 'Please select a file')
          .optional();
      } else {
        validator = z.any();
      }

      if (field.required) {
        validator = validator.refine(val => val !== undefined && val !== null && val !== '', {
          message: field.validation?.custom_message || t('tickets.form.required')
        });
      } else {
        validator = validator.optional();
      }

      return { ...acc, [field.id]: validator };
    }, {})
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: resourceType.fields.reduce((acc, field) => ({
      ...acc,
      [field.id]: initialData?.[field.id] ?? (field.type === 'checkbox' ? false : '')
    }), {})
  });

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-wrap gap-4">
          {resourceType.fields.map(field => (
            <div key={field.id} className={`${field.width === '1/4' ? 'w-[calc(25%-12px)]' : field.width === '1/3' ? 'w-[calc(33.333%-12px)]' : field.width === '1/2' ? 'w-[calc(50%-12px)]' : 'w-full'}`}>
              <FormFieldRenderer field={field} form={form} />
            </div>
          ))}
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
    </Form>
  );
}