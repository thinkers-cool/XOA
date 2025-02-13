import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus, Shield } from 'lucide-react';
import { roleApi } from '@/lib/api';
import { Role } from '@/interface/Role';
import { RoleForm } from '@/components/user/RoleForm';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export function RoleList() {
  const { t } = useTranslation();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userCounts, setUserCounts] = useState<Record<number, number>>({});
  const [selectedRole, setSelectedRole] = useState<Role | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await roleApi.getAll();
        setRoles(data);
        // Fetch user counts for each role
        const counts = await Promise.all(data.map(role => fetchUserCount(role.id)));
        const countsMap = data.reduce((acc, role, index) => {
          acc[role.id] = counts[index];
          return acc;
        }, {} as Record<number, number>);
        setUserCounts(countsMap);
      } catch (err) {
        setError('Failed to fetch roles');
        console.error('Error fetching roles:', err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchRoles();
  }, []);

  const fetchUserCount = async (roleId: number) => {
    try {
      const data = await roleApi.getUserById(roleId);
      return data.length;
    } catch (err) {
      console.error('Error fetching user count:', err);
      return 0;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">{t('common.loading')}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-destructive">{error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDelete = async (roleId: number) => {
    try {
      // Check if role has any users before deletion
      const userCount = await fetchUserCount(roleId);
      if (userCount) {
        setError('Cannot delete role with assigned users');
        return;
      }
      await roleApi.delete(roleId);
      setRoles(roles.filter(role => role.id !== roleId));
      setDeleteDialogOpen(false);
      setRoleToDelete(null);
    } catch (err) {
      console.error('Error deleting role:', err);
      setError('Failed to delete role');
    }
  };

  const handleCreateRole = async (data: any) => {
    try {
      const newRole = await roleApi.create(data);
      setRoles([...roles, newRole]);
      setIsFormOpen(false);
    } catch (err) {
      console.error('Error creating role:', err);
      setError('Failed to create role');
    }
  };

  const handleUpdateRole = async (data: any) => {
    try {
      if (!selectedRole?.id) return;
      const updatedRole = await roleApi.update(selectedRole.id, data);
      setRoles(roles.map(role => role.id === updatedRole.id ? updatedRole : role));
      setIsFormOpen(false);
    } catch (err) {
      console.error('Error updating role:', err);
      setError('Failed to update role');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedRole(undefined)}>
              <Plus className="mr-2 h-4 w-4" />
              {t('role.create.title')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedRole ? t('role.edit.title') : t('role.create.title')}</DialogTitle>
              <DialogDescription>
                {selectedRole ? t('role.edit.description') : t('role.create.description')}
              </DialogDescription>
            </DialogHeader>
            <RoleForm
              role={selectedRole}
              onSubmit={selectedRole ? handleUpdateRole : handleCreateRole}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
          <div className="relative w-full overflow-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="py-4 font-semibold whitespace-nowrap text-center">{t('role.list.name')}</TableHead>
                  <TableHead className="font-semibold whitespace-nowrap text-center">{t('role.list.description')}</TableHead>
                  <TableHead className="font-semibold whitespace-nowrap text-center">{t('role.list.permissions')}</TableHead>
                  <TableHead className="font-semibold whitespace-nowrap text-center">{t('role.list.users')}</TableHead>
                  <TableHead className="text-right font-semibold whitespace-nowrap">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id} className="hover:bg-muted/50">
                    <TableCell className="py-3 font-medium text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Shield className="h-4 w-4" />
                        {role.name}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-center">{role.description}</TableCell>
                    <TableCell className="py-3 text-center">
                      <div className="flex flex-wrap justify-center gap-1">
                        {role.permissions.map((permission) => (
                          <Badge key={permission} variant="secondary">
                            {t(`role.permission.${permission}`)}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-center">{userCounts[role.id] ? userCounts[role.id] : 0}</TableCell>
                    <TableCell className="py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedRole(role);
                            setIsFormOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => {
                                setRoleToDelete(role);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('role.delete.title')}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t('role.delete.description', { name: roleToDelete?.name })}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => roleToDelete?.id && handleDelete(roleToDelete.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {t('common.delete')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
    </div>
  );
}