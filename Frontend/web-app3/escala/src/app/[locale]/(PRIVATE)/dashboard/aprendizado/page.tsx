import { LearningProgressPanel } from '@/components/dashboard/learning/LearningProgressPanel';
import { getLearningProgress } from '@/services/learning-progress.service';
import { getRequiredServerAuth } from '@/lib/auth/server-auth';

export const metadata = {
  title: 'Aprendizado | Plataforma Escala',
};

export default async function AprendizadoPage() {
  const { accessToken } = await getRequiredServerAuth();
  const items = await getLearningProgress(accessToken);

  return (
    <div className="container mx-auto space-y-6 py-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Aprendizado</h1>
        <p className="text-muted-foreground">
          Registre e acompanhe progresso operacional vinculado ao usuário autenticado.
        </p>
      </div>
      <LearningProgressPanel initialItems={items} />
    </div>
  );
}
