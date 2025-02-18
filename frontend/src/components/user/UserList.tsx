import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Trash2, UserRoundCog, Plus, UsersRound } from 'lucide-react';
import { roleApi, userApi, API_BASE_URL } from '@/lib/api';
import { User, UserRole } from '@/interface/User';
import { Role } from '@/interface/Role';
import { UserForm } from '@/components/user/UserForm';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { usePermissions, PERMISSIONS } from '@/hooks/usePermissions';

export function UserList() {
    const { t } = useTranslation();
    const { hasPermission, fetchUserPermissions } = usePermissions();
    const [users, setUsers] = useState<User[]>([]);
    const [userRoles, setUserRoles] = useState<Record<number, UserRole[]>>({});
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | undefined>();
    const [isFormOpen, setIsFormOpen] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            await fetchUserPermissions();
            try {
                const data = await userApi.getAll();
                setUsers(data);
                const rolePromises = data.map(user => userApi.getRoleById(user.id));
                const userRolesData = await Promise.all(rolePromises);
                const rolesMap: Record<number, UserRole[]> = {};
                data.forEach((user, index) => {
                    rolesMap[user.id] ? rolesMap[user.id].concat(userRolesData[index]) : rolesMap[user.id] = userRolesData[index];
                });
                setUserRoles(rolesMap);
            } catch (err) {
                setError('Failed to fetch users');
                console.error('Error fetching users:', err);
            } finally {
                setLoading(false);
            }
        };
        const fetchRoles = async () => {
            try {
                const data = await roleApi.getAll();
                setRoles(data);
            } catch (err) {
                setError('Failed to fetch roles');
                console.error('Error fetching roles:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
        fetchRoles();
    }, []);

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center h-32">
                    <div className="text-muted-foreground">{t('common.loading')}</div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center h-32">
                    <div className="text-destructive">{error}</div>
                </CardContent>
            </Card>
        );
    }

    const handleDelete = async (userId: number) => {
        if (!hasPermission(PERMISSIONS.USER.DELETE)) return;
        try {
            await userApi.delete(userId);
            setUsers(users.filter(user => user.id !== userId));
        } catch (err) {
            console.error('Error deleting user:', err);
        }
    };

    const handleCreateUser = async (data: any) => {
        if (!hasPermission(PERMISSIONS.USER.CREATE)) return;
        try {
            const newUser = await userApi.create(data);
            if (data.role) {
                const userRoleData = await userApi.createRole(newUser.id, data.role);
                setUserRoles(prev => ({
                    ...prev,
                    [newUser.id]: [userRoleData]
                }));
            }
            setUsers([...users, newUser]);
            setIsFormOpen(false);
        } catch (err) {
            console.error('Error creating user:', err);
        }
    };

    const handleUpdateUser = async (data: any) => {
        if (!hasPermission(PERMISSIONS.USER.UPDATE)) return;
        try {
            if (!selectedUser?.id) return;
            const updatedUser = await userApi.update(selectedUser.id, data);
            setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
            await userApi.deleteRole(selectedUser.id);
            if (data.role) {
                const userRoleData = await userApi.createRole(updatedUser.id, data.role);
                setUserRoles(prev => ({
                    ...prev,
                    [selectedUser.id]: [userRoleData]
                }));
            }
            setIsFormOpen(false);
        } catch (err) {
            console.error('Error updating user:', err);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end mb-4">
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    {hasPermission(PERMISSIONS.USER.CREATE) && (
                        <DialogTrigger asChild>
                            <Button onClick={() => setSelectedUser(undefined)}>
                                <Plus className="mr-2 h-4 w-4" />
                                {t('user.create.title')}
                            </Button>
                        </DialogTrigger>
                    )}
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>{selectedUser ? t('user.edit.title') : t('user.create.title')}</DialogTitle>
                            <DialogDescription>
                                {selectedUser ? t('user.edit.description') : t('user.create.description')}
                            </DialogDescription>
                        </DialogHeader>
                        <UserForm
                            user={selectedUser}
                            onSubmit={selectedUser ? handleUpdateUser : handleCreateUser}
                            onCancel={() => setIsFormOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>
            <div className="relative w-full overflow-auto rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="py-4 font-semibold whitespace-nowrap text-center">{t('user.list.fullName')}</TableHead>
                            <TableHead className="font-semibold whitespace-nowrap text-center">{t('user.list.username')}</TableHead>
                            <TableHead className="font-semibold whitespace-nowrap text-center">{t('user.list.email')}</TableHead>
                            <TableHead className="font-semibold whitespace-nowrap text-center">{t('user.list.roles')}</TableHead>
                            <TableHead className="font-semibold whitespace-nowrap text-center">{t('user.list.reportsTo')}</TableHead>
                            <TableHead className="font-semibold whitespace-nowrap text-center">{t('user.list.status')}</TableHead>
                            <TableHead className="text-right font-semibold whitespace-nowrap">{t('common.actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} className="hover:bg-muted/50">
                                <TableCell className="py-3 font-medium text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage
                                                src={user.avatar_url ? `${API_BASE_URL}${user.avatar_url}` : undefined}
                                                alt={user.full_name}
                                                className="h-full w-full object-cover"
                                            />
                                            <AvatarFallback>{user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <span>{user.full_name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-3 text-center">{user.username}</TableCell>
                                <TableCell className="py-3 text-center">{user.email}</TableCell>
                                <TableCell className="py-3 text-center">
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {userRoles[user.id] && userRoles[user.id].map((userRole) => {
                                            const roleName = roles.find((role) => role.id === userRole.role_id)?.name;
                                            return (
                                                <div
                                                    key={userRole.role_id}
                                                    className="flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                                >
                                                    <UsersRound className='w-3.5 h-3.5' />
                                                    {roleName}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </TableCell>
                                <TableCell className="py-3 text-center">
                                    <div className="flex flex-wrap gap-1.5 justify-center">
                                        {userRoles[user.id] && userRoles[user.id].map((userRole) => (
                                            userRole.reports_to_id && (
                                                <Badge
                                                    key={userRole.id}
                                                    variant="outline"
                                                    className="hover:bg-primary/10 transition-colors cursor-default py-1 px-2"
                                                >
                                                    {users.find((u) => u.id === userRole.reports_to_id)?.full_name}
                                                </Badge>
                                            )
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell className="py-3 text-center">
                                    <Badge
                                        variant={user.is_active ? 'default' : 'secondary'}
                                        className="px-2 py-1"
                                    >
                                        {t(`user.status.${user.is_active ? 'active' : 'inactive'}`)}
                                    </Badge>
                                </TableCell>
                                <TableCell className="py-3 text-center">
                                    <div className="flex justify-end gap-1">
                                        {hasPermission(PERMISSIONS.USER.UPDATE) &&
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setIsFormOpen(true);
                                                }}
                                            >
                                                <UserRoundCog className="h-4 w-4" />
                                            </Button>
                                        }
                                        {hasPermission(PERMISSIONS.USER.DELETE) &&
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>{t('user.delete.title')}</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            {t('user.delete.description', { name: user.full_name })}
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(user.id!)}
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        >
                                                            {t('common.delete')}
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        }
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