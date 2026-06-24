import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { format } from 'date-fns';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ReportService } from '@/core/application/services/report.service';
import { RelatoriosView } from '@/features/reports/components/RelatoriosView';

type RelatoriosPageProps = {
  searchParams?: Promise<{ month?: string }>;
};

export default async function RelatoriosPage({ searchParams }: RelatoriosPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.token) redirect('/login');

  const params = await searchParams;
  const month = params?.month || format(new Date(), 'yyyy-MM');
  const items = await ReportService.getPayrollData(session.user.token, month);

  return <RelatoriosView month={month} items={items} />;
}
