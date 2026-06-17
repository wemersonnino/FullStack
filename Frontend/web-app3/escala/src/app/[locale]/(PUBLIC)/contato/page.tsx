import { Metadata } from 'next';
import { ContactForm } from '@/features/contact/components/ContactForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Phone, Mail, MapPin, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { getContactContent } from '@/services/contact.service';

export const metadata: Metadata = {
  title: 'Contato | Plataforma Escala',
  description: 'Entre em contato com nosso time comercial ou suporte.',
};

export default async function ContatoPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const content = await getContactContent(locale);
  const faqUrl = `/${locale}/lp/faq`;

  return (
    <main className="container mx-auto px-4 py-16">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Informações de Contato */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-4">{content.title}</h1>
              <p className="text-muted-foreground text-lg">
                {content.description}
              </p>
            </div>

            <div className="grid gap-6">
              {(content.phone1 || content.phone2) && (
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg text-primary">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Telefones</h3>
                    {content.phone1 && <p className="text-muted-foreground">{content.phone1}</p>}
                    {content.phone2 && <p className="text-muted-foreground">{content.phone2}</p>}
                  </div>
                </div>
              )}

              {content.email && (
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg text-primary">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">E-mail</h3>
                    <p className="text-muted-foreground">{content.email}</p>
                  </div>
                </div>
              )}

              {content.address && (
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg text-primary">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Endereço</h3>
                    <p className="text-muted-foreground">{content.address}</p>
                  </div>
                </div>
              )}

              <div className="pt-6">
                <Link 
                  href={faqUrl}
                  className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                >
                  <HelpCircle className="h-5 w-5" />
                  {content.faqLinkText}
                </Link>
              </div>
            </div>
          </div>

          {/* Formulário */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle>Envie uma mensagem</CardTitle>
              <CardDescription>
                Retornaremos seu contato em até 24 horas úteis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContactForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
