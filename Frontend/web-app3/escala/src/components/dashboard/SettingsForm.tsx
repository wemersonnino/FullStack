'use client';

import { useCallback, useEffect, useState } from 'react';
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
  Check,
  RefreshCw,
  UserCheck
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

export function SettingsForm({ user, isAdmin }: SettingsFormProps) {
  const { theme, setTheme } = useAppTheme();
  const { data: session, update } = useSession();
  const { setTheme: setAppTheme } = useAppStore();

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
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">
          Gerencie as preferências visuais do sistema e as permissões de acesso da equipe.
        </p>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-md border border-muted-foreground/10 bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-xl">Preferências Visuais</CardTitle>
              <CardDescription>Aparência e tema de cores do aplicativo.</CardDescription>
            </div>
            <Sun className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tema do Sistema</label>
              <Select value={theme} onValueChange={handleThemeChange}>
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

        <Card className="shadow-md border border-muted-foreground/10 bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-xl">Dados da Empresa</CardTitle>
              <CardDescription>Resumo de licença e organização.</CardDescription>
            </div>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex justify-between items-center text-sm py-1 border-b">
              <span className="text-muted-foreground">Identificador (Slug):</span>
              <span className="font-bold">{user?.companySlug || 'Default'}</span>
            </div>
            <div className="flex justify-between items-center text-sm py-1 border-b">
              <span className="text-muted-foreground">Perfil Principal:</span>
              <span className="font-bold">{user?.roles?.[0] || 'User'}</span>
            </div>
            <div className="flex justify-between items-center text-sm py-1">
              <span className="text-muted-foreground">Email da Conta:</span>
              <span className="font-bold">{user?.email}</span>
            </div>
          </CardContent>
        </Card>
      </div>

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
