import { API_ROUTES } from '@/constants';
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
    const url = `${API_ROUTES.MENU}&filters[location][$eq]=${location}`;
    const json = await httpGet<{ data: any[] }>(url);

    if (!json?.data) return [];
    return mapMenus(json.data);
  } catch (error) {
    console.error('Erro ao buscar menus:', error);
    return [];
  }
}
