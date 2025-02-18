import { ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LayoutDashboard, Ticket, Settings, ChevronRight, User as UserIcon, Sun, Moon } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { API_BASE_URL } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import Thinkers from '@/assets/Thinkers.svg';

interface LayoutProps {
  children: ReactNode;
}

interface NavItem {
  name: string;
  href?: string;
  icon?: any;
  children?: NavItem[];
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const navigation: NavItem[] = [
    {
      name: t('navigation.overview.title'),
      icon: LayoutDashboard,
      children: [
        { name: t('navigation.overview.insights'), href: '/insights' },
      ]
    },
    {
      name: t('navigation.tickets.title'),
      icon: Ticket,
      children: [
        { name: t('navigation.tickets.opened'), href: '/tickets/opened' },
        { name: t('navigation.tickets.closed'), href: '/tickets/closed' }
      ]
    },
    {
      name: t('navigation.management.title'),
      icon: Settings,
      children: [
        { name: t('navigation.management.resource'), href: '/management/resource' },
        { name: t('navigation.management.template'), href: '/management/template' },
        { name: t('navigation.management.users'), href: '/management/users' }
      ]
    }
  ];

  const isItemSelected = (item: NavItem): boolean => {
    if (item.href) {
      return location.pathname === item.href;
    }
    return item.children?.some(child => location.pathname === child.href) || false;
  };

  const toggleExpand = (name: string) => {
    setExpandedItems(prev =>
      prev.includes(name) ? prev.filter(item => item !== name) : [...prev, name]
    );
  };

  const renderNavItem = (item: NavItem) => {
    const isSelected = isItemSelected(item);
    const isExpanded = expandedItems.includes(item.name);
    const Icon = item.icon;

    return (
      <li key={item.name}>
        <Button
          variant={isSelected ? "neutral" : null}
          className={`w-full justify-between ${isCollapsed ? 'px-3' : ''}`}
          onClick={() => item.children ? toggleExpand(item.name) : navigate(item.href!)}
        >
          <div className="flex items-center">
            {Icon && <Icon className="mr-3 h-8 w-8" />}
            {!isCollapsed && <span>{item.name}</span>}
          </div>
          {item.children && !isCollapsed && (
            <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          )}
        </Button>
        {item.children && isExpanded && !isCollapsed && (
          <ul className="mt-1 space-y-1 pl-7">
            {item.children.map(child => (
              <li key={child.name}>
                <Button
                  variant={location.pathname === child.href ? "default" : null}
                  className="w-full justify-start"
                  onClick={() => navigate(child.href!)}
                >
                  {child.name}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 z-50 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-56'}`}>
          <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-border bg-background px-3 pb-4 sidebar-content">
            <div className="flex h-16 shrink-0 items-center justify-center px-2">
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8">
                  <img src={Thinkers} alt="Logo" className="w-8 h-8" />
                </div>
                {!isCollapsed && <h1 className="text-2xl font-semibold">XOA</h1>}
              </div>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="space-y-1">
                    {navigation.map(renderNavItem)}
                  </ul>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className={`transition-all duration-300 w-full ${isCollapsed ? 'pl-16' : 'pl-56'}`}>
          <div className="fixed top-0 right-0 flex h-16 items-center justify-between px-4 border-b border-border bg-background z-40" style={{ width: `calc(100% - ${isCollapsed ? '4rem' : '14rem'})` }}>
            <div className="flex items-center gap-4">
              <Button
                variant={null}
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-9 w-9 hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`} />
              </Button>
              <div className="relative w-96">
                <Input
                  type="text"
                  placeholder={t('common.search')}
                  className="w-full h-9 px-3 py-2 bg-background text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSelector />
              <Button
                variant={null}
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-9 w-9"
              >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant={null} size="icon" className="h-8 w-8 rounded-full overflow-hidden p-0">
                    {user?.avatar_url ? (
                      <img
                        src={`${API_BASE_URL}${user.avatar_url}`}
                        alt={user.full_name || user.username}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '';
                          e.currentTarget.className = 'hidden';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-primary text-primary-foreground">
                        {user ? getInitials(user.full_name || user.username) : <UserIcon className="h-5 w-5" />}
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/user/preferences')}>
                    {t('common.userPreferences')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/user/profile')}>
                    {t('common.profile')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    logout();
                    navigate('/login');
                  }}>
                    {t('common.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <main className="pt-24 px-4">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}