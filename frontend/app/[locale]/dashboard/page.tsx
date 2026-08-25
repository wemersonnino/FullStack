import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function Dashboard() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/users"
            className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-semibold mb-2">Usuários</h2>
            <p className="text-muted-foreground">Gerenciar usuários do sistema</p>
          </Link>
          
          <Link
            href="/shifts"
            className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-semibold mb-2">Turnos</h2>
            <p className="text-muted-foreground">Gerenciar turnos de trabalho</p>
          </Link>
          
          <Link
            href="/schedules"
            className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-semibold mb-2">Escalas</h2>
            <p className="text-muted-foreground">Gerenciar escalas de trabalho</p>
          </Link>
          
          <Link
            href="/announcements"
            className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-semibold mb-2">Anúncios</h2>
            <p className="text-muted-foreground">Gerenciar anúncios do sistema</p>
          </Link>
          
          <Link
            href="/audit"
            className="p-6 border rounded-lg hover:shadow-lg transition-shadow"
          >
            <h2 className="text-2xl font-semibold mb-2">Auditoria</h2>
            <p className="text-muted-foreground">Visualizar logs de auditoria</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
