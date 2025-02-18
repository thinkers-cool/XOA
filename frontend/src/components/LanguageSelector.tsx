import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe2, Languages } from 'lucide-react';

const languages = [
    { code: 'en', label: 'English', icon: Globe2 },
    { code: 'zh', label: '中文', icon: Languages },
];

export function LanguageSelector() {
    const { i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const currentLanguage = languages.find((lang) => lang.code === i18n.language);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={null} size="sm" className="flex items-center gap-2">
                    {currentLanguage ?
                        <currentLanguage.icon className="h-4 w-4" /> :
                        <Globe2 className="h-4 w-4" />
                    }
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className="flex items-center gap-2"
                    >
                        <lang.icon className="h-4 w-4" />
                        {lang.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}