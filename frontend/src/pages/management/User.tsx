import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserList } from '@/components/user/UserList';
import { RoleList } from '@/components/user/RoleList';
import { ReportingList } from '@/components/user/ReportingList';

export default function UserManagement() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t('user.title')}</h1>
          <p className="">{t('user.subtitle')}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">{t('user.tabs.users')}</TabsTrigger>
          <TabsTrigger value="roles">{t('user.tabs.roles')}</TabsTrigger>
          <TabsTrigger value="reporting">{t('user.tabs.reporting')}</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('user.management.title')}</CardTitle>
              <CardDescription>
                {t('user.management.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('user.roles.title')}</CardTitle>
              <CardDescription>
                {t('user.roles.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RoleList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reporting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('user.reporting.title')}</CardTitle>
              <CardDescription>
                {t('user.reporting.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReportingList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}