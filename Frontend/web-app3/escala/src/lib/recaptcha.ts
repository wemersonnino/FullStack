import { ENV } from '@/constants/env';

declare global {
  interface Window {
    grecaptcha?: {
      ready(callback: () => void): void;
      execute(siteKey: string, options: { action: string }): Promise<string>;
    };
  }
}

export async function getRecaptchaToken(action: string) {
  if (
    typeof window === 'undefined' ||
    !ENV.RECAPTCHA_ENABLED ||
    !ENV.RECAPTCHA_SITE_KEY ||
    !window.grecaptcha
  ) {
    return undefined;
  }

  try {
    await new Promise<void>((resolve) => window.grecaptcha?.ready(resolve));
    return await window.grecaptcha.execute(ENV.RECAPTCHA_SITE_KEY, { action });
  } catch (error) {
    console.warn('reCAPTCHA indisponivel:', error);
    return undefined;
  }
}
