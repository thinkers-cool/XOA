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
                            <label htmlFor="username" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {t('auth.login.usernameLabel')}
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
                            <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {t('auth.login.passwordLabel')}
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
                        <div className="text-center text-sm mt-4">
                            <span className="text-muted-foreground">{t('auth.login.noAccount')} </span>
                            <Button variant="neutral" className="p-0 h-auto font-normal" onClick={() => navigate('/register')}>
                                {t('auth.login.registerLink')}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}