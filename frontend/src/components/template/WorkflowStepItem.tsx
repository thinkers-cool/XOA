import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormPreview } from '@/components/common/FormPreview';
import { WorkflowStep } from '@/interface/TicketTemplate';

interface WorkflowStepItemProps {
    step: WorkflowStep;
    t: (key: string) => string;
}

export function WorkflowStepItem({ step, t }: WorkflowStepItemProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex items-center w-100 justify-between gap-2 p-2 rounded-md bg-accent/50 hover:bg-accent transition-colors">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{step.name}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {step.assignable_roles && step.assignable_roles.length > 0 && (
                        <div className="px-2 py-0.5 rounded-full bg-background">
                            {step.assignable_roles.length} {step.assignable_roles.length === 1 ? t('template.role') : t('template.roles')}
                        </div>
                    )}
                    {step.dependencies && step.dependencies.length > 0 && (
                        <div className="px-2 py-0.5 rounded-full bg-background">
                            {step.dependencies.length} {step.dependencies.length === 1 ? t('template.dependency') : t('template.dependencies')}
                        </div>
                    )}
                    {step.form && step.form.length > 0 && (
                        <div className="px-2 py-0.5 rounded-full bg-background">
                            {step.form.length} {step.form.length === 1 ? t('template.field') : t('template.fields')}
                        </div>
                    )}
                </div>
            </div>
            {step.form && step.form.length > 0 && isHovered && (
                <div className="absolute z-50 left-0 top-full mt-2 w-[600px]">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">{step.name} - {t('template.formPreview')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FormPreview fields={step.form} />
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}