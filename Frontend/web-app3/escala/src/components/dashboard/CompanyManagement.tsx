'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Building2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { isValidCnpj, formatCnpj } from '@/lib/cnpj';
import { 
  Company 
} from '@/services/company.service';
import { uploadFile } from '@/services/profile.service';
import { useCompanyStore } from '@/store/useCompanyStore';

const CompanySchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  cnpj: z.string().refine((val) => isValidCnpj(val), 'CNPJ inválido.'),
  address: z.string().optional(),
});

type CompanyFormValues = z.infer<typeof CompanySchema>;

function getCompanyAddressLabel(address: Company['address']) {
  if (!address) return '';
  if (typeof address === 'string') return address;

  const parts = [
    address.street,
    address.number,
    address.complement,
    address.neighborhood,
    address.city,
    address.state,
  ].filter(Boolean);

  const main = parts.join(', ');
  const extra = address.additionalInfo?.trim();
  const cep = address.cep ? `CEP ${address.cep}` : '';
  return [main, extra, cep].filter(Boolean).join(' • ');
}

function getCompanyLogoUrl(company: Company) {
  return company.logoUrl || company.logo?.url || undefined;
}

export function CompanyManagement() {
  const { companies, isLoading, fetchCompanies, editCompany, removeCompany } = useCompanyStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(CompanySchema),
    defaultValues: {
      name: '',
      cnpj: '',
      address: '',
    },
  });

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

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

  const onOpenEditDialog = (company: Company) => {
    setEditingCompany(company);
    setLogoPreview(getCompanyLogoUrl(company) || null);
    setLogoFile(null);
    form.reset({
      name: company.name || '',
      cnpj: company.cnpj || '',
      address: typeof company.address === 'string' ? company.address : company.address?.additionalInfo || '',
    });
    setIsDialogOpen(true);
  };

  async function onSubmit(values: CompanyFormValues) {
    try {
      let logoUrl: string | undefined;
      if (logoFile) {
        const uploadResult = await uploadFile(logoFile);
        if (uploadResult && uploadResult[0]) {
          logoUrl = uploadResult[0].url;
        }
      }

      const currentAddress = editingCompany
        ? {
            cep:
              typeof editingCompany.address === 'object'
                ? editingCompany.address?.cep ?? editingCompany.cep
                : editingCompany.cep,
            street:
              typeof editingCompany.address === 'object'
                ? editingCompany.address?.street ?? editingCompany.street
                : editingCompany.street,
            number:
              typeof editingCompany.address === 'object'
                ? editingCompany.address?.number ?? editingCompany.number
                : editingCompany.number,
            complement:
              typeof editingCompany.address === 'object'
                ? editingCompany.address?.complement ?? editingCompany.complement
                : editingCompany.complement,
            neighborhood:
              typeof editingCompany.address === 'object'
                ? editingCompany.address?.neighborhood ?? editingCompany.neighborhood
                : editingCompany.neighborhood,
            city:
              typeof editingCompany.address === 'object'
                ? editingCompany.address?.city ?? editingCompany.city
                : editingCompany.city,
            state:
              typeof editingCompany.address === 'object'
                ? editingCompany.address?.state ?? editingCompany.state
                : editingCompany.state,
            additionalInfo:
              typeof editingCompany.address === 'string'
                ? editingCompany.address
                : editingCompany.address?.additionalInfo,
          }
        : undefined;

      const payload = {
        name: values.name,
        cnpj: values.cnpj,
        logoUrl: logoUrl ?? editingCompany?.logoUrl ?? editingCompany?.logo?.url,
        address: {
          cep: currentAddress?.cep,
          street: currentAddress?.street,
          number: currentAddress?.number,
          complement: currentAddress?.complement,
          neighborhood: currentAddress?.neighborhood,
          city: currentAddress?.city,
          state: currentAddress?.state,
          additionalInfo: values.address || currentAddress?.additionalInfo,
        },
        cep: currentAddress?.cep,
        street: currentAddress?.street,
        number: currentAddress?.number,
        complement: currentAddress?.complement,
        neighborhood: currentAddress?.neighborhood,
        city: currentAddress?.city,
        state: currentAddress?.state,
      };

      if (editingCompany) {
        await editCompany(editingCompany.id, payload);
      }

      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Erro ao salvar empresa.');
    }
  }

  async function onDelete(id: string) {
    if (confirm('Tem certeza que deseja excluir esta empresa?')) {
      await removeCompany(id);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Empresas</h2>
          <p className="text-muted-foreground">
            Gerencie as empresas cadastradas no sistema.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/dashboard/empresas/novo">
            <Plus className="h-4 w-4" /> Nova Empresa
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <Loading text="Carregando empresas..." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <div
              key={company.id}
              className="group relative rounded-xl border bg-card p-6 transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                    {getCompanyLogoUrl(company) ? (
                      <img
                        src={getCompanyLogoUrl(company)}
                        alt={company.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Building2 className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{company.name}</h3>
                    <p className="text-xs text-muted-foreground">CNPJ: {company.cnpj}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onOpenEditDialog(company)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => onDelete(company.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {getCompanyAddressLabel(company.address) && (
                <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
                  {getCompanyAddressLabel(company.address)}
                </p>
              )}
            </div>
          ))}
          {companies.length === 0 && (
            <div className="col-span-full">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Building2 />
                  </EmptyMedia>
                  <EmptyTitle>Nenhuma empresa cadastrada</EmptyTitle>
                  <EmptyDescription>
                    Cadastre uma nova empresa para integrá-la ao sistema.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          )}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingCompany ? 'Editar Empresa' : 'Nova Empresa'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados da empresa abaixo.
            </DialogDescription>
          </DialogHeader>

          <div className="mb-4 flex flex-col items-center gap-4">
            <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed bg-muted">
              {logoPreview ? (
                <img src={logoPreview} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <Building2 className="h-8 w-8 text-muted-foreground/40" />
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

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                          const value = e.target.value.replace(/[^\w]/g, '');
                          field.onChange(formatCnpj(value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input placeholder="Rua, Número, Bairro, Cidade - UF" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Salvando...' : 'Salvar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
