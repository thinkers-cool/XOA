import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Type, Plus, Clock, Edit, X, Workflow } from 'lucide-react';
import { TemplateBuilder } from '@/components/template/TemplateBuilder';
import { templateApi } from '@/lib/api';
import { TicketTemplate } from '@/interface/TicketTemplate';
import { WorkflowGraph } from '@/components/template/WorkflowGraph';
import { WorkflowStepItem } from '@/components/template/WorkflowStepItem';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function TicketTemplateManagement() {
  const [templates, setTemplates] = useState<TicketTemplate[]>([]);
  const [activeTab, setActiveTab] = useState('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<TicketTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<TicketTemplate | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await templateApi.getAll();
        setTemplates(data.map(template => ({ ...template, workflow: template.workflow || [] })));
      } catch (error) {
        console.error('Failed to fetch templates:', error);
      }
    };
    fetchTemplates();
  }, []);

  const handleDeleteClick = (template: TicketTemplate) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!templateToDelete) return;

    try {
      await templateApi.delete(templateToDelete.id!);
      setTemplates(templates.filter(t => t.id !== templateToDelete.id));
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t('template.title')}</h1>
          <p className="">{t('template.subtitle')}</p>
        </div>
        <Button onClick={() => setActiveTab('builder')}>
          <Plus className="mr-2 h-4 w-4" />
          {t('template.create')}
        </Button>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('common.confirmDelete')}</DialogTitle>
            <DialogDescription>
              {t('template.deleteConfirmation', { name: templateToDelete?.name })}
              {t('common.actionCannotBeUndone')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              {t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">{t('template.tabs.list')}</TabsTrigger>
          <TabsTrigger value="builder">{t('template.tabs.builder')}</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          {templates.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>{t('template.noTemplates')}</CardTitle>
                <CardDescription>
                  {t('template.noTemplatesDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={() => setActiveTab('builder')}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('template.createFirst')}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {templates.map((template) => (
                <Card key={template.id} className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="group-hover:text-primary transition-colors">{template.name}</CardTitle>
                        <CardDescription className="mt-1">{template.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${template.default_priority === 'high' ? 'bg-red-100 text-red-700' : template.default_priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                          {t(`template.builder.priority.${template.default_priority}`)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Workflow className="w-4 h-4" />
                          <span className="text-foreground">{t('template.workflowSteps')}({template.workflow.length}):</span>
                        </div>
                        <div className="relative pt-2">
                          <div className="space-y-4">
                            <div className="flex flex-wrap gap-2 mb-4">
                            {template.workflow.map((step) => (
                              <WorkflowStepItem key={step.id} step={step} t={t} />
                            ))}
                            </div>
                            <div className="pt-2">
                              <WorkflowGraph workflow={template.workflow} visible={true} />
                            </div>
                            <div className="pt-2 border-t border-border">
                              <div className="space-y-2 text-sm ">
                                <div className="flex items-center gap-2">
                                  <Type className="w-4 h-4" />
                                  <span>{t('template.titleFormat')}:</span>
                                  <span className="font-medium text-foreground truncate">{template.title_format}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  <span>{t('template.updated')}:</span>
                                  <span className="font-medium text-foreground">{new Date(template.updated_at || Date.now()).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <div className="flex gap-2">
                          <Button
                            variant="destructive"
                            onClick={() => handleDeleteClick(template)}
                          >
                            <X className="mr-2 h-4 w-4" />
                            {t('common.delete')}
                          </Button>
                          <Button
                            variant="default"
                            onClick={() => {
                              setSelectedTemplate(template);
                              setIsEditing(true);
                              setActiveTab('builder');
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            {t('template.editTemplate')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="builder">
          <Card>
            <CardHeader>
              <CardTitle>{t('template.createNew')}</CardTitle>
              <CardDescription>
                {t('template.createNewDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TemplateBuilder
                initialTemplate={isEditing ? selectedTemplate || undefined : undefined}
                onSave={async (template) => {
                  try {
                    const templateData = {
                      name: template.name,
                      description: template.description,
                      title_format: template.titleFormat,
                      default_priority: template.defaultPriority,
                      workflow: [...template.workflow],
                      workflow_config: template.workflowConfig
                    };

                    if (isEditing && selectedTemplate) {
                      const updatedTemplate = await templateApi.update(selectedTemplate.id!, templateData);
                      setTemplates(templates.map(t =>
                        t.id === selectedTemplate.id ? { ...updatedTemplate, workflow: updatedTemplate.workflow || [] } : t
                      ));
                    } else {
                      const newTemplate = await templateApi.create(templateData);
                      setTemplates([...templates, { ...newTemplate, workflow: newTemplate.workflow || [] }]);
                    }
                  }
                  catch (error) {
                    console.error(error);
                  }
                  setSelectedTemplate(null);
                  setIsEditing(false);
                  setActiveTab('templates');
                }}
                onCancel={() => {
                  setSelectedTemplate(null);
                  setIsEditing(false);
                  setActiveTab('templates');
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}