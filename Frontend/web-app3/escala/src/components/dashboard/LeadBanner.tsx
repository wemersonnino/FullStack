'use client';

import { useSession } from 'next-auth/react';
import { Rocket, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { OnboardingForm } from './OnboardingForm';

export function LeadBanner() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const isLead = session?.user?.roles?.includes('LEAD');

  if (!isLead) return null;

  return (
    <>
      <div className="sticky top-[64px] z-10 -mx-4 mb-6 mt-[-1.5rem] flex items-center justify-between bg-primary px-6 py-2 text-primary-foreground shadow-lg md:-mx-10 md:px-10">
        <div className="flex items-center gap-3">
          <div className="hidden rounded-full bg-white/20 p-1.5 sm:block">
            <Rocket className="h-4 w-4 animate-bounce" />
          </div>
          <p className="text-sm font-bold tracking-tight">
            Você está no modo de teste! <span className="hidden font-medium opacity-90 sm:inline">Finalize seu cadastro para configurar sua empresa real e salvar seus dados.</span>
          </p>
        </div>
        <Button 
          variant="secondary" 
          size="sm" 
          className="h-8 font-black uppercase tracking-tighter shadow-sm hover:scale-105 transition-transform"
          onClick={() => setIsOpen(true)}
        >
          Finalizar Agora <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl overflow-hidden p-0 sm:rounded-3xl">
          <div className="bg-primary/5 p-8 pt-10">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase">
                Bem-vindo ao <span className="text-primary">Escala</span>
              </DialogTitle>
              <DialogDescription className="text-base font-medium">
                Vamos transformar seu teste em uma conta oficial. Preencha os dados da sua empresa abaixo.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-8 pt-0">
            <OnboardingForm onSuccess={() => setIsOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
