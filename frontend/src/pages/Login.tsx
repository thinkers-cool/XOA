import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();
    const { user, login, userLoading, authError } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const {t} = useTranslation();

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await login(formData.username, formData.password, t);
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
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>{t('auth.login.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="text"
                                name="username"
                                placeholder={t('auth.login.username')}
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="password"
                                name="password"
                                placeholder={t('auth.login.password')}
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        {authError && (
                            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-2 animate-in fade-in duration-300">
                                <AlertCircle className="h-5 w-5" />
                                <span>{authError}</span>
                            </div>
                        )}
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={userLoading}
                        >
                            {userLoading ? t('auth.login.loggingIn') : t('auth.login.submit')}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}