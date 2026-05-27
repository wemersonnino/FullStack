import Script from 'next/script';
import { ENV } from '@/constants/env';

export function RecaptchaScript() {
  if (!ENV.RECAPTCHA_ENABLED || !ENV.RECAPTCHA_SITE_KEY) {
    return null;
  }

  return (
    <Script
      src={`https://www.google.com/recaptcha/api.js?render=${ENV.RECAPTCHA_SITE_KEY}`}
      strategy="afterInteractive"
    />
  );
}
