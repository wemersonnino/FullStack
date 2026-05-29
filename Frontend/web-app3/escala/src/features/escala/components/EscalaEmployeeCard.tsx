import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UsuarioEscala } from '@/core/domain/escala/escala.types';

export function EscalaEmployeeCard({ usuario }: { usuario: UsuarioEscala }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="grid size-12 shrink-0 place-items-center rounded-full bg-primary text-base font-semibold text-primary-foreground">
          {usuario.nome.slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold">{usuario.nome}</h3>
          <p className="truncate text-sm text-muted-foreground">{usuario.username || usuario.email}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-2 text-sm">
        <p><span className="text-muted-foreground">Cargo:</span> {usuario.cargo || 'Colaborador'}</p>
        <p><span className="text-muted-foreground">Departamento:</span> {usuario.departamento || usuario.setorNome || 'Sem setor'}</p>
        <p><span className="text-muted-foreground">Vinculo:</span> {usuario.tipoVinculo || 'CLT'}</p>
        <p><span className="text-muted-foreground">Localizacao:</span> {usuario.remoto ? 'Remoto' : usuario.projetoNome || 'Presencial'}</p>
      </div>
      <div className="mt-4 flex gap-2">
        <Button type="button" variant="outline" size="sm">Detalhes</Button>
        <Button type="button" variant="outline" size="sm" asChild>
          <a href={`mailto:${usuario.email}`}>
            <Mail className="size-4" />
            Email
          </a>
        </Button>
      </div>
    </div>
  );
}
