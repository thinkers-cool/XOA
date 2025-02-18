import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import '@/styles/cropper.css';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { api, userApi, roleApi, API_BASE_URL } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';
import { Role } from '@/interface/Role';

export default function UserProfile() {
    const navigate = useNavigate();
    const { user, logout, fetchCurrentUser } = useAuth();
    const [ userRoles, setUserRoles ] = useState<Role[]>([]);
    const [cropDialogOpen, setCropDialogOpen] = useState(false);
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [imageSrc, setImageSrc] = useState<string>('');
    const [cropper, setCropper] = useState<Cropper>();
    const [profileError, setProfileError] = useState('');
    const [passwordErrors, setPasswordErrors] = useState<{
        current_password?: string;
        new_password?: string;
        confirm_password?: string;
    }>({});
    const [profileSuccess, setProfileSuccess] = useState('');
    const [formData, setFormData] = useState<{
        email: string;
        username: string;
        full_name: string;
        current_password?: string;
        new_password?: string;
        confirm_password?: string;
        showCurrentPassword?: boolean;
        showNewPassword?: boolean;
        showConfirmPassword?: boolean;
    }>({        
        email: '',
        username: '',
        full_name: '',
        showCurrentPassword: false,
        showNewPassword: false,
        showConfirmPassword: false
    });
    const [pendingAvatarBlob, setPendingAvatarBlob] = useState<Blob | null>(null);
    const [previewAvatarBlob, setPreviewAvatarBlob] = useState<Blob | null>(null);
    const [avatarTimestamp, setAvatarTimestamp] = useState('');
    const { t } = useTranslation();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchUserRoles = async () => {
            try {
                const userroles = await userApi.getRoleById(user.id!);
                // get role for each userrole by using roleApi.getById
                const roles = await Promise.all(userroles.map(async (userrole) => {
                    return await roleApi.getById(userrole.role_id);
                }));
                setUserRoles(roles);
            } catch (err) {
                console.error('Error fetching user roles:', err);
            } finally {
            }
        };

        setFormData({
            email: user.email,
            username: user.username,
            full_name: user.full_name || ''
        });

        fetchUserRoles();
    }, [user, navigate]);



    const validatePasswordForm = () => {
        const newErrors: typeof passwordErrors = {};

        if (!formData.current_password?.trim()) {
            newErrors.current_password = 'Current password is required';
        }

        if (!formData.new_password?.trim()) {
            newErrors.new_password = 'New password is required';
        }

        if (!formData.confirm_password?.trim()) {
            newErrors.confirm_password = 'Please confirm your new password';
        } else if (formData.new_password !== formData.confirm_password) {
            newErrors.confirm_password = 'New passwords do not match';
        }

        setPasswordErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: typeof passwordErrors = {};
        
        if (!validatePasswordForm()) {
            return;
        }

        try {
            if (!user) return;

            await api.put(`/users/${user.id}/password`, {
                current_password: formData.current_password,
                new_password: formData.new_password
            });

            setFormData(prev => ({
                ...prev,
                current_password: '',
                new_password: '',
                confirm_password: ''
            }));

            setPasswordDialogOpen(false);
            setPasswordErrors(newErrors);
        } catch (err: any) {
            let errorMessage = t('profile.messages.passwordError.default');
            if (err && typeof err === 'object' && 'response' in err) {
                const error = err as { response?: { status: number; data?: { detail?: string } } };
                if (error.response) {
                    switch (error.response.status) {
                        case 400:
                            errorMessage = error.response.data?.detail || 'Invalid password format';
                            break;
                        case 401:
                            errorMessage = 'Current password is incorrect';
                            break;
                        case 403:
                            errorMessage = 'Not authorized to change password';
                            break;
                        case 404:
                            errorMessage = 'User not found';
                            break;
                        case 500:
                            errorMessage = 'Server error occurred';
                            break;
                        default:
                            errorMessage = error.response.data?.detail || 'Failed to update password';
                    }
                }
            }
            newErrors.current_password = errorMessage;
            setPasswordErrors(newErrors);
        } finally {
            
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileError('');
        setProfileSuccess('');

        try {
            if (!user) return;

            if (formData.new_password && formData.new_password !== formData.confirm_password) {
                setProfileError('New passwords do not match');
                return;
            }

            // First update the profile information
            await api.put(`/users/${user.id}`, {
                email: formData.email,
                username: formData.username,
                full_name: formData.full_name
            });

            // If there's a pending avatar update, handle it
            if (pendingAvatarBlob) {
                const avatarFormData = new FormData();
                avatarFormData.append('file', pendingAvatarBlob, 'avatar.jpg');

                await api.put(`/users/${user.id}/avatar`, avatarFormData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                setPendingAvatarBlob(null);
            }

            // Handle password change if provided
            if (formData.current_password && formData.new_password) {
                await api.put(`/users/${user.id}/password`, {
                    current_password: formData.current_password,
                    new_password: formData.new_password
                });
                // Clear password fields after successful update
                setFormData(prev => ({
                    ...prev,
                    current_password: '',
                    new_password: ''
                }));
            }

            // Refresh user data using fetchCurrentUser
            await fetchCurrentUser(t);

            setProfileSuccess(t('profile.messages.updateSuccess'));
        } catch (err: any) {
            setProfileError(err.response?.data?.detail || t('profile.messages.updateError'));
        } finally {
        }
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const image = e.target.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                setImageSrc(reader.result as string);
                setCropDialogOpen(true);
            };
            reader.readAsDataURL(image);
        }
    };

    const getCroppedImg = async (): Promise<{ previewBlob: Blob; uploadBlob: Blob }> => {
        if (!cropper) throw new Error('Cropper is not initialized');

        const uploadCanvas = cropper.getCroppedCanvas();
        const previewCanvas = cropper.getCroppedCanvas({
            width: 128,
            height: 128
        });

        return new Promise((resolve) => {
            Promise.all([
                new Promise<Blob>((res) => {
                    previewCanvas.toBlob(
                        (blob) => {
                            if (!blob) throw new Error('Preview canvas is empty');
                            res(blob);
                        },
                        'image/png',
                        1
                    );
                }),
                new Promise<Blob>((res) => {
                    uploadCanvas.toBlob(
                        (blob) => {
                            if (!blob) throw new Error('Upload canvas is empty');
                            res(blob);
                        },
                        'image/png',
                        1
                    );
                })
            ]).then(([previewBlob, uploadBlob]) => {
                resolve({ previewBlob, uploadBlob });
            });
        });
    };

    const handleCropComplete = async () => {
        try {
            const { previewBlob, uploadBlob } = await getCroppedImg();
            setCropDialogOpen(false);
            setPendingAvatarBlob(uploadBlob);
            setPreviewAvatarBlob(previewBlob);
            setAvatarTimestamp(`?t=${Date.now()}`);
            setProfileSuccess(t('profile.messages.avatarSuccess'));
        } catch (err: any) {
            setProfileError(t('profile.messages.avatarError'));
        } finally {
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase();
    };

    if (!user) return null;

    return (
        <div className="container mx-auto py-8 px-4">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">{t('profile.title')}</h1>
                        <p className="text-muted-foreground mt-1">{t('profile.subtitle')}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="neutral"
                            onClick={() => setPasswordDialogOpen(true)}
                            className="hover:bg-muted/50 transition-colors"
                        >
                            {t('profile.password.change')}
                        </Button>
                        <Button variant="neutral" onClick={handleLogout} className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-colors">
                            {t('profile.actions.logout')}
                        </Button>
                    </div>
                </div>


            <Card className="shadow-sm">
                <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10">
                        <div className="flex flex-col items-center space-y-6">
                            <div className="relative group">
                                <Avatar className="h-40 w-40 overflow-hidden ring-2 ring-border ring-offset-2 ring-offset-background transition-all duration-300 group-hover:ring-primary">
                                    <AvatarImage 
                                        src={previewAvatarBlob ? URL.createObjectURL(previewAvatarBlob) : 
                                            (user.avatar_url ? `${API_BASE_URL}${user.avatar_url}${avatarTimestamp}` : undefined)} 
                                        alt={user.full_name}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" 
                                    />
                                    <AvatarFallback className="text-2xl">{getInitials(user.full_name || user.username)}</AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-2 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <Input
                                        type="file"
                                        accept="image/jpeg,image/png,image/gif"
                                        className="hidden"
                                        id="avatar-upload"
                                        onChange={handleImageSelect}
                                    />
                                    <label htmlFor="avatar-upload">
                                        <Button
                                            type="button"
                                            variant="neutral"
                                            size="icon"
                                            className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                                            asChild
                                        >
                                            <span className="text-lg">{'📷'}</span>
                                        </Button>
                                    </label>
                                </div>
                            </div>
                            <div className="text-center space-y-1.5">
                                <h3 className="text-xl font-semibold">{user.full_name || user.username}</h3>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                        </div>
                        <div>
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 pb-2 border-b">
                                        <h3 className="text-xl font-semibold">{t('profile.personalInfo.title')}</h3>
                                    </div>
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">{t('profile.personalInfo.fullName')}</label>
                                            <Input
                                                type="text"
                                                name="full_name"
                                                value={formData.full_name}
                                                onChange={handleChange}
                                                required
                                                className="transition-all duration-300 focus:ring-2 focus:ring-primary"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">{t('profile.personalInfo.username')}</label>
                                            <Input
                                                type="text"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                required
                                                className="transition-all duration-300 focus:ring-2 focus:ring-primary"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 pb-2 border-b">
                                        <h3 className="text-xl font-semibold">{t('profile.contactInfo.title')}</h3>
                                    </div>
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">{t('profile.contactInfo.email')}</label>
                                            <Input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="transition-all duration-300 focus:ring-2 focus:ring-primary"
                                            />
                                        </div>
                                    </div>
                                </div>
                                {profileError && (
                                    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive animate-in fade-in duration-300">
                                        {profileError}
                                    </div>
                                )}
                                {profileSuccess && (
                                    <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-600 animate-in fade-in duration-300">
                                        {profileSuccess}
                                    </div>
                                )}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 pb-2 border-b">
                                        <h3 className="text-xl font-semibold">{t('profile.permissions.title')}</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-4">
                                            {userRoles.map(role => (
                                                <div key={role.id} className="space-y-2">
                                                    <span className="inline-block px-3 py-1 text-sm font-semibold rounded-full bg-primary/10 text-primary">
                                                        {role.name}
                                                    </span>
                                                    <div className="flex flex-wrap gap-2">
                                                        {role.permissions.map(permission => (
                                                            <Badge key={permission} variant="neutral" className="px-3 py-1 text-xs font-semibold rounded-full bg-muted text-muted-foreground">
                                                                {t(`role.permission.${permission}`)}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <Button
                                        type="submit"
                                        className="min-w-[120px] transition-all duration-300"
                                    >
                                        {t('profile.actions.update')}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
                <DialogContent className="max-w-[500px] w-[100vw]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">{t('profile.avatar.crop')}</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-6 overflow-y-auto p-4">
                        {imageSrc && (
                            <div className="w-full aspect-square rounded-lg overflow-hidden border-2 border-dashed border-border">
                                <Cropper
                                    src={imageSrc}
                                    style={{ width: '100%', height: '100%' }}
                                    aspectRatio={1}
                                    guides={true}
                                    dragMode="move"
                                    cropBoxMovable={true}
                                    cropBoxResizable={true}
                                    onInitialized={(instance) => setCropper(instance)}
                                    rotatable={true}
                                    restore={true}
                                />
                            </div>
                        )}
                        <div className="flex justify-end gap-3 w-full">
                            <Button
                                variant="neutral"
                                size="sm"
                                onClick={() => {
                                    setCropDialogOpen(false);
                                    setImageSrc('');
                                }}
                                className="min-w-[100px]"
                            >
                                {t('profile.avatar.cancel')}
                            </Button>
                            <Button
                                variant="default"
                                size="sm"
                                onClick={handleCropComplete}
                                className="min-w-[100px]"
                            >
                                {t('profile.avatar.apply')}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                <DialogContent className="max-w-[500px] w-[100vw]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">{t('profile.password.change')}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4 p-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('profile.password.current')}</label>
                            <div className="relative">
                                <Input
                                    type={formData.showCurrentPassword ? "text" : "password"}
                                    name="current_password"
                                    value={formData.current_password || ''}
                                    onChange={handleChange}
                                    required
                                    className={`transition-all duration-300 focus:ring-2 focus:ring-primary ${passwordErrors.current_password ? 'border-destructive ring-destructive' : ''}`}
                                />
                                <Button
                                    type="button"
                                    variant={null}
                                    size="icon"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                                    onClick={() => setFormData(prev => ({ ...prev, showCurrentPassword: !prev.showCurrentPassword }))}
                                >
                                    {formData.showCurrentPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            {passwordErrors.current_password && (
                                <p className="text-sm text-destructive">{passwordErrors.current_password}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('profile.password.new')}</label>
                            <div className="relative">
                                <Input
                                    type={formData.showNewPassword ? "text" : "password"}
                                    name="new_password"
                                    value={formData.new_password || ''}
                                    onChange={handleChange}
                                    required
                                    className={`transition-all duration-300 focus:ring-2 focus:ring-primary ${passwordErrors.new_password ? 'border-destructive ring-destructive' : ''}`}
                                />
                                <Button
                                    type="button"
                                    variant={null}
                                    size="icon"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                                    onClick={() => setFormData(prev => ({ ...prev, showNewPassword: !prev.showNewPassword }))}
                                >
                                    {formData.showNewPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            {passwordErrors.new_password && (
                                <p className="text-sm text-destructive">{passwordErrors.new_password}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('profile.password.confirm')}</label>
                            <div className="relative">
                                <Input
                                    type={formData.showConfirmPassword ? "text" : "password"}
                                    name="confirm_password"
                                    value={formData.confirm_password || ''}
                                    onChange={handleChange}
                                    required
                                    className={`transition-all duration-300 focus:ring-2 focus:ring-primary ${passwordErrors.confirm_password ? 'border-destructive ring-destructive' : ''}`}
                                />
                                <Button
                                    type="button"
                                    variant={null}
                                    size="icon"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                                    onClick={() => setFormData(prev => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }))}
                                >
                                    {formData.showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            {passwordErrors.confirm_password && (
                                <p className="text-sm text-destructive">{passwordErrors.confirm_password}</p>
                            )}
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="neutral"
                                onClick={() => setPasswordDialogOpen(false)}
                                className="min-w-[100px]"
                            >
                                {t('profile.avatar.cancel')}
                            </Button>
                            <Button
                                type="submit"
                                className="min-w-[100px]"
                            >
                                {t('preferences.saveChanges')}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}