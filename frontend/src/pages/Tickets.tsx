import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { userApi } from '@/lib/api';
import { User } from '@/interface/User';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { StepForm } from '@/components/ticket/StepForm';
import { Clock, CheckCircle2, Plus, Eye, UserPlus, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { TicketForm } from '@/components/ticket/TicketForm';
import { ticketApi, templateApi, API_BASE_URL } from '@/lib/api';
import { Ticket } from '@/interface/Ticket';
import { TicketTemplate } from '@/interface/TicketTemplate';
import { TicketVisualization } from '@/components/ticket/TicketVisualization';
import { PERMISSIONS, usePermissions } from '@/hooks/usePermissions';

export default function TicketsPage() {
  const location = useLocation();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { hasPermission, fetchUserPermissions } = usePermissions();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [templates, setTemplates] = useState<TicketTemplate[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [stepFormOpen, setStepFormOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [ticketToAssign, setTicketToAssign] = useState<{ ticket: Ticket; stepId: string } | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'visualization'>('table');
  const [users, setUsers] = useState<Record<number, User>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket =>
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.priority.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tickets, searchQuery]);

  const paginatedTickets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTickets.slice(startIndex, endIndex);
  }, [filteredTickets, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const isOpenedTickets = location.pathname === '/tickets/opened';

  useEffect(() => {
    const fetchUsers = async () => {
      await fetchUserPermissions();
      try {
        const usersData = await userApi.getAll();
        const usersMap = usersData.reduce((acc, user) => ({ ...acc, [user.id]: user }), {});
        setUsers(usersMap);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };
    fetchUsers();
  }, []);

  const fetchTickets = async () => {
    try {
      const ticketsData = await ticketApi.getAll();
      setTickets(ticketsData.filter((ticket) => isOpenedTickets ? ticket.status === 'opened' : ['completed', 'closed', 'deleted'].includes(ticket.status)));
    } catch (err) {
      console.error('Error fetching tickets:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ticketsData, templatesData] = await Promise.all([
          ticketApi.getAll(),
          templateApi.getAll()
        ]);
        setTickets(ticketsData.filter((ticket) => isOpenedTickets ? ticket.status === 'opened' : ['completed', 'closed', 'deleted'].includes(ticket.status)));
        setTemplates(templatesData);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
      }
    };

    fetchData();
  }, [isOpenedTickets]);

  const handleCreateTicket = async (data: any) => {
    try {
      await ticketApi.create(data);
      await fetchTickets();
      setCreateDialogOpen(false);
    } catch (err) {
      console.error('Error creating ticket:', err);
    }
  };

  const getTicketsByTemplate = (templateId: number) => {
    return paginatedTickets.filter(ticket => ticket.template_id === templateId);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            {isOpenedTickets ? t('tickets.ongoing.title') : t('tickets.closed.title')}
          </h1>
          <p className="text-muted-foreground">
            {isOpenedTickets ? t('tickets.ongoing.description') : t('tickets.closed.description')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Input
            type="text"
            placeholder={t('common.search')}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-64"
          />
          <div className="flex items-center rounded-lg border p-1">
            <Button
              variant={viewMode === 'table' ? 'default' : null}
              size="sm"
              onClick={() => setViewMode('table')}
              className="px-3"
            >
              {t('navigation.tickets.viewMode.table')}
            </Button>
            <Button
              variant={viewMode === 'visualization' ? 'default' : null}
              size="sm"
              onClick={() => setViewMode('visualization')}
              className="px-3"
            >
              {t('navigation.tickets.viewMode.workflow')}
            </Button>
          </div>
          {hasPermission(PERMISSIONS.TICKET.CREATE) && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-1 h-4 w-4" />
              {t('navigation.tickets.newTicket')}
            </Button>
          )}
        </div>
      </div>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('navigation.tickets.newTicket')}</DialogTitle>
            <DialogDescription>
              {t('tickets.create.description')}
            </DialogDescription>
          </DialogHeader>
          <TicketForm
            onSubmit={(data) => {
              handleCreateTicket(data);
              setCreateDialogOpen(false);
            }}
            onCancel={() => setCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {selectedTicket && selectedStep && (
        <StepForm
          isOpen={stepFormOpen}
          onClose={() => setStepFormOpen(false)}
          fields={Object.values(selectedTicket.workflow_data.metadata.form_definitions[selectedStep] || [])}
          stepName={templates
            .find(t => t.id === selectedTicket.template_id)!
            .workflow.find(s => s.id === selectedStep)!
            .name}
          stepDescription={templates
            .find(t => t.id === selectedTicket.template_id)!
            .workflow.find(s => s.id === selectedStep)!
            .description}
          initialData={selectedTicket.workflow_data.steps[selectedStep]?.form_data}
          isCompleted={selectedTicket.workflow_data.steps[selectedStep]?.status === 'completed'}
          allSteps={templates
            .find(t => t.id === selectedTicket.template_id)!.workflow
            .map(step => ({
              name: step.name,
              data: selectedTicket.workflow_data.steps[step.id]?.form_data || {},
              fields: Object.values(selectedTicket.workflow_data.metadata.form_definitions[step.id] || []),
            }))}
          currentStepIndex={templates
            .find(t => t.id === selectedTicket.template_id)!.workflow
            .findIndex(step => step.id === selectedStep)}
          onSubmit={async (formData) => {
            try {
              const now = new Date().toISOString();
              const updatedSteps = {
                ...selectedTicket.workflow_data.steps,
                [selectedStep]: {
                  ...selectedTicket.workflow_data.steps[selectedStep],
                  form_data: formData,
                  status: formData.isDraft ? 'in_progress' : 'completed',
                  completed_at: formData.isDraft ? null : now,
                  history: [
                    ...(selectedTicket.workflow_data.steps[selectedStep]?.history || []),
                    {
                      timestamp: now,
                      type: 'status_change',
                      from: selectedTicket.workflow_data.steps[selectedStep]?.status || 'pending',
                      to: formData.isDraft ? 'in_progress' : 'completed',
                      user_id: user?.id
                    }
                  ]
                }
              };

              // Check if all steps are completed
              const allStepsCompleted = templates
                .find(t => t.id === selectedTicket.template_id)!
                .workflow.every(step =>
                  updatedSteps[step.id]?.status === 'completed'
                );

              await ticketApi.update(selectedTicket.id!, {
                status: allStepsCompleted ? 'completed' : 'opened',
                workflow_data: {
                  ...selectedTicket.workflow_data,
                  steps: updatedSteps
                }
              });
              await fetchTickets();
              setStepFormOpen(false);
            } catch (err) {
              console.error('Error completing step:', err);
            }
          }}
        />
      )}

      <AlertDialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('tickets.assign.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('tickets.assign.confirmation')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="neutral" onClick={() => setAssignDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={async () => {
                if (!ticketToAssign) return;
                try {
                  const updatedTicket = await ticketApi.update(ticketToAssign.ticket.id!, {
                    workflow_data: {
                      ...ticketToAssign.ticket.workflow_data,
                      steps: {
                        ...ticketToAssign.ticket.workflow_data.steps,
                        [ticketToAssign.stepId]: {
                          ...ticketToAssign.ticket.workflow_data.steps[ticketToAssign.stepId],
                          assignee_id: user?.id,
                          status: 'in_progress',
                          started_at: new Date().toISOString(),
                          history: [
                            ...(ticketToAssign.ticket.workflow_data.steps[ticketToAssign.stepId]?.history || []),
                            {
                              timestamp: new Date().toISOString(),
                              type: 'status_change',
                              from: 'pending',
                              to: 'in_progress',
                              user_id: user?.id
                            }
                          ]
                        }
                      }
                    }
                  });
                  setTickets(tickets.map(t => t.id === updatedTicket.id ? updatedTicket : t));
                  setAssignDialogOpen(false);
                  setTicketToAssign(null);
                } catch (err) {
                  console.error('Error assigning ticket:', err);
                }
              }}
            >
              {t('tickets.actions.assign')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('tickets.deleteConfirmation', { name: ticketToDelete?.title })}
              {t('common.actionCannotBeUndone')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!ticketToDelete) return;
                try {
                  await ticketApi.delete(ticketToDelete.id!);
                  setTickets(tickets.filter(t => t.id !== ticketToDelete.id));
                  setDeleteDialogOpen(false);
                  setTicketToDelete(null);
                } catch (error) {
                  console.error('Failed to delete ticket:', error);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-6">
        {templates.map((template) => {
          const templateTickets = getTicketsByTemplate(template.id!);
          if (templateTickets.length === 0) return null;
          return (
            <Card key={template.id}>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold">{template.name}</h2>
                  <p className="text-muted-foreground mt-1">{template.description}</p>
                </div>

                {viewMode === 'table' ? (
                  <Table className="relative w-full overflow-auto rounded-md border">
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="font-semibold text-center">{t('tickets.list.title')}</TableHead>
                        {isOpenedTickets ? (
                          <>
                            <TableHead className="font-semibold text-center">{t('tickets.list.currentStep')}</TableHead>
                            <TableHead className="font-semibold text-center">{t('tickets.list.assignee')}</TableHead>
                          </>
                        ) : (
                          <>
                            <TableHead className="font-semibold text-center">{t('tickets.list.completionRate')}</TableHead>
                            <TableHead className="font-semibold text-center">{t('tickets.list.finalAssignee')}</TableHead>
                          </>
                        )}
                        <TableHead className="font-semibold text-center">{t('tickets.list.priority')}</TableHead>
                        <TableHead className="font-semibold text-center">{t('tickets.list.status')}</TableHead>
                        <TableHead className="font-semibold text-center">{t('tickets.list.lastUpdated')}</TableHead>
                        <TableHead className="font-semibold text-center">{t('common.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {templateTickets.map((ticket) => {
                        const currentStep = template.workflow.find(step => {
                          const stepData = ticket.workflow_data.steps[step.id];
                          return stepData && stepData.status !== 'completed';
                        }) || template.workflow[template.workflow.length - 1];

                        return (
                          <TableRow key={ticket.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium text-center">{ticket.title}</TableCell>
                            {isOpenedTickets ? (
                              <>
                                <TableCell className="text-center">{currentStep.name}</TableCell>
                                <TableCell className="text-center">
                                  {(() => {
                                    const stepData = ticket.workflow_data.steps[currentStep.id];
                                    if (stepData?.status === 'in_progress' && stepData.assignee_id) {
                                      const assignee = users[stepData.assignee_id];
                                      return (
                                        <div className="flex items-center justify-center gap-2 mb-1 last:mb-0">
                                          <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8">
                                              <AvatarImage
                                                src={assignee?.avatar_url ? `${API_BASE_URL}${assignee.avatar_url}` : undefined}
                                                alt={assignee.full_name}
                                                className="h-full w-full object-cover"
                                              />
                                              <AvatarFallback>{assignee?.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                          </div>
                                        </div>
                                      );
                                    }
                                    return <div className="flex justify-center"><span className="text-muted-foreground text-sm">Unassigned</span></div>;
                                  })()}
                                </TableCell>
                              </>
                            ) : (
                              <>
                                <TableCell className="text-center">
                                  {(() => {
                                    const totalSteps = template.workflow.length;
                                    const completedSteps = template.workflow.filter(step =>
                                      ticket.workflow_data.steps[step.id]?.status === 'completed'
                                    ).length;
                                    const completionRate = Math.round((completedSteps / totalSteps) * 100);
                                    return `${completionRate}% (${completedSteps}/${totalSteps})`;
                                  })()}
                                </TableCell>
                                <TableCell className="text-center">
                                  {(() => {
                                    const lastStep = template.workflow[template.workflow.length - 1];
                                    const lastStepData = ticket.workflow_data.steps[lastStep.id];
                                    if (lastStepData?.assignee_id) {
                                      const finalAssignee = users[lastStepData.assignee_id];
                                      return (
                                        <div className="flex items-center justify-center gap-2">
                                          <Avatar className="h-8 w-8">
                                            <AvatarImage
                                              src={finalAssignee?.avatar_url ? `${API_BASE_URL}${finalAssignee.avatar_url}` : undefined}
                                              alt={finalAssignee.full_name}
                                              className="h-full w-full object-cover"
                                            />
                                            <AvatarFallback>{finalAssignee?.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                                          </Avatar>
                                        </div>
                                      );
                                    }
                                    return '-';
                                  })()}
                                </TableCell>
                              </>
                            )}
                            <TableCell className='text-center'>
                              <Badge
                                variant={ticket.priority === 'high' ? 'default' :
                                  ticket.priority === 'medium' ? 'default' :
                                    'neutral'}
                              >
                                {t(`tickets.priority.${ticket.priority}`)}
                              </Badge>
                            </TableCell>
                            <TableCell className='text-center'>
                              <div className="flex items-center justify-center gap-2">
                                {ticket.workflow_data.steps[currentStep.id]?.status === 'completed' ? (
                                  <>
                                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                                    <span>{t('tickets.status.completed')}</span>
                                  </>
                                ) : ticket.workflow_data.steps[currentStep.id]?.status === 'in_progress' ? (
                                  <>
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span>{t('tickets.status.ongoing')}</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span>{t('tickets.status.pending')}</span>
                                  </>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className='text-center'>
                              {new Date(ticket.updated_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className='text-center'>
                              <div className="flex items-center justify-center gap-2">
                                {ticket.workflow_data.steps[currentStep.id]?.status === 'completed' ? (
                                  <Button
                                    variant={null}
                                    className="h-8"
                                    onClick={() => {
                                      setSelectedTicket(ticket);
                                      setSelectedStep(currentStep.id);
                                      setStepFormOpen(true);
                                    }}
                                  >
                                    <Eye className="mr-1 h-4 w-4" />
                                    {t('tickets.actions.view')}
                                  </Button>
                                ) : ticket.workflow_data.steps[currentStep.id]?.assignee_id === user?.id ? (
                                  <Button
                                    variant={null}
                                    className="h-8"
                                    onClick={() => {
                                      setSelectedTicket(ticket);
                                      setSelectedStep(currentStep.id);
                                      setStepFormOpen(true);
                                    }}
                                  >
                                    <CheckCircle2 className="mr-1 h-4 w-4" />
                                    {t('tickets.actions.complete')}
                                  </Button>
                                ) : (
                                  <Button
                                    variant={null}
                                    className="h-8"
                                    onClick={() => {
                                      setTicketToAssign({ ticket, stepId: currentStep.id });
                                      setAssignDialogOpen(true);
                                    }}
                                  >
                                    <UserPlus className="mr-1 h-4 w-4" />
                                    {t('tickets.actions.assign')}
                                  </Button>
                                )}
                                <Button
                                  variant={null}
                                  className="h-8 text-destructive"
                                  onClick={() => {
                                    setTicketToDelete(ticket);
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="mr-1 h-4 w-4" />
                                  {t('common.delete')}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>) : (
                  <div className="grid grid-cols-1 gap-6">
                    {templateTickets.map((ticket) => (
                      <TicketVisualization
                        key={ticket.id}
                        ticket={ticket}
                        template={template}
                        users={users}
                        currentUser={user}
                        onStepClick={(ticket, stepId) => {
                          setSelectedTicket(ticket);
                          setSelectedStep(stepId);
                          setStepFormOpen(true);
                        }}
                        onAssignClick={(ticket, stepId) => {
                          setTicketToAssign({ ticket, stepId });
                          setAssignDialogOpen(true);
                        }}
                      />
                    ))}
                  </div>
                )}

                {filteredTickets.length > itemsPerPage && (
                  <div className="flex items-center justify-between space-x-2 py-4">
                    <div className="flex-1 text-sm text-muted-foreground">
                      {t('common.showing')} {((currentPage - 1) * itemsPerPage) + 1} {t('common.to')} {Math.min(currentPage * itemsPerPage, filteredTickets.length)} {t('common.of')} {filteredTickets.length} {t('common.entries')}
                    </div>
                    <div className="flex items-center space-x-6 lg:space-x-8">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">{t('common.page')}</p>
                        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                          {currentPage} / {totalPages}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="neutral"
                          className="h-8 w-8 p-0"
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                        >
                          <span className="sr-only">{t('common.firstPage')}</span>
                          <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="neutral"
                          className="h-8 w-8 p-0"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <span className="sr-only">{t('common.previousPage')}</span>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="neutral"
                          className="h-8 w-8 p-0"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          <span className="sr-only">{t('common.nextPage')}</span>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="neutral"
                          className="h-8 w-8 p-0"
                          onClick={() => setCurrentPage(totalPages)}
                          disabled={currentPage === totalPages}
                        >
                          <span className="sr-only">{t('common.lastPage')}</span>
                          <ChevronsRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}