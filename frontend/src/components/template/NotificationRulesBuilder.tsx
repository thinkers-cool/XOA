import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';
import { Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NotificationRule } from '@/interface/TicketTemplate';
import { roleApi } from '@/lib/api';
import { Role } from '@/interface/Role';

interface NotificationRulesBuilderProps {
    rules: NotificationRule[];
    onChange: (rules: NotificationRule[]) => void;
}

const EVENT_TYPES = [
    'step_started',
    'step_completed',
    'step_overdue',
    'step_skipped',
    'ticket_created',
    'ticket_assigned',
    'ticket_updated',
    'ticket_completed',
];

const NOTIFICATION_CHANNELS = ['email', 'slack'];

export function NotificationRulesBuilder({ rules, onChange }: NotificationRulesBuilderProps) {
    const { t } = useTranslation();
    const [roles, setRoles] = useState<Role[]>([]);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const data = await roleApi.getAll();
                setRoles(data);
            } catch (err) {
                console.error('Error fetching roles:', err);
            }
        };
        fetchRoles();
    }, []);

    const addRule = () => {
        const newRule: NotificationRule = {
            event: EVENT_TYPES[0],
            notify_roles: [],
            channels: ['email']
        };
        onChange([...rules, newRule]);
    };

    const removeRule = (index: number) => {
        const newRules = [...rules];
        newRules.splice(index, 1);
        onChange(newRules);
    };

    const updateRule = (index: number, field: keyof NotificationRule, value: any) => {
        const newRules = rules.map((rule, i) =>
            i === index ? { ...rule, [field]: value } : rule
        );
        onChange(newRules);
    };

    return (
        <div className="space-y-4">
            {rules.map((rule, index) => (
                <Card key={index} className="relative">
                    <CardContent className="p-4 space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="flex-1 space-y-4">
                                <div className="space-y-2">
                                    <Label>{t('template.builder.labels.event')}</Label>
                                    <Select
                                        value={rule.event}
                                        onValueChange={(value) => updateRule(index, 'event', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {EVENT_TYPES.map((event) => (
                                                <SelectItem key={event} value={event}>
                                                    {t(`template.builder.events.${event}`)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>{t('template.builder.labels.notifyRoles')}</Label>
                                    <MultiSelect
                                        options={roles.map(role => ({
                                            label: role.name,
                                            value: role.name
                                        }))}
                                        value={rule.notify_roles}
                                        onValueChange={(values) => updateRule(index, 'notify_roles', values)}
                                        placeholder={t('template.builder.placeholders.selectRoles')}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>{t('template.builder.labels.channels')}</Label>
                                    <MultiSelect
                                        options={NOTIFICATION_CHANNELS.map(channel => ({
                                            label: t(`template.builder.channels.${channel}`),
                                            value: channel
                                        }))}
                                        value={rule.channels}
                                        onValueChange={(values) => updateRule(index, 'channels', values)}
                                        placeholder={t('template.builder.placeholders.selectChannels')}
                                    />
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeRule(index)}
                                className="hover:bg-destructive/10 hover:text-destructive"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
            <Button onClick={addRule} variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                {t('template.builder.buttons.addNotificationRule')}
            </Button>
        </div>
    );
}