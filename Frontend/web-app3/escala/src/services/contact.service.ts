import { API_ROUTES } from '@/constants';
import { httpGet } from '@/lib/http/request';

export interface ContactContent {
  title: string;
  description: string;
  phone1: string;
  phone2: string;
  email: string;
  address: string;
  faqLinkText: string;
}

export const fallbackContactContent: ContactContent = {
  title: 'Fale Conosco',
  description: 'Estamos aqui para ajudar você a otimizar sua gestão de escalas. Escolha o canal de sua preferência ou preencha o formulário.',
  phone1: '+55 (11) 4002-8922',
  phone2: '+55 (31) 98888-7777',
  email: 'contato@escala.app',
  address: 'Av. Paulista, 1000 - São Paulo, SP',
  faqLinkText: 'Dúvidas frequentes? Acesse nossa FAQ',
};

export async function getContactContent(locale?: string): Promise<ContactContent> {
  try {
    const localeParam = locale ? `?locale=${locale}` : '';
    // Strapi Single Type endpoint
    const url = `${process.env.API_BASE_URL}/api/contact-content${localeParam}`;
    const response = await httpGet<{ data?: any }>(url);
    
    if (!response?.data) return fallbackContactContent;

    return {
      title: response.data.title || fallbackContactContent.title,
      description: response.data.description || fallbackContactContent.description,
      phone1: response.data.phone1 || fallbackContactContent.phone1,
      phone2: response.data.phone2 || fallbackContactContent.phone2,
      email: response.data.email || fallbackContactContent.email,
      address: response.data.address || fallbackContactContent.address,
      faqLinkText: response.data.faqLinkText || fallbackContactContent.faqLinkText,
    };
  } catch (error) {
    console.error('Erro ao buscar conteúdo de contato:', error);
    return fallbackContactContent;
  }
}
