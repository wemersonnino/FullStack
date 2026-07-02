import { LearningProgressPanel } from '@/components/dashboard/learning/LearningProgressPanel';
import { getLearningProgress } from '@/services/learning-progress.service';
import { getRequiredServerAuth } from '@/lib/auth/server-auth';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';

export const metadata = {
  title: 'Aprendizado | Plataforma Escala',
};

export default async function AprendizadoPage() {
  const { accessToken, session } = await getRequiredServerAuth();
  const items = await getLearningProgress(accessToken);
  const roles = session.user.roles ?? [];
  const isManagerOrAdmin =
    roles.includes('ADMIN') ||
    roles.includes('OWNER') ||
    roles.some((role) => role.startsWith('MANAGER'));

  return (
    <div className="container mx-auto space-y-8 py-10">
      <DashboardPageHeader
        eyebrow="Aprendizado"
        title={
          isManagerOrAdmin
            ? 'Capacitacao operacional com leitura clara do seu progresso e dos registros manuais necessarios.'
            : 'Sua trilha de aprendizado deve mostrar o que aprender, o que concluir e o que ainda falta.'
        }
        description={
          isManagerOrAdmin
            ? 'Para perfis de gestao, a tela combina acompanhamento pessoal com um bloco de registro manual para evidencias, treinamentos internos e topicos ainda nao estruturados em trilha.'
            : 'Para o colaborador, a experiencia precisa funcionar como produto: modulos, topicos, progresso e proximos passos. O cadastro manual deixa de ser protagonista.'
        }
      />
      <LearningProgressPanel initialItems={items} isManagerOrAdmin={isManagerOrAdmin} />
    </div>
  );
}
