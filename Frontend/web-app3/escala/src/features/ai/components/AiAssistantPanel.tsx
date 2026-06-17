'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, BrainCircuit, RefreshCcw, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useAiStore } from '../store/useAiStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/ui/loading';
import { toast } from 'sonner';

export function AiAssistantPanel() {
  const { isOpen, closeAi, isAnalyzing, setAnalyzing, analysis, setAnalysis, credits } = useAiStore();

  async function handleAnalyze() {
    setAnalyzing(true);
    setAnalysis(null);
    
    try {
      // BFF: /api/bff/ai/analyze-schedule
      const response = await fetch('/api/bff/ai/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: 'ANALYZE_RISK', context: 'Current monthly schedule' }),
      });

      if (!response.ok) throw new Error('Falha na análise da IA');

      const data = await response.json();
      setAnalysis(data.response);
      toast.success('Análise concluída com sucesso!');
    } catch (err) {
      toast.error('Erro ao processar análise inteligente');
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAi}
            className="fixed inset-0 z-40 bg-background/40 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l bg-card shadow-2xl"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b p-4">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-bold">Assistente Escala IA</h2>
                    <p className="text-[10px] text-muted-foreground">Otimização de Operação</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={closeAi}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-hidden p-4">
                <ScrollArea className="h-full pr-4">
                  <div className="space-y-6">
                    {/* Credits Card */}
                    <Card className="bg-muted/50">
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Créditos Disponíveis</p>
                          <p className="text-2xl font-black">{credits}</p>
                        </div>
                        <BrainCircuit className="h-8 w-8 text-primary/40" />
                      </CardContent>
                    </Card>

                    {!analysis && !isAnalyzing && (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="mb-4 rounded-full bg-primary/5 p-6 text-primary">
                          <BrainCircuit className="h-12 w-12" />
                        </div>
                        <h3 className="text-lg font-bold">Análise de Risco</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Solicite uma análise para identificar gaps de cobertura ou infrações de regras trabalhistas.
                        </p>
                        <Button className="mt-6 gap-2" onClick={handleAnalyze}>
                          <RefreshCcw className="h-4 w-4" />
                          Iniciar Análise
                        </Button>
                      </div>
                    )}

                    {isAnalyzing && (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Loading size={40} text="Processando rede neural..." />
                        <p className="mt-2 text-[10px] text-muted-foreground uppercase tracking-widest">Calculando Probabilidades</p>
                      </div>
                    )}

                    {analysis && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="gap-1 border-primary/20 text-primary">
                            <CheckCircle2 className="h-3 w-3" /> Resultado
                          </Badge>
                        </div>
                        
                        <div className="prose prose-sm dark:prose-invert rounded-lg border bg-background p-4 shadow-inner">
                          {analysis.split('\n').map((line, i) => (
                            <p key={i} className="mb-2 text-sm leading-relaxed last:mb-0">
                              {line}
                            </p>
                          ))}
                        </div>

                        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 flex gap-3">
                          <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0" />
                          <p className="text-[11px] text-amber-700 dark:text-amber-400">
                            <strong>Atenção:</strong> As sugestões da IA devem ser validadas pelo gestor operacional antes da aplicação.
                          </p>
                        </div>

                        <Button variant="outline" className="w-full gap-2" onClick={handleAnalyze}>
                          <RefreshCcw className="h-4 w-4" />
                          Recalcular
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              <div className="border-t p-4 bg-muted/20">
                <p className="text-[10px] text-center text-muted-foreground">
                  Powered by Escala Intelligent Engine
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
