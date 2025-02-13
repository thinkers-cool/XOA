import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Download, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

import { userApi, ticketApi, resourceTypeApi, resourceEntryApi } from '@/lib/api';
import { User } from '@/interface/User';
import { Ticket } from '@/interface/Ticket';
import { ResourceEntry } from '@/interface/Resource';

export default function Insights() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState('7d');
  const [dataType, setDataType] = useState('all');

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [resources, setResources] = useState<ResourceEntry[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ticketsData, usersData] = await Promise.all([
          ticketApi.getAll(),
          userApi.getAll()
        ]);
        setTickets(ticketsData);
        setUsers(usersData);

        // Fetch all resource types and their entries
        const resourceTypes = await resourceTypeApi.getAll();
        const resourceEntriesPromises = resourceTypes.map(type => resourceEntryApi.getByTypeId(type.id));
        const resourceEntriesArrays = await Promise.all(resourceEntriesPromises);
        const allResourceEntries = resourceEntriesArrays.flat();
        setResources(allResourceEntries);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
      }
    };
    fetchData();
  }, []);

  // Calculate metrics based on real data
  const metrics = useMemo(() => {
    if (!tickets.length) return [];

    const previousPeriodEnd = new Date();
    previousPeriodEnd.setDate(previousPeriodEnd.getDate() - (timeRange === '7d' ? 14 : 
      timeRange === '30d' ? 60 : 
      timeRange === '90d' ? 180 : 730));

    const currentPeriodTickets = tickets.filter(ticket => 
      new Date(ticket.created_at) >= previousPeriodEnd);
    const previousPeriodTickets = tickets.filter(ticket => 
      new Date(ticket.created_at) < previousPeriodEnd);

    const calculateResolutionTime = (ticket: Ticket) => {
      const lastStep = ticket.workflow_data.steps[Object.keys(ticket.workflow_data.steps).pop() || ''];
      if (!lastStep?.completed_at) return null;
      // Format date to YYYY-MM-DD to ensure unique dates
      const completionDate = new Date(lastStep.completed_at).toISOString().split('T')[0];
      return {
        date: completionDate,
        value: (new Date(lastStep.completed_at).getTime() - new Date(ticket.created_at).getTime()) / (1000 * 60 * 60 * 24)
      };
    };

    const currentResolutionTimes = currentPeriodTickets
      .map(calculateResolutionTime)
      .filter((time): time is { date: string; value: number } => time !== null);
    const previousResolutionTimes = previousPeriodTickets
      .map(calculateResolutionTime)
      .filter((time): time is { date: string; value: number } => time !== null);

    const currentAvgResolution = currentResolutionTimes.length ? 
      currentResolutionTimes.reduce((a, b) => a + b.value, 0) / currentResolutionTimes.length : 0;
    const previousAvgResolution = previousResolutionTimes.length ? 
      previousResolutionTimes.reduce((a, b) => a + b.value, 0) / previousResolutionTimes.length : 0;

    return [
      {
        title: t('insights.metrics.totalTickets'),
        value: currentPeriodTickets.length.toString(),
        change: `${((currentPeriodTickets.length - previousPeriodTickets.length) / (previousPeriodTickets.length || 1) * 100).toFixed(1)}%`,
        trend: currentPeriodTickets.length >= previousPeriodTickets.length ? 'up' : 'down'
      },
      {
        title: t('insights.metrics.averageResolutionTime'),
        value: `${currentAvgResolution.toFixed(1)} ${t('insights.metrics.days')}`,
        change: `${((previousAvgResolution - currentAvgResolution) / (previousAvgResolution || 1) * 100).toFixed(1)}%`,
        trend: currentAvgResolution <= previousAvgResolution ? 'up' : 'down'
      },
      {
        title: t('insights.metrics.activeResources'),
        value: resources.length.toString(),
        change: '+0%',
        trend: 'up'
      },
      {
        title: t('insights.metrics.activeUsers'),
        value: users.filter(user => user.is_active).length.toString(),
        change: `${((users.filter(user => user.is_active).length / users.length) * 100).toFixed(1)}%`,
        trend: 'up'
      }
    ];
  }, [tickets, resources, users, timeRange]);

  const handleExport = () => {
    try {
      // Prepare export data
      const exportData = {
        timestamp: new Date().toISOString(),
        timeRange,
        metrics,
        charts: {
          ticketDistribution: [
            { name: 'high', value: tickets.filter(t => t.priority === 'high').length },
            { name: 'medium', value: tickets.filter(t => t.priority === 'medium').length },
            { name: 'low', value: tickets.filter(t => t.priority === 'low').length },
          ],
          resolutionTime: tickets
            .filter(ticket => {
              const date = new Date(ticket.created_at);
              const periodEnd = new Date();
              periodEnd.setDate(periodEnd.getDate() - (timeRange === '7d' ? 7 : 
                timeRange === '30d' ? 30 : 
                timeRange === '90d' ? 90 : 365));
              return date >= periodEnd;
            })
            .map(ticket => {
              const lastStep = ticket.workflow_data.steps[Object.keys(ticket.workflow_data.steps).pop() || ''];
              if (!lastStep?.completed_at) return null;
              return {
                date: new Date(ticket.created_at).toISOString().split('T')[0],
                resolution: (new Date(lastStep.completed_at).getTime() - new Date(ticket.created_at).getTime()) / (1000 * 60 * 60 * 24)
              };
            })
            .filter((data): data is { date: string; resolution: number } => data !== null)
        },
        tableData
      };

      // Create and trigger download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `insights-export-${date}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Filter and prepare table data
  const tableData = useMemo(() => {
    const filteredData = [];
    
    if (dataType === 'all' || dataType === 'ticket') {
      filteredData.push(...tickets
        .filter(ticket => 
          ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ticket.priority.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map(ticket => ({
          id: ticket.id,
          type: 'Ticket',
          title: ticket.title,
          priority: ticket.priority,
          status: ticket.status,
          date: new Date(ticket.created_at).toISOString().split('T')[0]
        })));
    }

    if (dataType === 'all' || dataType === 'resource') {
      filteredData.push(...resources
        .filter(resource =>
          Object.values(resource.data).some(value =>
            String(value).toLowerCase().includes(searchQuery.toLowerCase())
          )
        )
        .map(resource => ({
          id: resource.id,
          type: 'Resource',
          title: Object.values(resource.data)[0] || 'Unnamed Resource',
          priority: 'medium',
          status: 'active',
          date: new Date(resource.created_at || new Date().toISOString()).toISOString().split('T')[0]
        })));
    }

    if (dataType === 'all' || dataType === 'user') {
      filteredData.push(...users
        .filter(user =>
          user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map(user => ({
          id: user.id,
          type: 'User',
          title: user.full_name,
          priority: user.is_active ? 'medium' : 'low',
          status: user.is_active ? 'active' : 'inactive',
          date: new Date(user.created_at).toISOString().split('T')[0]
        })));
    }

    return filteredData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [tickets, resources, users, searchQuery, dataType]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return [...tableData].slice(startIndex, endIndex);
  }, [tableData, currentPage, pageSize]);

  const totalPages = Math.ceil(tableData.length / pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, dataType]);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t('insights.title')}</h1>
          <p className="text-muted-foreground">{t('insights.description')}</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('insights.selectTimeRange')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">{t('insights.timeRange.week')}</SelectItem>
              <SelectItem value="30d">{t('insights.timeRange.month')}</SelectItem>
              <SelectItem value="90d">{t('insights.timeRange.quarter')}</SelectItem>
              <SelectItem value="365d">{t('insights.timeRange.year')}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            {t('insights.export')}
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold">{metric.value}</h3>
                  <Badge variant={metric.trend === 'up' ? 'default' : 'secondary'}>
                    {metric.change}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Data Visualization Section */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('insights.charts.ticketDistribution')}</CardTitle>
            <CardDescription>{t('insights.charts.ticketDistributionDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border-t p-4 w-full">
            <ChartContainer
              config={{
                high: { color: "hsl(var(--destructive))", label: "High" },
                medium: { color: "hsl(var(--primary))", label: "Medium" },
                low: { color: "hsl(var(--muted))", label: "Low" },
              }}
              className="w-full h-full"
            >
              <PieChart>
                <Pie
                  data={[
                    { name: 'high', value: tickets.filter(t => t.priority === 'high').length },
                    { name: 'medium', value: tickets.filter(t => t.priority === 'medium').length },
                    { name: 'low', value: tickets.filter(t => t.priority === 'low').length },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={80}
                  fill="#8884d8"
                >
                  {[
                    { name: 'high', color: "hsl(var(--destructive))" },
                    { name: 'medium', color: "hsl(var(--primary))" },
                    { name: 'low', color: "hsl(var(--muted))" },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={({ active, payload }) => (
                    <ChartTooltipContent
                      active={active}
                      payload={payload}
                      labelKey="name"
                    />
                  )}
                />
                <ChartLegend
                  content={({ payload }) => (
                    <ChartLegendContent
                      payload={payload}
                    />
                  )}
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('insights.charts.resolutionTime')}</CardTitle>
            <CardDescription>{t('insights.charts.resolutionTimeDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border-t p-4 w-full">
            <ChartContainer
              config={{
                resolution: { 
                  theme: {
                    light: 'rgb(59, 130, 246)',
                    dark: 'rgb(96, 165, 250)'
                  },
                  label: 'Resolution Time'
                }
              }}
              className="w-full h-full"
            >
              <LineChart
                data={tickets
                  .filter(ticket => {
                    const date = new Date(ticket.created_at);
                    const periodEnd = new Date();
                    periodEnd.setDate(periodEnd.getDate() - (timeRange === '7d' ? 7 : 
                      timeRange === '30d' ? 30 : 
                      timeRange === '90d' ? 90 : 365));
                    return date >= periodEnd;
                  })
                  .map(ticket => {
                    const lastStep = ticket.workflow_data.steps[Object.keys(ticket.workflow_data.steps).pop() || ''];
                    if (!lastStep?.completed_at) return null;
                    return {
                      date: new Date(ticket.created_at).toISOString().split('T')[0],
                      resolution: (new Date(lastStep.completed_at).getTime() - new Date(ticket.created_at).getTime()) / (1000 * 60 * 60 * 24)
                    };
                  })
                  .filter((data): data is { date: string; resolution: number } => data !== null)
                  .reduce((acc, curr) => {
                    const existing = acc.find(item => item.date === curr.date);
                    if (existing) {
                      existing.resolution = (existing.resolution + curr.resolution) / 2;
                    } else {
                      acc.push(curr);
                    }
                    return acc;
                  }, [] as { date: string; resolution: number }[])
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  interval="preserveStartEnd"
                />
                <YAxis />
                <Line
                  type="monotone"
                  dataKey="resolution"
                  stroke="var(--color-resolution)"
                  strokeWidth={2}
                  dot={false}
                />
                <ChartTooltip
                  content={({ active, payload }) => (
                    <ChartTooltipContent
                      active={active}
                      payload={payload}
                      labelKey="date"
                    />
                  )}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Data Table Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('insights.table.title')}</CardTitle>
              <CardDescription>{t('insights.table.description')}</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('common.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={dataType} onValueChange={setDataType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('insights.selectType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('insights.type.all')}</SelectItem>
                  <SelectItem value="ticket">{t('insights.type.ticket')}</SelectItem>
                  <SelectItem value="user">{t('insights.type.user')}</SelectItem>
                  <SelectItem value="resource">{t('insights.type.resource')}</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('insights.table.headers.type')}</TableHead>
                <TableHead>{t('insights.table.headers.title')}</TableHead>
                <TableHead>{t('insights.table.headers.priority')}</TableHead>
                <TableHead>{t('insights.table.headers.status')}</TableHead>
                <TableHead>{t('insights.table.headers.date')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((row) => (
                <TableRow key={`${row.type}-${row.id}`}>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>{row.title}</TableCell>
                  <TableCell>
                    {row.type === 'Ticket' ? (
                      <Badge
                        variant={row.priority === 'high' ? 'destructive' :
                          row.priority === 'medium' ? 'default' : 'secondary'}
                      >
                        {row.priority}
                      </Badge>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={row.status === 'resolved' ? 'default' :
                        row.status === 'active' ? 'secondary' : 'outline'}
                    >
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{row.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {t('common.showing')} {Math.min((currentPage - 1) * pageSize + 1, tableData.length)} {t('common.to')} {Math.min(currentPage * pageSize, tableData.length)} {t('common.of')} {tableData.length} {t('common.entries')}
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
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  <span className="sr-only">{t('common.firstPage')}</span>
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <span className="sr-only">{t('common.previousPage')}</span>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  <span className="sr-only">{t('common.nextPage')}</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage >= totalPages}
                >
                  <span className="sr-only">{t('common.lastPage')}</span>
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}