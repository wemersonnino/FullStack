'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useAppTheme } from '@/components/shared/providers/ThemeProvider';
import { useAppStore } from '@/stores/app.store';
import { updateUserTheme } from '@/services/profile.service';
import { getUsers, grantUserRole, revokeUserRole, UserResponse } from '@/services/user.service';
import { ThemeEnum } from '@/interfaces/enums/theme.enum';
import { toast } from 'sonner';
import {
  Sun,
  Moon,
  Laptop,
  Shield,
  Users,
  RefreshCw,
  UserCheck,
  LockKeyhole,
  Building2,
  Link2,
  Activity,
  ArrowRight,
  Palette,
  Compass,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';

interface SettingsFormProps {
  user: any;
  isAdmin: boolean;
}

const AVAILABLE_ROLES = [
  { name: 'OWNER', label: 'Dono (Owner)' },
  { name: 'ADMIN', label: 'Administrador (Admin)' },
  { name: 'MANAGER', label: 'Gerente Operacional (Manager)' },
  { name: 'MANAGER_DIRETOR', label: 'Diretor (Jethro)' },
  { name: 'MANAGER_GERENTE', label: 'Gerente (Jethro)' },
  { name: 'MANAGER_COORDENADOR', label: 'Coordenador (Jethro)' },
  { name: 'MANAGER_SUPERVISOR', label: 'Supervisor (Jethro)' },
  { name: 'USER', label: 'Usuário Padrão (User)' }
];

const MANAGER_ROLES = [
  'MANAGER',
  'MANAGER_DIRETOR',
  'MANAGER_GERENTE',
  'MANAGER_COORDENADOR',
  'MANAGER_SUPERVISOR',
];

function getPrimaryRoleLabel(role?: string) {
  const found = AVAILABLE_ROLES.find((item) => item.name === role);
  return found?.label ?? 'Usuário Padrão (User)';
}

function AppearanceCard({
  theme,
  onThemeChange,
}: {
  theme: string;
  onThemeChange: (value: string) => void;
}) {
  return (
    <Card className="shadow-md border border-muted-foreground/10 bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-xl">Preferências Visuais</CardTitle>
          <CardDescription>Aparência e tema do aplicativo para o seu dia a dia.</CardDescription>
        </div>
        <Palette className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Tema do Sistema</label>
          <Select value={theme} onValueChange={onThemeChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um tema" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ThemeEnum.LIGHT}>
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-orange-500" />
                  <span>Claro</span>
                </div>
              </SelectItem>
              <SelectItem value={ThemeEnum.DARK}>
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-blue-500" />
                  <span>Escuro</span>
                </div>
              </SelectItem>
              <SelectItem value={ThemeEnum.SYSTEM}>
                <div className="flex items-center gap-2">
                  <Laptop className="h-4 w-4 text-muted-foreground" />
                  <span>Padrão do Sistema</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

export function SettingsForm({ user, isAdmin }: SettingsFormProps) {
  const { theme, setTheme } = useAppTheme();
  const { data: session, update } = useSession();
  const { setTheme: setAppTheme } = useAppStore();
  const primaryRole = user?.roles?.[0] || 'USER';
  const primaryRoleLabel = getPrimaryRoleLabel(primaryRole);
  const isManager = user?.roles?.some((role: string) => MANAGER_ROLES.includes(role)) || false;

  // States for user permission management
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [editingRolesOpen, setEditingRolesOpen] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const list = await getUsers();
      setUsers(list);
    } catch (error) {
      toast.error('Erro ao carregar lista de usuários.');
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    const timer = window.setTimeout(loadUsers, 0);
    return () => window.clearTimeout(timer);
  }, [isAdmin, loadUsers]);

  const handleThemeChange = async (newTheme: string) => {
    const enumTheme = newTheme as ThemeEnum;
    setTheme(enumTheme);
    setAppTheme(enumTheme);

    if (session?.user?.id) {
      try {
        await updateUserTheme(session.user.id, enumTheme);
        await update({ user: { ...session.user, theme: enumTheme } });
        toast.success('Preferência de tema atualizada com sucesso.');
      } catch (error) {
        toast.error('Erro ao salvar preferência de tema.');
      }
    }
  };

  const handleOpenRoleEdit = (user: UserResponse) => {
    setSelectedUser(user);
    setEditingRolesOpen(true);
  };

  const handleToggleRole = async (roleName: string, isChecked: boolean) => {
    if (!selectedUser) return;

    try {
      if (isChecked) {
        await grantUserRole(selectedUser.id, roleName);
        toast.success(`Cargo ${roleName} concedido a ${selectedUser.username}.`);
      } else {
        await revokeUserRole(selectedUser.id, roleName);
        toast.success(`Cargo ${roleName} revogado de ${selectedUser.username}.`);
      }
      
      // Update local state for modal
      const updatedRoles = isChecked
        ? [...(selectedUser.roles || []), roleName]
        : (selectedUser.roles || []).filter(r => r !== roleName);
      
      setSelectedUser({
        ...selectedUser,
        roles: updatedRoles
      });

      // Reload user list in background
      loadUsers();
    } catch (error) {
      toast.error('Erro ao atualizar cargos do usuário.');
    }
  };

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Configurações"
        title={
          isAdmin
            ? 'Conta, tenant e governança operacional em uma visão sem ruído.'
            : isManager
              ? 'Seu perfil de gestão e o contexto de atuação da equipe.'
              : 'Seu perfil profissional e as preferências do ambiente de trabalho.'
        }
        description={
          isAdmin
            ? 'Aqui a leitura precisa separar governança, identidade da conta e gestão de acesso. O objetivo é reduzir duplicidade e deixar claro o que é dado pessoal, o que é dado da organização e o que é controle administrativo.'
            : isManager
              ? 'Como gestor, você precisa entender rapidamente seu papel, o contexto do tenant e o que pode ajustar no ambiente sem misturar isso com governança de plataforma.'
              : 'Para o colaborador, esta tela deve ser simples: dados da conta, contexto de acesso e preferências pessoais. Informações da empresa aparecem apenas quando ajudam no entendimento do ambiente.'
        }
      />

      <Separator />

      {isAdmin ? (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="overflow-hidden border-0 bg-[linear-gradient(135deg,#111827_0%,#172554_45%,#0f766e_100%)] text-white shadow-xl shadow-slate-900/10">
            <CardContent className="grid gap-6 p-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                <Badge className="w-fit rounded-full bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white hover:bg-white/10">
                  Segurança Operacional
                </Badge>
                <div className="space-y-3">
                  <h3 className="max-w-xl text-3xl font-black tracking-tight">
                    Tenant isolado, sessão curta e convites protegidos na borda.
                  </h3>
                  <p className="max-w-2xl text-sm leading-6 text-slate-200">
                    O acesso agora opera com unicidade por empresa, headers mais rígidos no frontend, rate limit em
                    endpoints públicos e token de convite tratado como segredo transitório.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <LockKeyhole className="mb-3 h-5 w-5 text-emerald-300" />
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">JWT</p>
                    <p className="mt-2 text-sm font-semibold">15 min de expiração</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <Link2 className="mb-3 h-5 w-5 text-cyan-300" />
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Convites</p>
                    <p className="mt-2 text-sm font-semibold">Link exibido só na criação</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <Activity className="mb-3 h-5 w-5 text-amber-300" />
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">BFF</p>
                    <p className="mt-2 text-sm font-semibold">Rate limit em auth e leads</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/5 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Controles aplicados</p>
                <div className="mt-4 space-y-4 text-sm text-slate-100">
                  <div className="flex items-start gap-3">
                    <Shield className="mt-0.5 h-4 w-4 text-emerald-300" />
                    <p>E-mail de usuário passa a ser único dentro da empresa, não globalmente no banco inteiro.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Link2 className="mt-0.5 h-4 w-4 text-cyan-300" />
                    <p>Convites administrativos mostram o link apenas na criação e guardam somente a prévia do token.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Activity className="mt-0.5 h-4 w-4 text-amber-300" />
                    <p>Login, reset, contato e captura de lead receberam limitação por janela de tempo na borda.</p>
                  </div>
                </div>
                <Link
                  href="/dashboard/team/invites"
                  className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                >
                  Revisar convites e onboarding
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border border-muted-foreground/10 bg-card shadow-md">
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl">Conta e Tenant</CardTitle>
                <CardDescription>
                  Identidade da conta principal e dados institucionais úteis para suporte e governança.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-1">
                <div className="flex items-center gap-4 rounded-2xl bg-muted/45 p-4 border border-muted-foreground/10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-base font-black text-white uppercase">
                    {user?.username?.[0] || user?.email?.[0] || 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-bold text-foreground">{user?.username || 'Usuário'}</p>
                    <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm py-1 border-b">
                    <span className="text-muted-foreground">Identificador do tenant</span>
                    <Badge variant="outline" className="font-semibold">{user?.companySlug || 'default'}</Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm py-1 border-b">
                    <span className="text-muted-foreground">Perfil principal</span>
                    <Badge variant="secondary" className="font-semibold uppercase tracking-wider">{primaryRoleLabel}</Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm py-1 border-b">
                    <span className="text-muted-foreground">Email da conta</span>
                    <span className="truncate text-right text-sm font-medium">{user?.email || 'sem-email'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm py-1">
                    <span className="text-muted-foreground">Plano do tenant</span>
                    <Badge className="font-semibold bg-emerald-600 hover:bg-emerald-600 text-white uppercase">{user?.planType || 'TRIAL'}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <AppearanceCard theme={theme} onThemeChange={handleThemeChange} />
          </div>
        </div>
      ) : isManager ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_1fr_0.92fr]">
          <Card className="border border-muted-foreground/10 bg-card shadow-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Minha Conta</CardTitle>
              <CardDescription>Identidade pessoal usada para entrar e atuar na plataforma.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-1">
              <div className="flex items-center gap-4 rounded-2xl bg-muted/45 p-4 border border-muted-foreground/10">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-base font-black text-white uppercase">
                  {user?.username?.[0] || user?.email?.[0] || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-bold text-foreground">{user?.username || 'Usuário'}</p>
                  <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm py-1 border-b">
                  <span className="text-muted-foreground">Perfil principal</span>
                  <Badge variant="secondary" className="font-semibold uppercase tracking-wider">{primaryRoleLabel}</Badge>
                </div>
                <div className="flex justify-between items-center text-sm py-1">
                  <span className="text-muted-foreground">Escopo esperado</span>
                  <span className="text-right text-sm font-medium">Leitura operacional e coordenação</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-muted-foreground/10 bg-card shadow-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Contexto na Organização</CardTitle>
              <CardDescription>Dados institucionais úteis para entender onde sua conta está inserida.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-1">
              <div className="rounded-2xl border bg-muted/30 p-4">
                <div className="flex items-start gap-3">
                  <Building2 className="mt-0.5 h-4 w-4 text-primary" />
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Tenant em uso: {user?.companySlug || 'default'}</p>
                    <p className="text-sm text-muted-foreground">
                      Este identificador organiza o acesso, a equipe e os dados operacionais da sua empresa.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm py-1 border-b">
                  <span className="text-muted-foreground">Plano do tenant</span>
                  <Badge className="font-semibold bg-emerald-600 hover:bg-emerald-600 text-white uppercase">{user?.planType || 'TRIAL'}</Badge>
                </div>
                <div className="flex justify-between items-center text-sm py-1">
                  <span className="text-muted-foreground">Fluxo recomendado</span>
                  <span className="text-right text-sm font-medium">Dashboard, equipe, escalas e decisões</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" className="rounded-2xl" asChild>
                  <Link href="/dashboard/team">Abrir equipe</Link>
                </Button>
                <Button className="rounded-2xl" asChild>
                  <Link href="/dashboard/escala">Abrir escalas</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <AppearanceCard theme={theme} onThemeChange={handleThemeChange} />
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr_1fr_0.92fr]">
          <Card className="border border-muted-foreground/10 bg-card shadow-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Minha Conta</CardTitle>
              <CardDescription>Dados pessoais de acesso e identificação profissional.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-1">
              <div className="flex items-center gap-4 rounded-2xl bg-muted/45 p-4 border border-muted-foreground/10">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-base font-black text-white uppercase">
                  {user?.username?.[0] || user?.email?.[0] || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-bold text-foreground">{user?.username || 'Usuário'}</p>
                  <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm py-1 border-b">
                  <span className="text-muted-foreground">Perfil principal</span>
                  <Badge variant="secondary" className="font-semibold uppercase tracking-wider">{primaryRoleLabel}</Badge>
                </div>
                <div className="flex justify-between items-center text-sm py-1">
                  <span className="text-muted-foreground">Conta de contato</span>
                  <span className="truncate text-right text-sm font-medium">{user?.email || 'sem-email'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-muted-foreground/10 bg-card shadow-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Seu Ambiente de Trabalho</CardTitle>
              <CardDescription>Informações da organização mostradas apenas no nível útil para o colaborador.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-1">
              <div className="rounded-2xl border bg-muted/30 p-4">
                <div className="flex items-start gap-3">
                  <Eye className="mt-0.5 h-4 w-4 text-primary" />
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Você está no tenant {user?.companySlug || 'default'}.</p>
                    <p className="text-sm text-muted-foreground">
                      Esse identificador organiza o acesso e a operação da empresa, mas não exige ação sua no dia a dia.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm py-1 border-b">
                  <span className="text-muted-foreground">Plano da empresa</span>
                  <Badge className="font-semibold bg-emerald-600 hover:bg-emerald-600 text-white uppercase">{user?.planType || 'TRIAL'}</Badge>
                </div>
                <div className="flex justify-between items-center text-sm py-1">
                  <span className="text-muted-foreground">Leitura recomendada</span>
                  <span className="text-right text-sm font-medium">Escalas, trocas e mensagens</span>
                </div>
              </div>
              <Button className="rounded-2xl" asChild>
                <Link href="/dashboard/escala">Abrir minha escala</Link>
              </Button>
            </CardContent>
          </Card>

          <AppearanceCard theme={theme} onThemeChange={handleThemeChange} />
        </div>
      )}

      {isAdmin && (
        <Card className="shadow-md border border-muted-foreground/10 bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-xl">Gestão de Controle de Acesso (ReBAC)</CardTitle>
              <CardDescription>
                Gerenciamento de papéis e níveis de acesso dos usuários da sua organização.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={loadUsers}
                disabled={loadingUsers}
                className="h-9 w-9"
              >
                <RefreshCw className={`h-4 w-4 ${loadingUsers ? 'animate-spin' : ''}`} />
              </Button>
              <Shield className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Permissões / Roles</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingUsers ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Carregando usuários da empresa...
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Nenhum usuário encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.username}</TableCell>
                        <TableCell>{item.email}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {item.roles && item.roles.length > 0 ? (
                              item.roles.map((role) => (
                                <Badge key={role} variant="secondary">
                                  {role}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">Nenhuma role ativa</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenRoleEdit(item)}
                            className="flex items-center gap-2 ml-auto"
                          >
                            <UserCheck className="h-4 w-4" />
                            <span>Gerenciar Cargos</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal para Editar Roles */}
      <Dialog open={editingRolesOpen} onOpenChange={setEditingRolesOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Gerenciar Cargos e Permissões</DialogTitle>
            <DialogDescription>
              Selecione as permissões ativas para o usuário{' '}
              <span className="font-bold text-primary">{selectedUser?.username}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {AVAILABLE_ROLES.map((role) => {
              const isChecked = selectedUser?.roles?.includes(role.name) || false;
              return (
                <div key={role.name} className="flex items-start space-x-3 space-y-0 rounded-md border p-3 hover:bg-accent/50 transition-colors">
                  <Checkbox
                    id={`role-${role.name}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => handleToggleRole(role.name, !!checked)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor={`role-${role.name}`}
                      className="text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {role.label}
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Permite acessar recursos vinculados ao papel de {role.name}.
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button type="button" onClick={() => setEditingRolesOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
