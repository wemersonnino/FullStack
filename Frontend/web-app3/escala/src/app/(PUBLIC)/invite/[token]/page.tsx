import { InvitationService } from '@/core/application/services/invitation.service';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';

export default async function InvitePage({ params }: { params: { token: string } }) {
  try {
    const invitation = await InvitationService.getInvitationByToken(params.token);

    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Convite Aceito!</CardTitle>
            <CardDescription>
              Você foi convidado para se juntar à equipe da <strong>{invitation.companyName}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              Para concluir seu cadastro e acessar a plataforma, clique no botão abaixo.
            </p>
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-medium">Email: {invitation.email}</p>
              <p className="text-xs text-muted-foreground uppercase">Cargo: {invitation.roleName}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href={`/register?email=${invitation.email}&companySlug=${invitation.companyName.toLowerCase().replace(/ /g, '-')}`}>
                Criar minha conta
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  } catch (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-2xl text-destructive">Convite Inválido</CardTitle>
            <CardDescription>
              Este convite expirou ou já foi utilizado.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/">Voltar para a Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
}
