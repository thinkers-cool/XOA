import { FormField } from '@/interface/TicketTemplate';
import { FormFieldRenderer } from '@/components/common/FormFieldRenderer';

interface FormPreviewProps {
    fields: FormField[];
    className?: string;
}

export function FormPreview({ fields, className = '' }: FormPreviewProps) {

    return (
        <div className={`flex flex-wrap gap-4 ${className}`}>
            {fields.map((field) => (
                <div
                    key={field.id}
                    className={`${field.width === '1/4' ? 'w-[calc(25%-12px)]' : field.width === '1/3' ? 'w-[calc(33.333%-12px)]' : field.width === '1/2' ? 'w-[calc(50%-12px)]' : 'w-full'}`}
                >
                    <FormFieldRenderer field={field} isPreview={true} />
                </div>
            ))}
        </div>
    );
}