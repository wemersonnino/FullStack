'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ThemeEnum } from '@/interfaces/enums/theme.enum';
import { changeMyPassword, updateMyProfile } from '@/services/profile.service';

type ProfileUser = {
  id: string | number;
  username?: string | null;
  email?: string | null;
  roles?: string[];
  theme?: ThemeEnum;
};

interface ProfileFormProps {
  user: ProfileUser;
}

const ProfileSchema = z.object({
  username: z.string().trim().min(2, 'Informe pelo menos 2 caracteres.'),
  email: z.string().trim().email('Informe um email valido.'),
  theme: z.enum([ThemeEnum.SYSTEM, ThemeEnum.LIGHT, ThemeEnum.DARK]),
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

export function ProfileForm({ user }: ProfileFormProps) {
  const { update } = useSession();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const profileForm = useForm<ProfileSchemaType>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      username: user.username || '',
      email: user.email || '',
      theme: user.theme || ThemeEnum.SYSTEM,
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

  async function onProfileSubmit(data: ProfileSchemaType) {
    setSavingProfile(true);

    try {
      const updated = await updateMyProfile(data);
      if (!updated) {
        toast.error('Nao foi possivel atualizar seu perfil.');
        return;
      }

      await update({ user: { ...user, ...updated } });
      profileForm.reset({
        username: updated.username || data.username,
        email: updated.email || data.email,
        theme: (updated.theme as ThemeEnum) || data.theme,
      });
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
            Atualize apenas os seus dados. Permissoes e roles continuam gerenciadas por administradores.
          </p>
        </div>

        <Form {...profileForm}>
          <form className="space-y-5" onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
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
                  <FormDescription>
                    Alterar o email muda a identificacao usada no login.
                  </FormDescription>
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

            <div className="flex justify-end">
              <Button type="submit" disabled={savingProfile}>
                {savingProfile ? 'Salvando...' : 'Salvar perfil'}
              </Button>
            </div>
          </form>
        </Form>
      </section>

      <section className="rounded-lg border bg-card p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Seguranca</h2>
          <p className="text-sm text-muted-foreground">
            Para trocar a senha, informe a senha atual. A senha nunca e exposta pelo frontend.
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
  );
}
