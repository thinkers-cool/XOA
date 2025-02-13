export interface NotificationSettings {
    emailNotifications: boolean;
    inAppNotifications: boolean;
    ticketUpdates: boolean;
    systemAnnouncements: boolean;
}

export interface DisplaySettings {
    timezone: string;
    dateFormat: string;
    numberFormat: string;
}

export interface Preferences {
    notification_settings: NotificationSettings;
    display_settings: DisplaySettings;
}