import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Role } from '@/interface/Role';

const roleFormSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  description: z.string().min(1, 'Description is required'),
  permissions: z.array(z.string())
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

interface RoleFormProps {
  role?: Role;
  onSubmit: (data: RoleFormValues) => void;
  onCancel: () => void;
}

const AVAILABLE_PERMISSIONS = [
  'user.view',
  'user.create',
  'user.edit',
  'user.delete',
  'role.view',
  'role.create',
  'role.edit',
  'role.delete',
  'ticket.view',
  'ticket.create',
  'ticket.edit',
  'ticket.delete',
  'template.view',
  'template.create',
  'template.edit',
  'template.delete',
  'workflow.view',
  'workflow.create',
  'workflow.edit',
  'workflow.delete'
];

export function RoleForm({ role, onSubmit, onCancel }: RoleFormProps) {
  const { t } = useTranslation();

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: role?.name || '',
      description: role?.description || '',
      permissions: role?.permissions || []
    }
  });

  const handleSubmit = (data: RoleFormValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('role.form.name')}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('role.form.description')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>{t('role.form.permissions')}</FormLabel>
          <div className="grid grid-cols-2 gap-4">
            {AVAILABLE_PERMISSIONS.map((permission) => (
              <FormField
                key={permission}
                control={form.control}
                name="permissions"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(permission)}
                        onCheckedChange={(checked) => {
                          const updatedPermissions = checked
                            ? [...field.value, permission]
                            : field.value?.filter((p) => p !== permission);
                          field.onChange(updatedPermissions);
                        }}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        {t(`role.permission.${permission}`)}
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
          >
            {role ? t('common.save') : t('common.create')}
          </Button>
        </div>
      </form>
    </Form>
  );
}