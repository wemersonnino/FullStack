'use client';

import { motion } from 'framer-motion';
import { Sparkles, BrainCircuit } from 'lucide-react';
import { useAiStore } from '../store/useAiStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function AiAssistantTrigger() {
  const { openAi, isOpen, credits } = useAiStore();

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="fixed bottom-6 right-6 z-40"
    >
      <Button
        size="lg"
        onClick={openAi}
        className={cn(
          "h-14 rounded-full px-6 shadow-xl transition-all duration-300 gap-3 group",
          isOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      >
        <div className="relative">
          <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
          <BrainCircuit className="h-5 w-5 absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <span className="font-bold">Assistente IA</span>
        {credits > 0 && (
          <div className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground text-[10px] text-primary">
            {credits}
          </div>
        )}
      </Button>
    </motion.div>
  );
}
