import { WorkflowStep } from '@/interface/TicketTemplate';
import ReactFlow, { Node, Edge, Position } from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface WorkflowGraphProps {
    workflow: WorkflowStep[];
    visible?: boolean;
}

export function WorkflowGraph({ workflow, visible }: WorkflowGraphProps) {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(visible ? true : false);
    const nodes: Node[] = workflow.map((step, index) => ({
        id: step.id,
        data: { label: step.name || 'Unnamed Step' },
        position: { x: 150 * index, y: 60 },
        type: 'default',
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        style: {
            width: 80,
            height: 24,
            fontSize: '8px',
            padding: '4px',
            backgroundColor: 'hsl(var(--primary-foreground))',
            color: 'hsl(var(--primary))',
            border: '1px solid hsl(var(--primary))',
            borderRadius: 'calc(var(--radius) - 2px)'
        },
    }));

    const edges: Edge[] = workflow.reduce<Edge[]>((acc, step) => {
        const dependencies = step.dependencies || [];
        return [
            ...acc,
            ...dependencies.map(depId => ({
                id: `${depId}-${step.id}`,
                source: depId,
                target: step.id,
                animated: true,
                type: 'smoothstep',
                style: {
                    stroke: 'hsl(var(--muted-foreground))',
                    strokeWidth: 1
                },
            })),
        ];
    }, []);

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <Button
                    variant={null}
                    className="flex items-center gap-2"
                    onClick={() => setIsVisible(!isVisible)}
                    title={t('template.workflowGraph.toggle')}
                >
                    <Share2 className={`h-4 w-4 transition-transform ${isVisible ? 'rotate-180' : ''}`} />
                    <span className="text-sm">
                        {isVisible ? t('template.workflowGraph.hide') : t('template.workflowGraph.show')}
                    </span>
                </Button>
            </div>
            {isVisible && (
                <div className="h-[160px] border rounded-lg bg-background">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        fitView
                        className="bg-background"
                    />
                </div>
            )}
        </div>
    );
}