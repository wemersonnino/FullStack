'use client';

import { useRef, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { MapPin, Search } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { formatCep } from '@brazilian-utils/brazilian-utils';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ThemeEnum } from '@/interfaces/enums/theme.enum';
import { changeMyPassword, updateMyProfile, uploadAvatar } from '@/services/profile.service';
import { normalizeAvatarUrl } from '@/lib/utils';

type ProfileUser = {
  id: string | number;
  username?: string | null;
  email?: string | null;
  roles?: string[];
  theme?: ThemeEnum;
  avatar?: any;
  avatarUrl?: string | null;
  address?: string;
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  position?: string;
  function?: string;
  provider?: string;
};

interface ProfileFormProps {
  user: ProfileUser;
}

const ProfileSchema = z.object({
  username: z.string().trim().min(2, 'Informe pelo menos 2 caracteres.'),
  email: z.string().trim().email('Informe um email valido.'),
  theme: z.enum([ThemeEnum.SYSTEM, ThemeEnum.LIGHT, ThemeEnum.DARK]),
  address: z.string().optional(),
  cep: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  position: z.string().optional(),
  function: z.string().optional(),
});

const PasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Informe sua senha atual.'),
    newPassword: z.string().min(8, 'A nova senha deve ter pelo menos 8 caracteres.'),
    confirmPassword: z.string().min(1, 'Confirme a nova senha.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas nao conferem.',
    path: ['confirmPassword'],
  });

type ProfileSchemaType = z.infer<typeof ProfileSchema>;
type PasswordSchemaType = z.infer<typeof PasswordSchema>;

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
const isGoogleAvatarUrl = (url?: string | null) => Boolean(url?.includes('googleusercontent.com'));

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const { update } = useSession();
  const rawAvatarUrl = user.avatarUrl || user.avatar?.url || (typeof user.avatar === 'string' ? user.avatar : null);
  const isGoogleUser = user.provider?.toLowerCase() === 'google' || isGoogleAvatarUrl(rawAvatarUrl);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    normalizeAvatarUrl(rawAvatarUrl)
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profileForm = useForm<ProfileSchemaType>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      username: user.username || '',
      email: user.email || '',
      theme: user.theme || ThemeEnum.SYSTEM,
      address: user.address || '',
      cep: user.cep || '',
      street: user.street || '',
      number: user.number || '',
      complement: user.complement || '',
      neighborhood: user.neighborhood || '',
      city: user.city || '',
      state: user.state || '',
      position: user.position || '',
      function: user.function || '',
    },
  });

  const [isFetchingCep, setIsFetchingCep] = useState(false);

  const fetchAddress = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    setIsFetchingCep(true);
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cleanCep}`);
      if (!response.ok) throw new Error('CEP nao encontrado');
      
      const data = await response.json();
      
      profileForm.setValue('street', data.street || '');
      profileForm.setValue('neighborhood', data.neighborhood || '');
      profileForm.setValue('city', data.city || '');
      profileForm.setValue('state', data.state || '');
      
      toast.success('Endereço preenchido automaticamente.');
    } catch (error) {
      toast.error('Nao foi possivel buscar o CEP.');
    } finally {
      setIsFetchingCep(false);
    }
  };

  const watchCep = profileForm.watch('cep');
  useEffect(() => {
    const cleanCep = watchCep?.replace(/\D/g, '') || '';
    if (cleanCep.length === 8) {
      fetchAddress(cleanCep);
    }
  }, [watchCep]);

  const passwordForm = useForm<PasswordSchemaType>({
    resolver: zodResolver(PasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isGoogleUser) {
      e.target.value = '';
      setAvatarFile(null);
      toast.error('A foto do perfil é sincronizada com sua conta Google.');
      return;
    }

    const file = e.target.files?.[0];
    if (file) {
      if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
        toast.error('Use uma imagem JPG, PNG, GIF ou WebP.');
        e.target.value = '';
        return;
      }

      if (file.size > MAX_AVATAR_SIZE) {
        toast.error('A imagem deve ter no maximo 2MB.');
        e.target.value = '';
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onProfileSubmit(data: ProfileSchemaType) {
    setSavingProfile(true);

    try {
      let avatarUrl: string | undefined;
      if (!isGoogleUser && avatarFile) {
        const uploadResult = await uploadAvatar(avatarFile);
        avatarUrl = uploadResult?.url;

        if (!avatarUrl) {
          toast.error('Nao foi possivel enviar a imagem do avatar.');
          return;
        }
      }

      const payload = {
        username: data.username,
        email: data.email,
        avatarUrl,
        theme: data.theme,
        position: data.position,
        function: data.function,
        address: data.address,
        cep: data.cep,
        street: data.street,
        number: data.number,
        complement: data.complement,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
      };

      const updated = await updateMyProfile(payload);

      if (!updated) {
        toast.error('Nao foi possivel atualizar seu perfil.');
        return;
      }

      const sessionUser = isGoogleUser
        ? {
            ...user,
            ...updated,
            username: user.username,
            email: user.email,
            avatarUrl: user.avatarUrl,
            provider: user.provider,
          }
        : { ...user, ...updated };

      await update({ user: sessionUser });
      router.refresh();
      setAvatarPreview(
        normalizeAvatarUrl(isGoogleUser ? user.avatarUrl : updated.avatarUrl) || null
      );
      setAvatarFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      toast.success('Perfil atualizado.');
    } finally {
      setSavingProfile(false);
    }
  }

  async function onPasswordSubmit(data: PasswordSchemaType) {
    setSavingPassword(true);

    try {
      const result = await changeMyPassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      if (!result) {
        toast.error('Nao foi possivel alterar sua senha.');
        return;
      }

      passwordForm.reset();
      toast.success('Senha atualizada.');
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.4fr_1fr]">
      <section className="rounded-lg border bg-card p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Meu perfil</h1>
          <p className="text-sm text-muted-foreground">
            Atualize seus dados pessoais e profissionais.
          </p>
        </div>

        {isGoogleUser && (
          <div className="mb-6 rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 text-sm text-blue-700 dark:text-blue-300">
            Esta conta está vinculada ao Google. Seu nome e e-mail são gerenciados pelo provedor, 
            mas você pode completar seus dados profissionais e de endereço abaixo.
          </div>
        )}

        <div className="mb-8 flex flex-col items-center gap-4 sm:flex-row">
          <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-primary/20 bg-muted">
            {avatarPreview ? (
              <Image 
                src={avatarPreview} 
                alt="Avatar" 
                fill 
                sizes="96px"
                className="h-full w-full object-cover" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-muted-foreground">
                {user.username?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            {!isGoogleUser ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Alterar foto
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </>
            ) : null}
            <p className="mt-1 text-xs text-muted-foreground">
              {isGoogleUser
                ? 'A foto do perfil é sincronizada com sua conta Google.'
                : 'JPG, PNG ou GIF. Tamanho maximo de 2MB.'}
            </p>
          </div>
        </div>

        <Form {...profileForm}>
          <form className="space-y-5" onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={profileForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                      <FormLabel>Nome de usuario</FormLabel>
                      <FormControl>
                      <Input autoComplete="username" placeholder="Seu nome" disabled={isGoogleUser} {...field} title={isGoogleUser ? "Gerenciado pelo Google" : ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={profileForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                      <FormLabel>Email de login</FormLabel>
                      <FormControl>
                      <Input type="email" autoComplete="email" placeholder="seu@email.com" disabled={isGoogleUser} {...field} title={isGoogleUser ? "Gerenciado pelo Google" : ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={profileForm.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                      <FormLabel>Cargo</FormLabel>
                      <FormControl>
                      <Input placeholder="Ex: Desenvolvedor Senior" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={profileForm.control}
                name="function"
                render={({ field }) => (
                  <FormItem>
                      <FormLabel>Função</FormLabel>
                      <FormControl>
                      <Input placeholder="Ex: Backend" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center gap-2 font-medium">
                <MapPin className="h-4 w-4 text-primary" />
                Endereço
              </div>
              
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  control={profileForm.control}
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
                    control={profileForm.control}
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
                  control={profileForm.control}
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
                    control={profileForm.control}
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
                  control={profileForm.control}
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
                  control={profileForm.control}
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
                  control={profileForm.control}
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
            </div>

            <FormField
              control={profileForm.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Informações Adicionais de Endereço</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ponto de referencia, etc." className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={profileForm.control}
              name="theme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tema preferido</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um tema" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={ThemeEnum.SYSTEM}>Sistema</SelectItem>
                      <SelectItem value={ThemeEnum.LIGHT}>Claro</SelectItem>
                      <SelectItem value={ThemeEnum.DARK}>Escuro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={savingProfile} isLoading={savingProfile}>
                  {savingProfile ? 'Salvando...' : 'Salvar perfil'}
                </Button>
            </div>
          </form>
        </Form>
      </section>

      <div className="space-y-6">
        {!isGoogleUser ? (
        <section className="rounded-lg border bg-card p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Seguranca</h2>
            <p className="text-sm text-muted-foreground">
              Para trocar a senha, informe a senha atual.
            </p>
          </div>

          <Form {...passwordForm}>
            <form className="space-y-5" onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha atual</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="current-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova senha</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar nova senha</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" variant="outline" disabled={savingPassword} isLoading={savingPassword}>
                  {savingPassword ? 'Atualizando...' : 'Alterar senha'}
                </Button>
              </div>
            </form>
          </Form>
        </section>
        ) : (
          <section className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold">Seguranca</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              A senha dessa conta é gerenciada pelo Google. Não há alteração local disponível.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
