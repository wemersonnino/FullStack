import { ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ManagementClosure,
  ManagementEdge,
  ManagerAssignment,
  ManagerRoleLevelOption,
  ManagerScopeType,
  ManagerScopeTypeOption,
} from '@/core/domain/models/rebac.model';
import { UserProfile } from '@/core/domain/models/user.model';
import {
  AssignmentForm,
  DeleteAssignmentButton,
  DeleteEdgeButton,
  EdgeForm,
  RecalculateClosureButton,
} from './RebacAdminActions';

type ScopeOption = {
  type: ManagerScopeType;
  id: string;
  label: string;
};

type RebacAdminViewProps = {
  users: UserProfile[];
  assignments: ManagerAssignment[];
  edges: ManagementEdge[];
  closure: ManagementClosure[];
  scopeTypes: ManagerScopeTypeOption[];
  roleLevels: ManagerRoleLevelOption[];
  scopeOptions: ScopeOption[];
};

function formatDate(value?: string | null) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function scopeLabel(scopeOptions: ScopeOption[], type: ManagerScopeType, id: string) {
  return scopeOptions.find((item) => item.type === type && item.id === id)?.label ?? `${type} #${id}`;
}

export function RebacAdminView(props: RebacAdminViewProps) {
  const { users, assignments, edges, closure, scopeTypes, roleLevels, scopeOptions } = props;

  return (
    <section className="container mx-auto space-y-6 py-8">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-muted-foreground">
          <ShieldCheck className="size-5" />
          <span className="text-sm font-medium uppercase">ReBAC Jethro</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Gestão Hierárquica</h1>
        <p className="text-muted-foreground">
          Administre escopos de gestão, relações diretas e a tabela transitiva usada pelo PolicyService.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-lg shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Assignments</CardDescription>
            <CardTitle>{assignments.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-lg shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Edges</CardDescription>
            <CardTitle>{edges.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-lg shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Closure paths</CardDescription>
            <CardTitle>{closure.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-lg shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Usuários elegíveis</CardDescription>
            <CardTitle>{users.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="assignments" className="space-y-4">
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="assignments">manager_assignments</TabsTrigger>
          <TabsTrigger value="edges">management_edges</TabsTrigger>
          <TabsTrigger value="closure">management_closure</TabsTrigger>
          <TabsTrigger value="enums">Enums e pesos</TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="space-y-4">
          <AssignmentForm {...props} />
          <Card className="rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle>manager_assignments</CardTitle>
              <CardDescription>Vincula gestores a escopos operacionais administráveis.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Gestor</TableHead>
                    <TableHead>Escopo</TableHead>
                    <TableHead>Nível</TableHead>
                    <TableHead>Vigência</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <div className="font-medium">{assignment.managerName}</div>
                        <div className="text-xs text-muted-foreground">{assignment.managerEmail}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-xs">{assignment.scopeType}</div>
                        <div className="text-sm">{scopeLabel(scopeOptions, assignment.scopeType, assignment.scopeId)}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{assignment.roleLevel}</Badge>
                        <span className="ml-2 text-xs text-muted-foreground">{assignment.levelWeight}</span>
                      </TableCell>
                      <TableCell className="text-xs">
                        {formatDate(assignment.startsAt)} até {formatDate(assignment.endsAt)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={assignment.active ? 'default' : 'secondary'}>{assignment.active ? 'Ativo' : 'Inativo'}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DeleteAssignmentButton id={assignment.id} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edges" className="space-y-4">
          <EdgeForm {...props} />
          <Card className="rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle>management_edges</CardTitle>
              <CardDescription>Define as relações diretas usadas para calcular subordinação transitiva.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Superior</TableHead>
                    <TableHead>Subordinado</TableHead>
                    <TableHead>Relação</TableHead>
                    <TableHead>Vigência</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {edges.map((edge) => (
                    <TableRow key={edge.id}>
                      <TableCell>
                        <div className="font-medium">{edge.parentName}</div>
                        <div className="text-xs text-muted-foreground">{edge.parentEmail}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{edge.childName}</div>
                        <div className="text-xs text-muted-foreground">{edge.childEmail}</div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{edge.relationType}</Badge></TableCell>
                      <TableCell className="text-xs">{formatDate(edge.startsAt)} até {formatDate(edge.endsAt)}</TableCell>
                      <TableCell>
                        <Badge variant={edge.active ? 'default' : 'secondary'}>{edge.active ? 'Ativo' : 'Inativo'}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DeleteEdgeButton id={edge.id} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="closure" className="space-y-4">
          <div className="flex justify-end">
            <RecalculateClosureButton />
          </div>
          <Card className="rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle>management_closure</CardTitle>
              <CardDescription>Tabela derivada para consultas rápidas de autorização hierárquica.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ancestor</TableHead>
                    <TableHead>Descendant</TableHead>
                    <TableHead>Depth</TableHead>
                    <TableHead>Max weight path</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {closure.map((path) => (
                    <TableRow key={path.id}>
                      <TableCell>
                        <div className="font-medium">{path.ancestorName}</div>
                        <div className="text-xs text-muted-foreground">{path.ancestorEmail}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{path.descendantName}</div>
                        <div className="text-xs text-muted-foreground">{path.descendantEmail}</div>
                      </TableCell>
                      <TableCell>{path.depth}</TableCell>
                      <TableCell>{path.maxWeightPath}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enums" className="grid gap-4 md:grid-cols-2">
          <Card className="rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle>ManagerScopeType</CardTitle>
              <CardDescription>Escopos aceitos em manager_assignments.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {scopeTypes.map((item) => <Badge key={item.name} variant="secondary">{item.name}</Badge>)}
            </CardContent>
          </Card>
          <Card className="rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle>ManagerRoleLevel</CardTitle>
              <CardDescription>Pesos usados pelo PolicyService no backend.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nível</TableHead>
                    <TableHead>Peso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roleLevels.map((item) => (
                    <TableRow key={item.name}>
                      <TableCell><Badge variant="outline">{item.name}</Badge></TableCell>
                      <TableCell>{item.weight}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}
