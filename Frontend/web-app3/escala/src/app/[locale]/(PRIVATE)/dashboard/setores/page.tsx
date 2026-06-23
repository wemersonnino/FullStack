'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SectorManagement } from '@/components/dashboard/SectorManagement';
import { WorkPostManagement } from '@/components/dashboard/WorkPostManagement';
import { OperationalCapacityForm } from '@/components/dashboard/OperationalCapacityForm';

export default function SetoresPage() {
  return (
    <div className="container mx-auto py-10 space-y-6">
      <Tabs defaultValue="setores" className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-3 rounded-2xl bg-muted/60 p-1 mb-8">
          <TabsTrigger value="setores" className="rounded-xl font-bold py-2 transition-all">
            Setores
          </TabsTrigger>
          <TabsTrigger value="postos" className="rounded-xl font-bold py-2 transition-all">
            Postos de Trabalho
          </TabsTrigger>
          <TabsTrigger value="capacidades" className="rounded-xl font-bold py-2 transition-all">
            Capacidades
          </TabsTrigger>
        </TabsList>
        <TabsContent value="setores" className="space-y-4">
          <SectorManagement />
        </TabsContent>
        <TabsContent value="postos" className="space-y-4">
          <WorkPostManagement />
        </TabsContent>
        <TabsContent value="capacidades" className="space-y-4">
          <OperationalCapacityForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
