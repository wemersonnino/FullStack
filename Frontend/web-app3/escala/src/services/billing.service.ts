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
  getSubscription: () => httpGet<Subscription>("/api/server/api/v1/billing/subscription"),
  
  createCheckoutSession: (planType: string, successUrl: string, cancelUrl: string) => 
    httpPost<CheckoutResponse>("/api/server/api/v1/billing/checkout", { planType, successUrl, cancelUrl }),
  
  cancelSubscription: () => httpPost<void>("/api/server/api/v1/billing/cancel", {}),
};
