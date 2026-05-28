'use client';

import { useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
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

type ProfileUser = {
  id: string | number;
  username?: string | null;
  email?: string | null;
  roles?: string[];
  theme?: ThemeEnum;
  avatar?: any;
  avatarUrl?: string | null;
  address?: string;
  position?: string;
  function?: string;
};

interface ProfileFormProps {
  user: ProfileUser;
}

const ProfileSchema = z.object({
  username: z.string().trim().min(2, 'Informe pelo menos 2 caracteres.'),
  email: z.string().trim().email('Informe um email valido.'),
  theme: z.enum([ThemeEnum.SYSTEM, ThemeEnum.LIGHT, ThemeEnum.DARK]),
  address: z.string().optional(),
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

export function ProfileForm({ user }: ProfileFormProps) {
  const { update } = useSession();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user.avatarUrl || user.avatar?.url || (typeof user.avatar === 'string' ? user.avatar : null)
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
      position: user.position || '',
      function: user.function || '',
    },
  });

  const passwordForm = useForm<PasswordSchemaType>({
    resolver: zodResolver(PasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      if (avatarFile) {
        const uploadResult = await uploadAvatar(avatarFile);
        avatarUrl = uploadResult?.url;

        if (!avatarUrl) {
          toast.error('Nao foi possivel enviar a imagem do avatar.');
          return;
        }
      }

      const updated = await updateMyProfile({
        ...data,
        avatarUrl,
      });

      if (!updated) {
        toast.error('Nao foi possivel atualizar seu perfil.');
        return;
      }

      await update({ user: { ...user, ...updated } });
      setAvatarPreview(updated.avatarUrl || null);
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

        <div className="mb-8 flex flex-col items-center gap-4 sm:flex-row">
          <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-primary/20 bg-muted">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-muted-foreground">
                {user.username?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
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
            <p className="mt-1 text-xs text-muted-foreground">
              JPG, PNG ou GIF. Tamanho maximo de 2MB.
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
                      <Input autoComplete="username" placeholder="Seu nome" {...field} />
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
                      <Input type="email" autoComplete="email" placeholder="seu@email.com" {...field} />
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

            <FormField
              control={profileForm.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Seu endereço completo" className="resize-none" {...field} />
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
              <Button type="submit" disabled={savingProfile}>
                {savingProfile ? 'Salvando...' : 'Salvar perfil'}
              </Button>
            </div>
          </form>
        </Form>
      </section>

      <div className="space-y-6">
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
                <Button type="submit" variant="outline" disabled={savingPassword}>
                  {savingPassword ? 'Atualizando...' : 'Alterar senha'}
                </Button>
              </div>
            </form>
          </Form>
        </section>
      </div>
    </div>
  );
}
