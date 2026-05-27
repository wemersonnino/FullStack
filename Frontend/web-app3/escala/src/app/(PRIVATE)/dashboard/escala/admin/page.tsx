'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { EscalaUserTable } from '@/features/escala/components/EscalaUserTable';
import { EscalaUserEditModal } from '@/features/escala/components/EscalaUserEditModal';
import { UsuarioEscala } from '@/interfaces/escala/escala.interface';
import { getUsuariosEscalaveis } from '@/services/escala.service';
import { toast } from 'sonner';
import { ArrowLeft, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function EscalaAdminPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<UsuarioEscala[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UsuarioEscala | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isAdmin = session?.user?.roles?.includes('ADMIN');

  useEffect(() => {
    if (session && !isAdmin) {
      redirect('/dashboard/escala');
    }
    fetchUsers();
  }, [session, isAdmin]);

  async function fetchUsers() {
    setIsLoading(true);
    try {
      const data = await getUsuariosEscalaveis({});
      setUsers(data);
    } catch (error) {
      toast.error('Erro ao carregar colaboradores.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleEditEscala = (user: UsuarioEscala) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleViewProfile = (user: UsuarioEscala) => {
    // Redirect to profile or open a different modal
    toast.info(`Visualizando perfil de ${user.nome}`);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Button variant="ghost" size="sm" asChild className="-ml-2 h-8">
              <Link href="/dashboard/escala">
                <ArrowLeft className="h-4 w-4 mr-1" /> Voltar ao Calendário
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Escalas</h1>
          <p className="text-muted-foreground">
            Selecione um colaborador para definir seus dias de trabalho.
          </p>
        </div>
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg border border-primary/20 flex items-center gap-3">
          <Users className="h-5 w-5" />
          <div className="flex flex-col">
            <span className="text-xs font-medium uppercase tracking-wider opacity-70">Total Equipe</span>
            <span className="text-xl font-bold leading-none">{users.length}</span>
          </div>
        </div>
      </div>

      <EscalaUserTable 
        users={users} 
        onEditEscala={handleEditEscala} 
        onViewDetails={handleViewProfile}
      />

      <EscalaUserEditModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchUsers}
      />
    </div>
  );
}
