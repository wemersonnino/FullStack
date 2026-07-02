import { ProjectManagement } from '@/components/dashboard/ProjectManagement';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';

export default function ProjetosPage() {
  return (
    <div className="container mx-auto space-y-8 py-10">
      <DashboardPageHeader
        eyebrow="Portifolio Operacional"
        title="Projetos conectados a equipe, postos e demanda de escala."
        description="Ajuste o mapa de projetos que recebe colaboradores e cobertura. Essa leitura ajuda a identificar frentes ativas, portifolio inativo e distribuicao operacional antes de publicar a escala."
      />
      <ProjectManagement />
    </div>
  );
}
