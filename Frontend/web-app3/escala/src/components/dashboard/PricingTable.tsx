'use client';

import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { billingService } from '@/services/billing.service';
import { useState } from 'react';
import { toast } from 'sonner';
import { LandingPricingPlan } from '@/interfaces/landing/landing.interface';

interface PricingTableProps {
  plans: LandingPricingPlan[];
  isPublic?: boolean;
}

export const PricingTable = ({ plans, isPublic = false }: PricingTableProps) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (plan: LandingPricingPlan) => {
    if (isPublic) {
      // Redirect to register with selected plan in query param
      window.location.href = `/register?plan=${plan.name.toUpperCase()}`;
      return;
    }

    setLoading(plan.name);
    try {
      const successUrl = `${window.location.origin}/dashboard/billing/success`;
      const cancelUrl = `${window.location.origin}/dashboard/billing/cancel`;
      
      const response = await billingService.createCheckoutSession(plan.name, successUrl, cancelUrl);
      if (response?.url) {
        window.location.href = response.url;
      }
    } catch (error) {
      console.error('Erro ao iniciar checkout:', error);
      toast.error('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className={`relative flex flex-col rounded-2xl border p-8 shadow-sm ${
            plan.recommended ? 'border-primary ring-1 ring-primary' : 'border-border'
          }`}
        >
          {plan.recommended && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
              Mais Popular
            </span>
          )}
          <div className="mb-6">
            <h3 className="text-xl font-bold">{plan.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
          </div>
          <div className="mb-8">
            <span className="text-4xl font-extrabold">{plan.priceLabel}</span>
            <span className="text-muted-foreground ml-1">{plan.trialDescription}</span>
          </div>
          <ul className="mb-8 flex-1 space-y-4">
            {plan.features.map((feature, idx) => (
              <li key={`${plan.id}-feat-${idx}`} className="flex items-center text-sm">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                {feature}
              </li>
            ))}
          </ul>
          <Button
            className="w-full"
            variant={plan.recommended ? 'default' : 'outline'}
            onClick={() => handleSubscribe(plan)}
            disabled={loading !== null}
          >
            {loading === plan.name ? 'Redirecionando...' : plan.ctaLabel || 'Assinar Agora'}
          </Button>
        </div>
      ))}
    </div>
  );
};
