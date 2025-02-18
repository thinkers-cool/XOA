import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { roleApi, userApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export const PERMISSIONS = {
    USER: {
        READ: 'user.read',
        CREATE: 'user.create',
        UPDATE: 'user.update',
        DELETE: 'user.delete',
    },
    ROLE: {
        READ: 'role.read',
        CREATE: 'role.create',
        UPDATE: 'role.update',
        DELETE: 'role.delete',
    },
    TICKET: {
        READ: 'ticket.read',
        CREATE: 'ticket.create',
        UPDATE: 'ticket.update',
        DELETE: 'ticket.delete',
    },
    TICKET_TEMPLATE: {
        READ: 'ticket_template.read',
        CREATE: 'ticket_template.create',
        UPDATE: 'ticket_template.update',
        DELETE: 'ticket_template.delete',
    },
    RESOURCE_TYPE: {
        READ: 'resource_type.read',
        CREATE: 'resource_type.create',
        UPDATE: 'resource_type.update',
        DELETE: 'resource_type.delete',
    },
    RESOURCE_ENTRY: {
        READ: 'resource_entry.read',
        CREATE: 'resource_entry.create',
        UPDATE: 'resource_entry.update',
        DELETE: 'resource_entry.delete',
    },
};

interface PermissionState {
    permissions: Set<string>;
    isPermissionsLoading: boolean;
    error: string | null;
    setPermissions: (permissions: Set<string>) => void;
    setIsLoading: (isPermissionsLoading: boolean) => void;
    setError: (error: string | null) => void;
    fetchUserPermissions: () => Promise<void>;
    hasPermission: (requiredPermission: string) => boolean;
    hasPermissions: (requiredPermissions: string[]) => boolean;
    hasAnyPermission: (requiredPermissions: string[]) => boolean;
    clearPermissions: () => void;
}

export const usePermissions = create<PermissionState>()(
    persist<PermissionState>(
        (set, get) => ({
            permissions: new Set<string>(),
            isPermissionsLoading: false,
            error: null,
            setPermissions: (permissions) => set({ permissions }),
            setIsLoading: (isPermissionsLoading) => set({ isPermissionsLoading }),
            setError: (error) => set({ error }),
            fetchUserPermissions: async () => {
                const auth = useAuth.getState();
                if (!auth.user?.id) {
                    set({ permissions: new Set<string>(), error: null });
                    return;
                }

                set({ isPermissionsLoading: true, error: null });
                try {
                    const userroles = await userApi.getRoleById(auth.user.id);
                    const roles = await Promise.all(
                        userroles.map(userrole => roleApi.getById(userrole.role_id))
                    );

                    const permissions = new Set<string>();
                    roles.forEach(role => {
                        if (role.permissions) {
                            role.permissions.forEach(permission => permissions.add(permission));
                        }
                    });

                    set({ permissions, error: null });
                } catch (err) {
                    console.error('Error fetching user permissions:', err);
                    set({ error: 'Failed to fetch permissions' });
                } finally {
                    set({ isPermissionsLoading: false });
                }
            },
            hasPermission: (requiredPermission) => {
                const { permissions } = get();
                return permissions.has('*') || permissions.has(requiredPermission);
            },
            hasPermissions: (requiredPermissions) => {
                return requiredPermissions.every(permission => get().hasPermission(permission));
            },
            hasAnyPermission: (requiredPermissions) => {
                return requiredPermissions.some(permission => get().hasPermission(permission));
            },
            clearPermissions: () => {
                set({ permissions: new Set<string>(), error: null });
            }
        }),
        {
            name: 'permissions-storage',
            partialize: (state) => ({
                permissions: state.permissions,
                isPermissionsLoading: state.isPermissionsLoading,
                error: state.error,
                setPermissions: state.setPermissions,
                setIsLoading: state.setIsLoading,
                setError: state.setError,
                fetchUserPermissions: state.fetchUserPermissions,
                hasPermission: state.hasPermission,
                hasPermissions: state.hasPermissions,
                hasAnyPermission: state.hasAnyPermission,
                clearPermissions: state.clearPermissions,
            }),
            merge: (persistedState: any, currentState: PermissionState) => ({
                ...currentState,
                ...persistedState,
                permissions: new Set(persistedState.permissions)
            })
        }
    )
);