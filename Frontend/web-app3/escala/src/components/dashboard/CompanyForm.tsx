'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Building2, Upload, MapPin, Search, ArrowLeft, Save } from 'lucide-react';
import { formatCep, formatCnpj } from '@brazilian-utils/brazilian-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useCompanyStore } from '@/store/useCompanyStore';
import { uploadFile } from '@/services/profile.service';
import Link from 'next/link';

const CompanySchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  cnpj: z.string().min(14, 'CNPJ inválido.'),
  address: z.string().optional(),
  cep: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

type CompanyFormValues = z.infer<typeof CompanySchema>;

export function CompanyForm({ companyId }: { companyId?: number }) {
  const router = useRouter();
  const { companies, addCompany, editCompany } = useCompanyStore();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isFetchingCep, setIsFetchingCep] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editingCompany = companyId ? companies.find(c => c.id === companyId) : null;

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(CompanySchema),
    defaultValues: {
      name: '',
      cnpj: '',
      address: '',
      cep: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
    },
  });

  useEffect(() => {
    if (editingCompany) {
      form.reset({
        name: editingCompany.name,
        cnpj: editingCompany.cnpj,
        address: editingCompany.address || '',
        cep: editingCompany.cep || '',
        street: editingCompany.street || '',
        number: editingCompany.number || '',
        complement: editingCompany.complement || '',
        neighborhood: editingCompany.neighborhood || '',
        city: editingCompany.city || '',
        state: editingCompany.state || '',
      });
      setLogoPreview(editingCompany.logo?.url || null);
    }
  }, [editingCompany, form]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchAddress = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    setIsFetchingCep(true);
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cleanCep}`);
      if (!response.ok) throw new Error('CEP nao encontrado');
      
      const data = await response.json();
      
      form.setValue('street', data.street || '');
      form.setValue('neighborhood', data.neighborhood || '');
      form.setValue('city', data.city || '');
      form.setValue('state', data.state || '');
      
      toast.success('Endereço preenchido automaticamente.');
    } catch (error) {
      toast.error('Nao foi possivel buscar o CEP.');
    } finally {
      setIsFetchingCep(false);
    }
  };

  const watchCep = form.watch('cep');
  useEffect(() => {
    const cleanCep = watchCep?.replace(/\D/g, '') || '';
    if (cleanCep.length === 8) {
      fetchAddress(cleanCep);
    }
  }, [watchCep]);

  async function onSubmit(values: CompanyFormValues) {
    try {
      let logoId: number | undefined;
      if (logoFile) {
        const uploadResult = await uploadFile(logoFile);
        if (uploadResult && uploadResult[0]) {
          logoId = uploadResult[0].id;
        }
      }

      const payload = {
        ...values,
        ...(logoId ? { logo: logoId } : {}),
      };

      let success = false;
      if (companyId) {
        success = await editCompany(companyId, payload);
      } else {
        success = await addCompany(payload);
      }

      if (success) {
        router.push('/dashboard/empresas');
      }
    } catch (error) {
      toast.error('Erro ao salvar empresa.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/empresas">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {companyId ? 'Editar Empresa' : 'Nova Empresa'}
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-[1fr_2fr]">
          <div className="space-y-6">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">Identidade</h2>
              <div className="flex flex-col items-center gap-4">
                <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed bg-muted">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <Building2 className="h-12 w-12 text-muted-foreground/40" />
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-3 w-3" /> {logoPreview ? 'Trocar Logo' : 'Adicionar Logo'}
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleLogoChange}
                />
              </div>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">Dados Básicos</h2>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Fantasia</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Minha Empresa LTDA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="00.000.000/0000-00" 
                          {...field} 
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            field.onChange(value.length <= 14 ? formatCnpj(value) : field.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border bg-card p-6">
              <div className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <MapPin className="h-5 w-5 text-primary" />
                Endereço da Sede
              </div>
              
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="cep"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              placeholder="00000-000" 
                              {...field} 
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                field.onChange(value.length <= 8 ? formatCep(value) : field.value);
                              }}
                            />
                            {isFetchingCep && (
                              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-pulse text-muted-foreground" />
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="sm:col-span-2">
                    <FormField
                      control={form.control}
                      name="street"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rua / Logradouro</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome da rua" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número</FormLabel>
                        <FormControl>
                          <Input placeholder="123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="sm:col-span-2">
                    <FormField
                      control={form.control}
                      name="complement"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Complemento</FormLabel>
                          <FormControl>
                            <Input placeholder="Apt, Bloco, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="neighborhood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu bairro" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input placeholder="Sua cidade" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado / UF</FormLabel>
                        <FormControl>
                          <Input placeholder="SP" maxLength={2} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações de Endereço</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Informações adicionais..." 
                          className="min-h-24 resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" asChild>
                <Link href="/dashboard/empresas">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting} className="gap-2">
                <Save className="h-4 w-4" />
                {form.formState.isSubmitting ? 'Salvando...' : 'Salvar Empresa'}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
