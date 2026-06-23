import { httpGet, httpPost } from "@/lib/http/request";

export interface Subscription {
  id: number;
  stripeSubscriptionId: string;
  status: string;
  planType: string;
  currentPeriodEnd: string;
}

export interface CheckoutResponse {
  url: string;
}

export const billingService = {
  getSubscription: () => httpGet<Subscription>("/api/bff/billing/subscription"),
  
  createCheckoutSession: (planType: string, successUrl: string, cancelUrl: string) => 
    httpPost<CheckoutResponse>("/api/bff/billing/checkout", { planType, successUrl, cancelUrl }),
  
  cancelSubscription: () => httpPost<void>("/api/bff/billing/cancel", {}),
};
