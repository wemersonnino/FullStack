'use client';

import { useDeferredValue, useState } from 'react';
import { GitBranch, Network, Search, ShieldCheck, Users2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
  const [assignmentQuery, setAssignmentQuery] = useState('');
  const [edgeQuery, setEdgeQuery] = useState('');
  const [closureQuery, setClosureQuery] = useState('');

  const deferredAssignmentQuery = useDeferredValue(assignmentQuery.trim().toLowerCase());
  const deferredEdgeQuery = useDeferredValue(edgeQuery.trim().toLowerCase());
  const deferredClosureQuery = useDeferredValue(closureQuery.trim().toLowerCase());

  const activeAssignments = assignments.filter((item) => item.active);
  const activeEdges = edges.filter((item) => item.active);
  const maxDepth = closure.reduce((acc, item) => Math.max(acc, item.depth), 0);
  const highestWeight = closure.reduce((acc, item) => Math.max(acc, item.maxWeightPath), 0);

  const filteredAssignments = assignments.filter((assignment) => {
    if (!deferredAssignmentQuery) return true;
    const target = [
      assignment.managerName,
      assignment.managerEmail,
      assignment.scopeType,
      assignment.scopeId,
      assignment.roleLevel,
      scopeLabel(scopeOptions, assignment.scopeType, assignment.scopeId),
    ]
      .join(' ')
      .toLowerCase();
    return target.includes(deferredAssignmentQuery);
  });

  const filteredEdges = edges.filter((edge) => {
    if (!deferredEdgeQuery) return true;
    const target = [
      edge.parentName,
      edge.parentEmail,
      edge.childName,
      edge.childEmail,
      edge.relationType,
    ]
      .join(' ')
      .toLowerCase();
    return target.includes(deferredEdgeQuery);
  });

  const filteredClosure = closure.filter((path) => {
    if (!deferredClosureQuery) return true;
    const target = [
      path.ancestorName,
      path.ancestorEmail,
      path.descendantName,
      path.descendantEmail,
      String(path.depth),
      String(path.maxWeightPath),
    ]
      .join(' ')
      .toLowerCase();
    return target.includes(deferredClosureQuery);
  });

  return (
    <section className="container mx-auto space-y-6 py-8">
      <div className="rounded-3xl border bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8 text-white shadow-xl">
        <div className="flex flex-wrap items-center gap-3 text-slate-300">
          <Badge className="border-white/15 bg-white/10 text-white hover:bg-white/10">
            Hierarquia de Gestão
          </Badge>
          <span className="text-sm">Governança hierárquica e escopo administrativo</span>
        </div>
        <div className="mt-4 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3">
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Governança de acesso por cadeia de gestão
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
              Configure quem administra empresa, setor, projeto, posto e colaborador. A tela combina
              alçadas formais, relações diretas e a hierarquia transitiva usada nas políticas do backend.
            </p>
          </div>
          <Card className="border-white/10 bg-white/5 text-white shadow-none">
            <CardHeader>
              <CardTitle className="text-base">Como pensar a modelagem</CardTitle>
              <CardDescription className="text-slate-300">
                Use assignments para alçada por escopo e edges para representar quem responde a quem.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-200">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 size-4 text-emerald-400" />
                <span>Assignments controlam permissão administrativa contextual.</span>
              </div>
              <div className="flex items-start gap-3">
                <Network className="mt-0.5 size-4 text-cyan-300" />
                <span>Edges definem relação de liderança direta para cálculo de subordinação.</span>
              </div>
              <div className="flex items-start gap-3">
                <GitBranch className="mt-0.5 size-4 text-amber-300" />
                <span>Closure é a árvore derivada que acelera autorização no PolicyService.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Alçadas cadastradas</CardDescription>
            <CardTitle className="flex items-center justify-between text-3xl">
              {assignments.length}
              <ShieldCheck className="size-5 text-primary" />
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {activeAssignments.length} ativas com vigência válida
            </p>
          </CardHeader>
        </Card>
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Relações diretas</CardDescription>
            <CardTitle className="flex items-center justify-between text-3xl">
              {edges.length}
              <Network className="size-5 text-primary" />
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {activeEdges.length} conexões ativas na malha de liderança
            </p>
          </CardHeader>
        </Card>
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Fechamento transitivo</CardDescription>
            <CardTitle className="flex items-center justify-between text-3xl">
              {closure.length}
              <GitBranch className="size-5 text-primary" />
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              profundidade máxima {maxDepth} e peso máximo {highestWeight}
            </p>
          </CardHeader>
        </Card>
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Base elegível</CardDescription>
            <CardTitle className="flex items-center justify-between text-3xl">
              {users.length}
              <Users2 className="size-5 text-primary" />
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              usuários disponíveis para vínculo ou liderança
            </p>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="assignments" className="space-y-4">
        <TabsList className="h-auto flex-wrap justify-start rounded-2xl bg-muted/60 p-1">
          <TabsTrigger value="assignments">Alçadas</TabsTrigger>
          <TabsTrigger value="edges">Relações</TabsTrigger>
          <TabsTrigger value="closure">Hierarquia derivada</TabsTrigger>
          <TabsTrigger value="enums">Catálogo técnico</TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="space-y-4">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle>Nova alçada administrativa</CardTitle>
              <CardDescription>
                Defina qual gestor administra qual escopo e com qual peso hierárquico.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AssignmentForm {...props} />
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle>Alçadas vigentes</CardTitle>
                  <CardDescription>
                    Vínculos que autorizam gestores a operar empresa, setor, projeto, posto ou colaborador.
                  </CardDescription>
                </div>
                <div className="relative w-full lg:w-80">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={assignmentQuery}
                    onChange={(event) => setAssignmentQuery(event.target.value)}
                    placeholder="Buscar gestor, escopo ou nível"
                    className="pl-9"
                  />
                </div>
              </div>
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
                  {filteredAssignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <div className="font-medium">{assignment.managerName}</div>
                        <div className="text-xs text-muted-foreground">{assignment.managerEmail}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-xs text-muted-foreground">{assignment.scopeType}</div>
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
                  {filteredAssignments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                        Nenhuma alçada encontrada para o filtro informado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edges" className="space-y-4">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle>Nova relação de liderança</CardTitle>
              <CardDescription>
                Estruture a cadeia direta de reporte para cálculo de subordinação e delegação.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EdgeForm {...props} />
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle>Relações diretas</CardTitle>
                  <CardDescription>
                    Base primária da hierarquia. Cada linha representa quem lidera quem.
                  </CardDescription>
                </div>
                <div className="relative w-full lg:w-80">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={edgeQuery}
                    onChange={(event) => setEdgeQuery(event.target.value)}
                    placeholder="Buscar superior, subordinado ou relação"
                    className="pl-9"
                  />
                </div>
              </div>
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
                  {filteredEdges.map((edge) => (
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
                  {filteredEdges.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                        Nenhuma relação direta encontrada para o filtro informado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="closure" className="space-y-4">
          <div className="flex justify-end">
            <RecalculateClosureButton />
          </div>
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle>Hierarquia derivada</CardTitle>
                  <CardDescription>
                    Resultado transitivo usado pelo backend para responder rapidamente se um gestor pode administrar outro usuário.
                  </CardDescription>
                </div>
                <div className="relative w-full lg:w-80">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={closureQuery}
                    onChange={(event) => setClosureQuery(event.target.value)}
                    placeholder="Buscar ancestor, descendant ou profundidade"
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Gestor ancestral</TableHead>
                    <TableHead>Subordinado alcançado</TableHead>
                    <TableHead>Profundidade</TableHead>
                    <TableHead>Maior peso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClosure.map((path) => (
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
                  {filteredClosure.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                        Nenhum caminho hierárquico encontrado para o filtro informado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enums" className="grid gap-4 md:grid-cols-2">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle>Escopos suportados</CardTitle>
              <CardDescription>Domínios aceitos para associação de alçada administrativa.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {scopeTypes.map((item) => <Badge key={item.name} variant="secondary">{item.name}</Badge>)}
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle>Níveis e pesos</CardTitle>
              <CardDescription>Catálogo hierárquico usado nas regras do PolicyService.</CardDescription>
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
