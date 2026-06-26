import { notFound } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getLegalPage } from '@/services/legal-page.service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface LegalPageProps {
  params: Promise<{ slug: string }>;
}

function renderLegalContent(content: string) {
  return content.split('\n').map((line, index) => {
    if (line.startsWith('## ')) {
      return (
        <h2 key={index} className="mt-8 text-2xl font-black tracking-tight first:mt-0">
          {line.replace(/^##\s+/, '')}
        </h2>
      );
    }

    if (!line.trim()) {
      return <div key={index} className="h-3" />;
    }

    return (
      <p key={index} className="text-base leading-8 text-muted-foreground">
        {line}
      </p>
    );
  });
}

export default async function LegalPage({ params }: LegalPageProps) {
  const { slug } = await params;
  const page = await getLegalPage(slug);

  if (!page) notFound();

  return (
    <main className="bg-background pt-24">
      <section className="border-b bg-muted/25 py-16">
        <div className="container mx-auto max-w-4xl px-6">
          <Badge variant="outline" className="mb-5 rounded-md">
            <ShieldCheck className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
            Governança e conformidade
          </Badge>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">{page.title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
            Documento editorial gerido no Strapi para manter termos, privacidade e segurança sem acoplar texto legal ao frontend.
          </p>
        </div>
      </section>

      <section className="py-14">
        <article className="container mx-auto max-w-4xl px-6">
          <div className="rounded-lg border bg-card p-6 sm:p-8">
            {renderLegalContent(page.content)}
          </div>
        </article>
      </section>
    </main>
  );
}
