import { buildAiAssistantRequest, AiAssistantPrompt } from '@/core/domain/models/ai-assistant.model';

export class AiAssistantBackendAdapter {
  static async execute(input: AiAssistantPrompt): Promise<string> {
    const response = await fetch('/api/bff/ai/task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildAiAssistantRequest(input)),
    });

    if (!response.ok) throw new Error('Falha na análise da IA');

    const data = await response.json();
    return data.response ?? 'Sem resposta disponível';
  }
}
