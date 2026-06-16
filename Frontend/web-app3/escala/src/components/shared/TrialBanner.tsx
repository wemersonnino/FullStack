"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { differenceInDays, parseISO } from "date-fns";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TrialBanner() {
  const { data: session } = useSession();

  if (!session?.user || session.user.planType !== "TRIAL" || !session.user.trialExpiresAt) {
    return null;
  }

  const trialExpiresAt = parseISO(session.user.trialExpiresAt);
  const daysLeft = differenceInDays(trialExpiresAt, new Date());

  if (daysLeft < 0) {
    return (
      <div className="bg-destructive text-destructive-foreground px-4 py-3 text-sm flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Info className="h-4 w-4" />
          <span>Seu período de teste expirou. Faça o upgrade para continuar usando os recursos premium.</span>
        </div>
        <Button variant="outline" size="sm" className="bg-transparent border-white hover:bg-white hover:text-destructive">
          Fazer Upgrade
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-blue-600 text-white px-4 py-3 text-sm flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Info className="h-4 w-4" />
        <span>Você está no período de teste (TRIAL). Restam <strong>{daysLeft} dias</strong>.</span>
      </div>
      <Button variant="outline" size="sm" className="bg-transparent border-white hover:bg-white hover:text-blue-600">
        Assinar Agora
      </Button>
    </div>
  );
}
