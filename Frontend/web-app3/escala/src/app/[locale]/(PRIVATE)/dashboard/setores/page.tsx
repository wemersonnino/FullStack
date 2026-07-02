'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SectorManagement } from '@/components/dashboard/SectorManagement';
import { WorkPostManagement } from '@/components/dashboard/WorkPostManagement';
import { OperationalCapacityForm } from '@/components/dashboard/OperationalCapacityForm';
import { Building2, Layers3, MapPinned } from 'lucide-react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';

export default function SetoresPage() {
  return (
    <div className="container mx-auto py-10 space-y-8">
      <DashboardPageHeader
        eyebrow="Estrutura Operacional"
        title="Setores, postos e capacidade fisica alinhados a cobertura real."
        description="Organize a malha operacional em tres camadas: estrutura organizacional, postos de cobertura e limites de capacidade. Esse conjunto define o espaco onde a escala mensal pode operar com qualidade."
      />

      <Tabs defaultValue="setores" className="w-full">
        <TabsList className="grid w-full gap-2 rounded-[28px] border bg-card p-2 md:grid-cols-3">
          <TabsTrigger value="setores" className="rounded-[22px] px-4 py-3 font-bold transition-all">
            <Layers3 className="mr-2 h-4 w-4" />
            Setores
          </TabsTrigger>
          <TabsTrigger value="postos" className="rounded-[22px] px-4 py-3 font-bold transition-all">
            <MapPinned className="mr-2 h-4 w-4" />
            Postos de Trabalho
          </TabsTrigger>
          <TabsTrigger value="capacidades" className="rounded-[22px] px-4 py-3 font-bold transition-all">
            <Building2 className="mr-2 h-4 w-4" />
            Capacidades
          </TabsTrigger>
        </TabsList>
        <TabsContent value="setores" className="space-y-4 pt-2">
          <SectorManagement />
        </TabsContent>
        <TabsContent value="postos" className="space-y-4 pt-2">
          <WorkPostManagement />
        </TabsContent>
        <TabsContent value="capacidades" className="space-y-4 pt-2">
          <OperationalCapacityForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
