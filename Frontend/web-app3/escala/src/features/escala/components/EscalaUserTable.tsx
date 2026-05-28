'use client';

import { useState } from 'react';
import { 
  ChevronRight, 
  Search, 
  Filter, 
  MoreVertical, 
  Calendar, 
  Mail,
  User as UserIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UsuarioEscala } from '@/interfaces/escala/escala.interface';

interface EscalaUserTableProps {
  users: UsuarioEscala[];
  onEditEscala: (user: UsuarioEscala) => void;
  onViewDetails: (user: UsuarioEscala) => void;
}

export function EscalaUserTable({ users, onEditEscala, onViewDetails }: EscalaUserTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const normalizedSearchTerm = searchTerm.toLowerCase();
  const filteredUsers = users.filter((user) => {
    const nome = user.nome ?? user.username ?? 'Funcionário';
    const email = user.email ?? '';

    return (
      nome.toLowerCase().includes(normalizedSearchTerm) ||
      email.toLowerCase().includes(normalizedSearchTerm)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar colaborador..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" /> Filtros
        </Button>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-[300px]">Colaborador</TableHead>
              <TableHead>Cargo / Setor</TableHead>
              <TableHead>Vínculo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => {
              const nome = user.nome ?? user.username ?? 'Funcionário';
              const email = user.email ?? 'E-mail não informado';

              return (
              <TableRow key={user.id} className="group hover:bg-muted/5 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                      <AvatarImage src={user.avatarUrl} />
                      <AvatarFallback>{nome.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-sm truncate">{nome}</span>
                      <span className="text-xs text-muted-foreground truncate flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {email}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.cargo || 'Não definido'}</span>
                    <span className="text-xs text-muted-foreground">{user.departamento || 'Geral'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal text-[10px] uppercase tracking-wider">
                    {user.tipoVinculo || 'CLT'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Ativo</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 gap-2"
                      onClick={() => onEditEscala(user)}
                    >
                      <Calendar className="h-3.5 w-3.5" /> Escala
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewDetails(user)} className="gap-2">
                          <UserIcon className="h-4 w-4" /> Ver Perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive gap-2">
                          Bloquear
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {filteredUsers.length === 0 && (
          <div className="py-20 text-center">
            <UserIcon className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
            <p className="text-muted-foreground">Nenhum colaborador encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
