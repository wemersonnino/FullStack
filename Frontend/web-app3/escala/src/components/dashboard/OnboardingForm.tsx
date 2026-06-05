'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Search, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { isValidCnpj, formatCnpj } from '@/lib/cnpj';
import { ExternalDataService } from '@/core/application/services/external.service';
import { httpPost } from '@/lib/http/request';

const OnboardingSchema = z.object({
  cnpj: z.string().refine((val) => isValidCnpj(val), 'CNPJ inválido.'),
  companyName: z.string().min(3, 'Nome da empresa obrigatório'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres para segurança extra.'),
});

type OnboardingValues = z.infer<typeof OnboardingSchema>;

export function OnboardingForm({ onSuccess }: { onSuccess: () => void }) {
  const { update } = useSession();
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(OnboardingSchema),
    defaultValues: {
      cnpj: '',
      companyName: '',
      password: '',
    },
  });

  const handleCnpjLookup = async () => {
    const cnpj = form.getValues('cnpj');
    if (!isValidCnpj(cnpj)) {
      toast.error('Digite um CNPJ válido para buscar.');
      return;
    }

    setIsSearching(true);
    try {
      const data = await ExternalDataService.lookupCnpj(cnpj);
      if (data) {
        form.setValue('companyName', data.nome_fantasia || data.razao_social);
        toast.success('Dados da empresa localizados com sucesso!');
      } else {
        toast.error('CNPJ não encontrado na base da Receita.');
      }
    } catch (error) {
      toast.error('Erro ao consultar CNPJ.');
    } finally {
      setIsSearching(false);
    }
  };

  async function onSubmit(values: OnboardingValues) {
    setIsSubmitting(true);
    try {
      const res = await httpPost('/api/bff/auth/complete-registration', values);
      if (res) {
        toast.success('Parabéns! Sua conta oficial foi criada.');
        await update(); // Atualiza a sessão (novas roles, slug, etc)
        onSuccess();
        window.location.reload(); // Recarrega para limpar estado e redirecionar se necessário
      } else {
        toast.error('Erro ao finalizar cadastro.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro inesperado.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="cnpj"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-xs uppercase tracking-widest text-muted-foreground">CNPJ da Empresa</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input 
                      placeholder="00.000.000/0000-00" 
                      className="h-12 rounded-2xl border-2 focus-visible:ring-primary/20" 
                      {...field}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^\w]/g, '');
                        field.onChange(formatCnpj(val));
                      }}
                    />
                  </FormControl>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="h-12 w-12 rounded-2xl border-2" 
                    onClick={handleCnpjLookup}
                    disabled={isSearching}
                  >
                    <Search className={isSearching ? "animate-spin" : ""} />
                  </Button>
                </div>
                <FormDescription className="text-[10px]">
                  Opcional: Use o CNPJ para preencher os dados automaticamente.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Nome Comercial / Fantasia</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ex: Escala Tech LTDA" 
                    className="h-12 rounded-2xl border-2 focus-visible:ring-primary/20" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Crie uma Senha de Acesso</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="h-12 rounded-2xl border-2 focus-visible:ring-primary/20" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription className="text-[10px]">
                  Isso permite que você logue com e-mail e senha além do Google.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button 
          type="submit" 
          className="h-14 w-full rounded-2xl text-lg font-black italic tracking-tighter uppercase shadow-xl shadow-primary/20"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            "Finalizando..."
          ) : (
            <>
              Ativar Minha Conta <CheckCircle2 className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>

        <p className="text-center text-[10px] text-muted-foreground">
          Ao ativar sua conta, você concorda com nossos Termos de Uso e Política de Privacidade.
        </p>
      </form>
    </Form>
  );
}
