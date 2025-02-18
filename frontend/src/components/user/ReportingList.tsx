import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { roleApi, userApi } from '@/lib/api';
import { User, UserRole } from '@/interface/User';
import { Role } from '@/interface/Role';
import ReactFlow, { Node, Edge, Controls, Background } from 'reactflow';
import 'reactflow/dist/style.css';

export function ReportingList() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [userRoles, setUserRoles] = useState<Record<number, UserRole[]>>({});
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const buildOrgChart = () => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    const levelMap = new Map<number, number>();
    const xSpacing = 350;
    const ySpacing = 200;

    // First pass: determine levels and count children
    const childrenCount = new Map<number, number>();
    const processLevel = (userId: number, level: number) => {
      if (levelMap.has(userId)) return;
      levelMap.set(userId, level);
      
      const directReports = users.filter(u => 
        userRoles[u.id]?.some(role => role.reports_to_id === userId)
      );
      childrenCount.set(userId, directReports.length);
      directReports.forEach(report => {
        processLevel(report.id, level + 1);
      });
    };

    // Find root nodes (users who don't report to anyone)
    const rootUsers = users.filter(user =>
      !userRoles[user.id]?.some(role => role.reports_to_id)
    );
    rootUsers.forEach(user => processLevel(user.id, 0));

    // Calculate max width for each level
    const levelWidths = new Map<number, number>();
    users.forEach(user => {
      const level = levelMap.get(user.id) ?? 0;
      const currentWidth = levelWidths.get(level) ?? 0;
      levelWidths.set(level, currentWidth + 1);
    });

    // Second pass: create nodes with proper positions
    const levelPositions = new Map<number, number>();
    users.forEach(user => {
      const level = levelMap.get(user.id) ?? 0;
      const levelWidth = levelWidths.get(level) ?? 1;
      const position = levelPositions.get(level) ?? 0;
      levelPositions.set(level, position + 1);

      // Calculate x position to center nodes within their level
      const x = (position - (levelWidth - 1) / 2) * xSpacing;
      
      newNodes.push({
        id: user.id.toString(),
        type: 'default',
        position: { 
          x: x,
          y: level * ySpacing
        },
        data: {
          label: (
            <div className="p-2 bg-background border rounded-lg shadow-sm min-w-32">
              <div className="font-medium">{user.full_name}</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {userRoles[user.id]?.map((userRole) => (
                  <Badge key={userRole.role_id} variant="neutral" className="text-xs">
                    {roles.find(r => r.id === userRole.role_id)?.name}
                  </Badge>
                ))}
              </div>
            </div>
          )
        }
      });

      userRoles[user.id]?.forEach(userRole => {
        if (userRole.reports_to_id) {
          newEdges.push({
            id: `${userRole.id}-${user.id}-${userRole.reports_to_id}`,
            source: userRole.reports_to_id.toString(),
            target: user.id.toString(),
            type: 'smoothstep',
            animated: true
          });
        }
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await userApi.getAll();
        setUsers(data);
        const rolePromises = data.map(user => userApi.getRoleById(user.id));
        const userRolesData = await Promise.all(rolePromises);
        const rolesMap: Record<number, UserRole[]> = {};
        data.forEach((user, index) => {
          rolesMap[user.id] = userRolesData[index];
        });
        setUserRoles(rolesMap);
      } catch (err) {
        setError('Failed to fetch users');
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchRoles = async () => {
      try {
        const data = await roleApi.getAll();
        setRoles(data);
      } catch (err) {
        setError('Failed to fetch roles');
        console.error('Error fetching roles:', err);
      }
    };

    fetchUsers();
    fetchRoles();
  }, []);

  useEffect(() => {
    if (users.length > 0 && Object.keys(userRoles).length > 0) {
      buildOrgChart();
    }
  }, [users, userRoles]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">{t('common.loading')}</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-destructive">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-4">
        <div style={{ height: '70vh' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            className="bg-background"
            defaultEdgeOptions={{
              type: 'smoothstep',
              style: {
                strokeWidth: 2,
                stroke: 'hsl(var(--muted-foreground))',
              },
              animated: true
            }}
            minZoom={0.8}
            maxZoom={2}
            fitViewOptions={{ padding: 150 }}
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>
      </CardContent>
    </Card>
  );
}