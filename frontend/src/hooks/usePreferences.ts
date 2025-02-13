import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { NotificationSettings, DisplaySettings } from '@/interface/Preferences';

const defaultNotificationSettings: NotificationSettings = {
    emailNotifications: true,
    inAppNotifications: true,
    ticketUpdates: true,
    systemAnnouncements: true
};

const defaultDisplaySettings: DisplaySettings = {
    timezone: 'auto',
    dateFormat: '24h',
    numberFormat: 'standard'
};

export function usePreferences() {
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(defaultNotificationSettings);
    const [displaySettings, setDisplaySettings] = useState<DisplaySettings>(defaultDisplaySettings);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchPreferences();
    }, []);

    const fetchPreferences = async () => {
        try {
            const response = await api.get('/preferences');
            const { notification_settings, display_settings } = response.data;
            
            if (notification_settings) {
                setNotificationSettings({
                    emailNotifications: notification_settings.emailNotifications ?? defaultNotificationSettings.emailNotifications,
                    inAppNotifications: notification_settings.inAppNotifications ?? defaultNotificationSettings.inAppNotifications,
                    ticketUpdates: notification_settings.ticketUpdates ?? defaultNotificationSettings.ticketUpdates,
                    systemAnnouncements: notification_settings.systemAnnouncements ?? defaultNotificationSettings.systemAnnouncements
                });
            }

            if (display_settings) {
                setDisplaySettings({
                    timezone: display_settings.timezone ?? defaultDisplaySettings.timezone,
                    dateFormat: display_settings.dateFormat ?? defaultDisplaySettings.dateFormat,
                    numberFormat: display_settings.numberFormat ?? defaultDisplaySettings.numberFormat
                });
            }
        } catch (error: any) {
            if (error.response?.status !== 404) {
                setError('Failed to fetch preferences');
                console.error('Failed to fetch preferences:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    const updatePreferences = async () => {
        try {
            try {
                await api.put('/preferences', {
                    notification_settings: notificationSettings,
                    display_settings: displaySettings
                });
            } catch (error: any) {
                if (error.response?.status === 404) {
                    await api.post('/preferences', {
                        notification_settings: notificationSettings,
                        display_settings: displaySettings
                    });
                } else {
                    throw error;
                }
            }
            return true;
        } catch (error) {
            console.error('Failed to save preferences:', error);
            setError('Failed to save preferences');
            return false;
        }
    };

    const updateNotificationSettings = (settings: Partial<NotificationSettings>) => {
        setNotificationSettings(prev => ({ ...prev, ...settings }));
    };

    const updateDisplaySettings = (settings: Partial<DisplaySettings>) => {
        setDisplaySettings(prev => ({ ...prev, ...settings }));
    };

    return {
        notificationSettings,
        displaySettings,
        loading,
        error,
        updateNotificationSettings,
        updateDisplaySettings,
        updatePreferences
    };
}