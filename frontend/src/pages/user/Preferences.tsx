import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePreferences } from '@/hooks/usePreferences';

export default function UserPreferences() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { 
    notificationSettings, 
    displaySettings, 
    updateNotificationSettings, 
    updateDisplaySettings, 
    updatePreferences 
  } = usePreferences();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{t('preferences.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('preferences.subtitle')}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Interface Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>{t('preferences.interface.title')}</CardTitle>
            <CardDescription>{t('preferences.interface.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('preferences.interface.theme')}</Label>
                <p className="text-sm text-muted-foreground">{t('preferences.interface.themeDescription')}</p>
              </div>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('preferences.interface.selectTheme')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">{t('preferences.interface.light')}</SelectItem>
                  <SelectItem value="dark">{t('preferences.interface.dark')}</SelectItem>
                  <SelectItem value="system">{t('preferences.interface.system')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>{t('preferences.notifications.title')}</CardTitle>
            <CardDescription>{t('preferences.notifications.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('preferences.notifications.email')}</Label>
                <p className="text-sm text-muted-foreground">{t('preferences.notifications.emailDescription')}</p>
              </div>
              <Switch
                checked={notificationSettings.emailNotifications}
                onCheckedChange={(checked) => updateNotificationSettings({ emailNotifications: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('preferences.notifications.inApp')}</Label>
                <p className="text-sm text-muted-foreground">{t('preferences.notifications.inAppDescription')}</p>
              </div>
              <Switch
                checked={notificationSettings.inAppNotifications}
                onCheckedChange={(checked) => updateNotificationSettings({ inAppNotifications: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('preferences.notifications.ticketUpdates')}</Label>
                <p className="text-sm text-muted-foreground">{t('preferences.notifications.ticketUpdatesDescription')}</p>
              </div>
              <Switch
                checked={notificationSettings.ticketUpdates}
                onCheckedChange={(checked) => updateNotificationSettings({ ticketUpdates: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('preferences.notifications.systemAnnouncements')}</Label>
                <p className="text-sm text-muted-foreground">{t('preferences.notifications.systemAnnouncementsDescription')}</p>
              </div>
              <Switch
                checked={notificationSettings.systemAnnouncements}
                onCheckedChange={(checked) => updateNotificationSettings({ systemAnnouncements: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Display Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>{t('preferences.display.title')}</CardTitle>
            <CardDescription>{t('preferences.display.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('preferences.display.timezone')}</Label>
                <p className="text-sm text-muted-foreground">{t('preferences.display.timezoneDescription')}</p>
              </div>
              <Select
                value={displaySettings.timezone}
                onValueChange={(value) => updateDisplaySettings({ timezone: value })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('preferences.display.selectTimezone')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">{t('preferences.display.autoTimezone')}</SelectItem>
                  <SelectItem value="utc">UTC</SelectItem>
                  <SelectItem value="local">{t('preferences.display.localTimezone')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('preferences.display.dateFormat')}</Label>
                <p className="text-sm text-muted-foreground">{t('preferences.display.dateFormatDescription')}</p>
              </div>
              <Select
                value={displaySettings.dateFormat}
                onValueChange={(value) => updateDisplaySettings({ dateFormat: value })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('preferences.display.selectDateFormat')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">{t('preferences.display.twelveHour')}</SelectItem>
                  <SelectItem value="24h">{t('preferences.display.twentyfourHour')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('preferences.display.numberFormat')}</Label>
                <p className="text-sm text-muted-foreground">{t('preferences.display.numberFormatDescription')}</p>
              </div>
              <Select
                value={displaySettings.numberFormat}
                onValueChange={(value) => updateDisplaySettings({ numberFormat: value })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('preferences.display.selectNumberFormat')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">{t('preferences.display.standardFormat')}</SelectItem>
                  <SelectItem value="compact">{t('preferences.display.compactFormat')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            onClick={updatePreferences}
          >
            {t('preferences.saveChanges')}
          </Button>
        </div>
      </div>
    </div>
  );
}