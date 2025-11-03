import { API_ROUTES } from '@/constants';
import { httpGet } from '@/lib/http/request';
import { FooterInterface } from '@/interfaces/footer/footer.interface';
import { mapFooter } from '@/dto';

export async function getFooter(): Promise<FooterInterface | null> {
  const json = await httpGet<{ data: any }>(API_ROUTES.FOOTER);
  const data = json?.data;
  if (!data) return null;

  return mapFooter(data);
}
