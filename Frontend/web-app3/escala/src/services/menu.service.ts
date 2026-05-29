import { baseUrl } from '@/constants';
import { httpGet } from '@/lib/http/request';
import { MenuItem } from '@/interfaces/menu/menu.interface';
import { mapMenus } from '@/dto/menu.dto';
import { MenuLocationEnum } from '@/interfaces/enums/menuLocation.enum';

/**
 * Busca menus por localização (header, footer, sidebar).
 */
export async function getMenu(
  location: MenuLocationEnum = MenuLocationEnum.HEADER
): Promise<MenuItem[]> {
  try {
    const populate =
      'populate[icon]=true' +
      '&populate[childItems][populate][icon]=true' +
      '&populate[childItems][sort]=order:asc';
    const url = `${baseUrl}/api/menus?${populate}&filters[location][$eq]=${location}&sort=order:asc`;
    const json = await httpGet<{ data: any[] }>(url);

    if (!json?.data) return [];
    return mapMenus(json.data);
  } catch (error) {
    console.error('Erro ao buscar menus:', error);
    return [];
  }
}
