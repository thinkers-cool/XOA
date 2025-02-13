import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { FormField as TemplateFormField } from '@/interface/TicketTemplate';
import { FormFieldRenderer } from '@/components/common/FormFieldRenderer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2 } from 'lucide-react';

interface StepFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
  fields: TemplateFormField[];
  stepName: string;
  stepDescription: string;
  initialData?: { [key: string]: any };
  allSteps?: { name: string; data: Record<string, any>; fields: TemplateFormField[] }[];
  currentStepIndex: number;
  isCompleted?: boolean;
}

export function StepForm({ isOpen, onClose, onSubmit, fields, stepName, stepDescription, initialData, allSteps, currentStepIndex, isCompleted }: StepFormProps) {
  const { t } = useTranslation();

  const formSchema = z.object(
    fields.reduce((acc, field) => {
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
      } else if (field.type === 'time') {
        validator = z.string().min(1, 'Please select a time');
      } else if (field.type === 'datetime') {
        validator = z.string().min(1, 'Please select a date and time');
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
    defaultValues: fields.reduce((acc, field) => ({
      ...acc,
      [field.id]: initialData?.[field.id] ?? (field.type === 'checkbox' ? false : '')
    }), {})
  });

  const [isDirty, setIsDirty] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [activeTab, setActiveTab] = useState(stepName);

  useEffect(() => {
    setActiveTab(stepName);
  }, [stepName]);

  useEffect(() => {
    const subscription = form.watch(() => setIsDirty(form.formState.isDirty));
    return () => subscription.unsubscribe();
  }, [form]);

  const handleClose = () => {
    if (isDirty) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  };

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
    setIsDirty(false);
    onClose();
  });

  const handleConfirmClose = () => {
    form.reset(fields.reduce((acc, field) => ({
      ...acc,
      [field.id]: initialData?.[field.id] ?? (field.type === 'checkbox' ? false : '')
    }), {}));
    setShowConfirmClose(false);
    setIsDirty(false);
    onClose();
  };

  const renderField = (field: TemplateFormField, isReadOnly: boolean = false, data?: Record<string, any>) => {
    return (
      <div key={field.id} className={`${field.width === '1/4' ? 'w-[calc(25%-12px)]' : field.width === '1/3' ? 'w-[calc(33.333%-12px)]' : field.width === '1/2' ? 'w-[calc(50%-12px)]' : 'w-full'}`}>
        <FormFieldRenderer field={field} form={form} isPreview={isReadOnly} initialValue={data?.[field.id]} />
      </div>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{stepName}</DialogTitle>
            <DialogDescription>
              {stepDescription}
            </DialogDescription>
          </DialogHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start">
              {(allSteps || []).map((step, index) => (
                <TabsTrigger
                  key={index}
                  value={step.name}
                  className="flex items-center gap-2"
                >
                  {step.name}
                  {(index < currentStepIndex || (step.data && Object.keys(step.data).length > 0)) && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            <Form {...form}>
              <form onSubmit={handleSubmit} className="space-y-6">
                {(allSteps || []).map((step, index) => (
                  <TabsContent key={index} value={step.name} className="space-y-6">
                    <div className="space-y-6">
                      <div className="flex flex-wrap gap-4">
                        {step.fields.map(field => renderField(
                          field,
                          index < currentStepIndex || isCompleted,
                          step.data
                        ))}
                      </div>
                      {index === currentStepIndex && !isCompleted && (
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={handleClose}>
                            {t('common.cancel')}
                          </Button>
                          <Button type="button" variant="secondary" onClick={() => {
                            const data = form.getValues();
                            onSubmit({ ...data, isDraft: true });
                            setIsDirty(false);
                            onClose();
                          }}>
                            {t('tickets.form.saveDraft')}
                          </Button>
                          <Button type="submit">
                            {t('tickets.form.submit')}
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </form>
            </Form>
        </Tabs>
      </DialogContent>
    </Dialog >

      <Dialog open={showConfirmClose} onOpenChange={setShowConfirmClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('common.unsavedChanges')}</DialogTitle>
            <DialogDescription>
              {t('common.unsavedChangesDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setShowConfirmClose(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleConfirmClose}>
              {t('common.discard')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}