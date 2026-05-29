'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Building2, 
  MapPin, 
  Search, 
  Save, 
  LocateFixed, 
  Maximize,
  Compass
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { Map } from '@/components/shared/Map';
import { cn } from '@/lib/utils';
import { ExternalDataService } from '@/core/application/services/external.service';
import { Company } from '@/core/domain/models/company.model';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';

const CompanySettingsSchema = z.object({
  name: z.string().min(3, 'Nome obrigatório'),
  cnpj: z.string().min(14, 'CNPJ Inválido'),
  latitude: z.number(),
  longitude: z.number(),
  allowedRadius: z.number().min(50).max(1000),
  address: z.string().optional(),
});

type CompanySettingsType = z.infer<typeof CompanySettingsSchema>;

export function CompanySettingsForm({ company, onSave }: { company: Company, onSave: (data: any) => Promise<void> }) {
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: Number(company.latitude || company.address?.latitude || -23.5505), lng: Number(company.longitude || company.address?.longitude || -46.6333) });

  const form = useForm<CompanySettingsType>({
    resolver: zodResolver(CompanySettingsSchema),
    defaultValues: {
      name: company.name,
      cnpj: company.cnpj || '',
      latitude: Number(company.latitude || company.address?.latitude || -23.5505),
      longitude: Number(company.longitude || company.address?.longitude || -46.6333),
      allowedRadius: 200, 
      address: company.address?.additionalInfo || '',
    },
  });

  const handleCnpjLookup = async () => {
    const cnpj = form.getValues('cnpj');
    setIsSearching(true);
    const data = await ExternalDataService.lookupCnpj(cnpj);
    if (data) {
      form.setValue('name', data.nome_fantasia || data.razao_social);
      form.setValue('address', `${data.logradouro}, ${data.numero} - ${data.bairro}`);
      toast.success('Dados da empresa recuperados!');
    } else {
      toast.error('CNPJ não encontrado ou formato inválido.');
    }
    setIsSearching(false);
  };

  const handlePointSelect = (point: { lat: number, lng: number }) => {
    form.setValue('latitude', point.lat);
    form.setValue('longitude', point.lng);
    toast.info(`Âncora de Geofencing ajustada: ${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}`);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
      <section className="space-y-6 rounded-3xl border bg-card p-8 shadow-sm">
        <div className="flex items-center gap-3 border-b pb-4">
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
                <Building2 className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-black tracking-tight">Dados da Unidade</h2>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
            <FormField
              control={form.control}
              name="cnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">CNPJ (Alfanumérico)</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="00.000.000/0000-00" className="rounded-xl" {...field} />
                    </FormControl>
                    <Button type="button" variant="outline" size="icon" onClick={handleCnpjLookup} disabled={isSearching}>
                      <Search className={cn("h-4 w-4", isSearching && "animate-spin")} />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Nome da Unidade/Filial</FormLabel>
                  <FormControl>
                    <Input className="rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-4">
                    <Compass className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-bold uppercase tracking-widest">Configuração de Geofencing</h3>
                </div>

                <FormField
                    control={form.control}
                    name="allowedRadius"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center justify-between">
                                <FormLabel className="font-medium text-xs">Raio de Tolerância: <span className="text-primary font-bold">{field.value} metros</span></FormLabel>
                                <Maximize className="h-3 w-3 text-muted-foreground" />
                            </div>
                            <FormControl>
                                <Slider 
                                    min={50} 
                                    max={1000} 
                                    step={50} 
                                    value={[field.value]} 
                                    onValueChange={(vals) => field.onChange(vals[0])} 
                                    className="py-4"
                                />
                            </FormControl>
                            <FormDescription className="text-[10px]">
                                Área máxima permitida para o colaborador registrar o ponto.
                            </FormDescription>
                        </FormItem>
                    )}
                />
            </div>

            <Button type="submit" className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20">
                Salvar Configurações <Save className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Form>
      </section>

      <section className="flex flex-col gap-4">
         <div className="flex-1 rounded-3xl border bg-muted/20 overflow-hidden relative min-h-[400px]">
            <Map 
                center={{ lat: form.watch('latitude'), lng: form.watch('longitude') }}
                zoom={17}
                className="h-full w-full"
                onPositionSelect={handlePointSelect}
                markers={[{
                    position: { lat: form.watch('latitude'), lng: form.watch('longitude') },
                    title: "Âncora do Ponto",
                    description: "Clique no mapa para ajustar a posição exata."
                }]}
                geofence={{
                    center: { lat: form.watch('latitude'), lng: form.watch('longitude') },
                    radius: form.watch('allowedRadius'),
                    color: '#3b82f6'
                }}
            />
            <div className="absolute top-4 right-4 z-[1000]">
                <div className="bg-background/80 backdrop-blur-md border rounded-2xl p-3 shadow-xl flex items-center gap-2">
                    <LocateFixed className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-black uppercase">Modo de Ajuste de Precisão</span>
                </div>
            </div>
         </div>
         <div className="rounded-2xl border bg-amber-500/5 border-amber-500/10 p-4">
            <p className="text-xs text-amber-700 leading-relaxed font-medium">
                <strong>Dica de Especialista:</strong> Para maior segurança, posicione o marcador na entrada principal da unidade. Um raio de 150-200m é o ideal para compensar variações de sinal GPS em ambientes fechados.
            </p>
         </div>
      </section>
    </div>
  );
}
