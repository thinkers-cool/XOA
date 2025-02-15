import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';
import { userApi } from '@/lib/api';

export default function Register() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        full_name: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError(t('auth.register.passwordMismatch'));
            return;
        }

        try {
            setLoading(true);
            await userApi.create({
                email: formData.email,
                username: formData.username,
                full_name: formData.full_name,
                password: formData.password
            });
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.detail || t('auth.register.error'));
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-[400px]">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">{t('auth.register.title')}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        {t('auth.register.description')}
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="username" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {t('auth.register.usernameLabel')}
                            </label>
                            <Input
                                id="username"
                                type="text"
                                name="username"
                                placeholder=""
                                value={formData.username}
                                onChange={handleChange}
                                required
                                className="transition-colors focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="full_name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {t('auth.register.fullNameLabel')}
                            </label>
                            <Input
                                id="full_name"
                                type="text"
                                name="full_name"
                                placeholder=""
                                value={formData.full_name}
                                onChange={handleChange}
                                required
                                className="transition-colors focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {t('auth.register.emailLabel')}
                            </label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                placeholder=""
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="transition-colors focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {t('auth.register.passwordLabel')}
                            </label>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                placeholder=""
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="transition-colors focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {t('auth.register.confirmPasswordLabel')}
                            </label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                name="confirmPassword"
                                placeholder=""
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className="transition-colors focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            />
                        </div>
                        {error && (
                            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-2 animate-in fade-in duration-300">
                                <AlertCircle className="h-5 w-5" />
                                <span>{error}</span>
                            </div>
                        )}
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? t('auth.register.registering') : t('auth.register.submit')}
                        </Button>
                        <div className="text-center text-sm">
                            <span className="text-muted-foreground">{t('auth.register.haveAccount')} </span>
                            <Button variant="link" className="p-0 h-auto font-normal" onClick={() => navigate('/login')}>
                                {t('auth.register.loginLink')}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}