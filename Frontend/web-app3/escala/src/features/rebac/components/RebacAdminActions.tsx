'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Network, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RebacService } from '@/core/application/services/rebac.service';
import {
  ManagerAssignment,
  ManagementEdge,
  ManagerRoleLevel,
  ManagerRoleLevelOption,
  ManagerScopeType,
  ManagerScopeTypeOption,
} from '@/core/domain/models/rebac.model';
import { UserProfile } from '@/core/domain/models/user.model';

type ScopeOption = {
  type: ManagerScopeType;
  id: string;
  label: string;
};

type RebacAdminActionsProps = {
  token: string;
  users: UserProfile[];
  scopeTypes: ManagerScopeTypeOption[];
  roleLevels: ManagerRoleLevelOption[];
  scopeOptions: ScopeOption[];
  assignments: ManagerAssignment[];
  edges: ManagementEdge[];
};

function userLabel(user: UserProfile) {
  return `${user.username || user.email} (${user.email})`;
}

export function AssignmentForm({ token, users, scopeTypes, roleLevels, scopeOptions }: RebacAdminActionsProps) {
  const router = useRouter();
  const [isSubmitting, setSubmitting] = useState(false);
  const [scopeType, setScopeType] = useState<ManagerScopeType>(scopeTypes[0]?.name ?? 'COMPANY');
  const availableScopes = scopeOptions.filter((item) => item.type === scopeType);

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    try {
      await RebacService.createAssignment(token, {
        managerUserId: formData.get('managerUserId')?.toString() || '',
        scopeType,
        scopeId: formData.get('scopeId')?.toString() || '',
        roleLevel: formData.get('roleLevel') as ManagerRoleLevel,
        startsAt: formData.get('startsAt')?.toString() || undefined,
        endsAt: formData.get('endsAt')?.toString() || undefined,
        active: formData.get('active') === 'on',
      });
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form action={handleSubmit} className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-6">
      <div className="space-y-1 md:col-span-2">
        <Label>Gestor</Label>
        <Select name="managerUserId" required>
          <SelectTrigger><SelectValue placeholder="Selecionar usuário" /></SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>{userLabel(user)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label>Escopo</Label>
        <Select value={scopeType} onValueChange={(value) => setScopeType(value as ManagerScopeType)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {scopeTypes.map((item) => (
              <SelectItem key={item.name} value={item.name}>{item.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1 md:col-span-2">
        <Label>Entidade</Label>
        <Select name="scopeId" required>
          <SelectTrigger><SelectValue placeholder="Selecionar destino" /></SelectTrigger>
          <SelectContent>
            {availableScopes.map((item) => (
              <SelectItem key={`${item.type}-${item.id}`} value={String(item.id)}>{item.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label>Nível</Label>
        <Select name="roleLevel" required>
          <SelectTrigger><SelectValue placeholder="Role" /></SelectTrigger>
          <SelectContent>
            {roleLevels.map((item) => (
              <SelectItem key={item.name} value={item.name}>{item.name} ({item.weight})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label>Início</Label>
        <Input name="startsAt" type="datetime-local" />
      </div>
      <div className="space-y-1">
        <Label>Fim</Label>
        <Input name="endsAt" type="datetime-local" />
      </div>
      <label className="flex items-end gap-2 pb-2 text-sm">
        <input name="active" type="checkbox" defaultChecked className="size-4" />
        Ativo
      </label>
      <div className="flex items-end md:col-span-3">
        <Button type="submit" isLoading={isSubmitting}>
          <Plus className="size-4" />
          Criar assignment
        </Button>
      </div>
    </form>
  );
}

export function EdgeForm({ token, users }: RebacAdminActionsProps) {
  const router = useRouter();
  const [isSubmitting, setSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    try {
      await RebacService.createEdge(token, {
        parentUserId: formData.get('parentUserId')?.toString() || '',
        childUserId: formData.get('childUserId')?.toString() || '',
        relationType: formData.get('relationType')?.toString() || 'REPORTS_TO',
        startsAt: formData.get('startsAt')?.toString() || undefined,
        endsAt: formData.get('endsAt')?.toString() || undefined,
        active: formData.get('active') === 'on',
      });
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form action={handleSubmit} className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-6">
      <div className="space-y-1 md:col-span-2">
        <Label>Gestor superior</Label>
        <Select name="parentUserId" required>
          <SelectTrigger><SelectValue placeholder="Selecionar gestor" /></SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>{userLabel(user)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1 md:col-span-2">
        <Label>Subordinado</Label>
        <Select name="childUserId" required>
          <SelectTrigger><SelectValue placeholder="Selecionar subordinado" /></SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>{userLabel(user)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>Relação</Label>
        <Input name="relationType" defaultValue="REPORTS_TO" />
      </div>
      <label className="flex items-end gap-2 pb-2 text-sm">
        <input name="active" type="checkbox" defaultChecked className="size-4" />
        Ativo
      </label>
      <div className="space-y-1">
        <Label>Início</Label>
        <Input name="startsAt" type="datetime-local" />
      </div>
      <div className="space-y-1">
        <Label>Fim</Label>
        <Input name="endsAt" type="datetime-local" />
      </div>
      <div className="flex items-end md:col-span-4">
        <Button type="submit" isLoading={isSubmitting}>
          <Network className="size-4" />
          Criar edge
        </Button>
      </div>
    </form>
  );
}

export function DeleteAssignmentButton({ token, id }: { token: string; id: string }) {
  const router = useRouter();
  const [isSubmitting, setSubmitting] = useState(false);

  async function handleClick() {
    setSubmitting(true);
    try {
      await RebacService.deleteAssignment(token, id);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Button type="button" size="icon-sm" variant="ghost" isLoading={isSubmitting} onClick={handleClick} aria-label="Remover assignment">
      <Trash2 className="size-4" />
    </Button>
  );
}

export function DeleteEdgeButton({ token, id }: { token: string; id: string }) {
  const router = useRouter();
  const [isSubmitting, setSubmitting] = useState(false);

  async function handleClick() {
    setSubmitting(true);
    try {
      await RebacService.deleteEdge(token, id);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Button type="button" size="icon-sm" variant="ghost" isLoading={isSubmitting} onClick={handleClick} aria-label="Remover edge">
      <Trash2 className="size-4" />
    </Button>
  );
}

export function RecalculateClosureButton({ token }: { token: string }) {
  const router = useRouter();
  const [isSubmitting, setSubmitting] = useState(false);

  async function handleClick() {
    setSubmitting(true);
    try {
      await RebacService.recalculateClosure(token);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Button type="button" variant="outline" isLoading={isSubmitting} onClick={handleClick}>
      <RefreshCw className="size-4" />
      Recalcular closure
    </Button>
  );
}
