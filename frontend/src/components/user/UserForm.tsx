import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent } from '@/components/ui/select';
import { roleApi, userApi } from '@/lib/api';
import { User } from '@/interface/User';
import { Role } from '@/interface/Role';

const userFormSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  is_active: z.boolean(),
  role: z.object({
    role_id: z.number(),
    reports_to_id: z.number().nullable()
  }).optional()
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  user?: User;
  onSubmit: (data: UserFormValues) => void;
  onCancel: () => void;
}

export function UserForm({ user, onSubmit, onCancel }: UserFormProps) {
  const { t } = useTranslation();
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      full_name: user?.full_name || '',
      username: user?.username || '',
      email: user?.email || '',
      is_active: user?.is_active ?? true,
      role: undefined
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rolesData, usersData] = await Promise.all([
          roleApi.getAll(),
          userApi.getAll()
        ]);
        setRoles(rolesData);
        setUsers(usersData);

        if (user) {
          const userRoles = await userApi.getRoleById(user.id!);
          if (userRoles.length > 0) {
            form.setValue('role', userRoles[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, form]);

  const handleSubmit = (data: UserFormValues) => {
    onSubmit(data);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-muted-foreground">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('user.form.fullName')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('user.form.username')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('user.form.email')}</FormLabel>
              <FormControl>
                <Input {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!user && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('user.form.password')}</FormLabel>
                <FormControl>
                  <Input {...field} type="password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>{t('user.form.isActive')}</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <div className="space-y-2">
                  <FormLabel>{t('user.form.role')}</FormLabel>
                  <Select
                    value={field.value?.role_id?.toString() || ""}
                    onValueChange={(value) => {
                      field.onChange({ role_id: parseInt(value), reports_to_id: null });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('user.form.selectRole')} />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          <div className="flex flex-col gap-1">
                            <div className="font-medium">{role.name}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {field.value && (
                  <div className="space-y-2">
                    <FormLabel>{t('user.form.manager')}</FormLabel>
                    <Select
                      value={field.value.reports_to_id?.toString() || ""}
                      onValueChange={(value) => {
                        field.onChange({
                          ...field.value,
                          reports_to_id: value ? parseInt(value) : null
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('user.form.selectManager')} />
                      </SelectTrigger>
                      <SelectContent>
                        {users
                          .filter(u => u.id !== user?.id)
                          .map(u => (
                            <SelectItem key={u.id} value={u.id!.toString()}>
                              {u.full_name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="neutral"
            onClick={onCancel}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
          >
            {user ? t('common.save') : t('common.create')}
          </Button>
        </div>
      </form>
    </Form>
  );
}