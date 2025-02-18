import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableHeader, TableRow, TableCell, TableHead } from '@/components/ui/table';
import { Plus, Eye, Edit, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { ResourceBuilder } from '@/components/resource/ResourceBuilder';
import { resourceTypeApi, resourceEntryApi } from '@/lib/api';
import { ResourceType, ResourceEntry, ResourceTypeCreate } from '@/interface/Resource';
import { ResourceTypeForm } from '@/components/resource/ResourceTypeForm';
import { ResourceEntryForm } from '@/components/resource/ResourceEntryForm';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AIAssistant } from '@/components/ai/AIAssistant';

export default function ResourceManagement() {
  const [activeTab, setActiveTab] = useState('resources');
  const { t } = useTranslation();
  const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([]);
  const [resourceEntries, setResourceEntries] = useState<ResourceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createEntryDialogOpen, setCreateEntryDialogOpen] = useState(false);
  const [selectedResourceType, setSelectedResourceType] = useState<ResourceType | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEntries, setFilteredEntries] = useState<ResourceEntry[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [types, entries] = await Promise.all([
          resourceTypeApi.getAll(),
          selectedResourceType && selectedResourceType.id ? resourceEntryApi.getByTypeId(selectedResourceType.id) : Promise.resolve([])
        ]);
        setResourceTypes(types);
        setResourceEntries(entries);
        setFilteredEntries(entries);
      } catch (err) {
        setError('Failed to fetch resources');
        console.error('Error fetching resources:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedResourceType]);

  const handleViewEntries = (type: ResourceType) => {
    setSelectedResourceType(type);
    setCreateDialogOpen(true);
  };

  const handleAISuggest = (suggestedResource: any) => {
    setSelectedResourceType({
      name: suggestedResource.name,
      description: suggestedResource.description,
      version: suggestedResource.version,
      fields: suggestedResource.fields || [],
      metainfo: suggestedResource.metainfo || {
        searchable_fields: [],
        filterable_fields: [],
        default_sort_field: '',
        tags: [],
        category: ''
      }
    });
    setIsUpdating(false);
    setActiveTab('builder');
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t('resources.title')}</h1>
          <p className="">{t('resources.subtitle')}</p>
        </div>
        <Button onClick={() => setActiveTab('builder')}>
          <Plus className="mr-2 h-4 w-4" />
          {t('resources.create')}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="resources">{t('resources.tabs.list')}</TabsTrigger>
          <TabsTrigger value="builder">{t('resources.tabs.builder')}</TabsTrigger>
        </TabsList>

        <TabsContent value="resources" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-muted-foreground">{t('common.loading')}</div>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-destructive">{error}</div>
              </CardContent>
            </Card>
          ) : resourceTypes.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>{t('resources.noResources')}</CardTitle>
                <CardDescription>
                  {t('resources.noResourcesDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={() => setActiveTab('builder')}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('resources.createFirst')}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {resourceTypes.map((type) => (
                <Card key={type.id} className="hover:shadow-lg transition-shadow h-full flex flex-col">
                  <CardContent className="p-6 flex flex-col flex-1">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{type.name}</h3>
                      <p className="text-muted-foreground mb-4">{type.description}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedResourceType(type);
                          setIsUpdating(true);
                          setActiveTab('builder');
                        }}
                        className="w-full sm:w-auto p-2"
                      >
                        <Edit className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">{t('resources.actions.edit')}</span>
                      </Button>
                      <div className="flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewEntries(type)}
                          className="w-full sm:w-auto p-2"
                        >
                          <Eye className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">{t('resources.actions.viewEntries')}</span>
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            setSelectedResourceType(type);
                            setCreateEntryDialogOpen(true);
                          }}
                          className="w-full sm:w-auto p-2"
                        >
                          <Plus className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">{t('resources.actions.addEntry')}</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogContent className="max-w-6xl w-full">
              <DialogHeader>
                <DialogTitle>
                  {selectedResourceType ?
                    t('resources.viewEntries.title', { name: selectedResourceType.name }) :
                    t('resources.createType.title')}
                </DialogTitle>
                <DialogDescription>
                  {selectedResourceType ?
                    t('resources.viewEntries.description') :
                    t('resources.createType.description')}
                </DialogDescription>
              </DialogHeader>
              {selectedResourceType ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <Input
                      placeholder={t('resources.search.placeholder')}
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        const query = e.target.value.toLowerCase();
                        setFilteredEntries(
                          resourceEntries.filter((entry) =>
                            Object.values(entry.data).some((value) =>
                              String(value).toLowerCase().includes(query)
                            )
                          )
                        );
                        setPage(1);
                      }}
                      className="max-w-sm"
                    />
                  </div>
                  {filteredEntries.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      {t('resources.viewEntries.noEntries')}
                    </p>
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {Object.keys(resourceEntries[0]?.data || {}).map((key) => (
                                <TableHead key={key} className="font-semibold whitespace-nowrap text-center">
                                  {key}
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredEntries
                              .slice((page - 1) * pageSize, page * pageSize)
                              .map((entry) => (
                                <TableRow key={entry.id}>
                                  {Object.entries(entry.data).map(([key, value]) => (
                                    <TableCell key={key} className="text-center">
                                      {(() => {
                                        if (key === 'coordinates' && typeof value === 'object') {
                                          const coords = value as { latitude: number; longitude: number };
                                          return `${coords.latitude.toFixed(4)}°, ${coords.longitude.toFixed(4)}°`;
                                        }
                                        if (key === 'features' && Array.isArray(value)) {
                                          return value.join(', ');
                                        }
                                        if (typeof value === 'object') {
                                          return (
                                            <Button
                                              variant="ghost"
                                              className="h-8"
                                              onClick={() => {
                                                console.log('Show detailed view:', value);
                                              }}
                                            >
                                              <Eye className="mr-1 h-4 w-4" />
                                              {t('common.view')}
                                            </Button>
                                          );
                                        }
                                        return String(value);
                                      })()}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>
                      <div className="flex items-center justify-between space-x-2 py-4">
                        <div className="flex-1 text-sm text-muted-foreground">
                          {t('common.showing')} {((page - 1) * pageSize) + 1} {t('common.to')} {Math.min(page * pageSize, filteredEntries.length)} {t('common.of')} {filteredEntries.length} {t('common.entries')}
                        </div>
                        <div className="flex items-center space-x-6 lg:space-x-8">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium">{t('common.page')}</p>
                            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                              {page} / {Math.ceil(filteredEntries.length / pageSize)}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              className="h-8 w-8 p-0"
                              onClick={() => setPage(1)}
                              disabled={page === 1}
                            >
                              <span className="sr-only">{t('common.firstPage')}</span>
                              <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              className="h-8 w-8 p-0"
                              onClick={() => setPage(page - 1)}
                              disabled={page === 1}
                            >
                              <span className="sr-only">{t('common.previousPage')}</span>
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              className="h-8 w-8 p-0"
                              onClick={() => setPage(page + 1)}
                              disabled={page * pageSize >= filteredEntries.length}
                            >
                              <span className="sr-only">{t('common.nextPage')}</span>
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              className="h-8 w-8 p-0"
                              onClick={() => setPage(Math.ceil(filteredEntries.length / pageSize))}
                              disabled={page * pageSize >= filteredEntries.length}
                            >
                              <span className="sr-only">{t('common.lastPage')}</span>
                              <ChevronsRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <ResourceTypeForm
                  onSubmit={async (data) => {
                    try {
                      const createData: ResourceTypeCreate = {
                        name: data?.name || '',
                        description: data?.description || '',
                        version: (data?.version || 1).toString(),
                        fields: data?.fields || [],
                        metainfo: data?.metainfo || { searchable_fields: [], filterable_fields: [], default_sort_field: '', tags: [], category: '' }
                      };
                      const newType = await resourceTypeApi.create(createData);
                      setResourceTypes([...resourceTypes, newType]);
                      setCreateDialogOpen(false);
                    } catch (err) {
                      console.error('Error creating resource type:', err);
                      setError('Failed to create resource type');
                    }
                  }}
                  onCancel={() => {
                    setCreateDialogOpen(false);
                    setSelectedResourceType(null);
                  }}
                />
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={createEntryDialogOpen} onOpenChange={setCreateEntryDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {t('resources.createEntry.title', { name: selectedResourceType?.name })}
                </DialogTitle>
                <DialogDescription>
                  {t('resources.createEntry.description')}
                </DialogDescription>
              </DialogHeader>
              {selectedResourceType && (
                <ResourceEntryForm
                  resourceType={selectedResourceType}
                  onSubmit={async (data) => {
                    try {
                      if (!selectedResourceType?.id) {
                        throw new Error('Resource type ID is required');
                      }
                      await resourceEntryApi.create({
                        resource_type_id: selectedResourceType.id,
                        data
                      });
                      const entries = await resourceEntryApi.getByTypeId(selectedResourceType.id);
                      setResourceEntries(entries);
                      setFilteredEntries(entries);
                      setCreateEntryDialogOpen(false);
                    } catch (err) {
                      console.error('Error creating resource entry:', err);
                      setError('Failed to create resource entry');
                    }
                  }}
                  onCancel={() => {
                    setCreateEntryDialogOpen(false);
                  }}
                />
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="builder">
          <Card>
            <CardHeader>
              <CardTitle>{t('resources.createNew')}</CardTitle>
              <CardDescription>
                {t('resources.createNewDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResourceBuilder
                initialResource={selectedResourceType}
                onSave={async (resource) => {
                  try {
                    if (selectedResourceType && isUpdating) {
                      if (selectedResourceType?.id === undefined) {
                        throw new Error('Resource type ID is required');
                      }
                      const updatedType = await resourceTypeApi.update(selectedResourceType.id, resource);
                      setResourceTypes(resourceTypes.map(type =>
                        type.id === updatedType.id ? updatedType : type
                      ));
                    } else {
                      const newType = await resourceTypeApi.create(resource);
                      setResourceTypes([...resourceTypes, newType]);
                    }
                    setSelectedResourceType(null);
                    setIsUpdating(false);
                    setActiveTab('resources');
                  } catch (err) {
                    console.error('Error saving resource type:', err);
                    setError('Failed to save resource type');
                  }
                }}
                onCancel={() => {
                  setSelectedResourceType(null);
                  setIsUpdating(false);
                  setActiveTab('resources');
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AIAssistant
        onSuggest={handleAISuggest}
        endpoint="/ai/resource-suggest"
        storageKey="resource-ai-chat-storage"
        sections={['resource']}
        includeHistory={false}
      />
    </div>
  );
}