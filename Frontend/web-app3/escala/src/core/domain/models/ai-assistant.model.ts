export type AiAssistantTask = 'ANALYZE_RISK' | 'SUGGEST_REPLACEMENT' | 'EXPLAIN_CONFLICT';

export type AiAssistantPrompt = {
  task: AiAssistantTask;
  prompt: string;
};

export function buildAiAssistantRequest(input: AiAssistantPrompt) {
  const prompt = input.prompt.trim();
  if (!prompt) {
    throw new Error('Digite uma pergunta para a assistente.');
  }

  return {
    task: input.task,
    context: {
      userPrompt: prompt,
      source: 'ai-assistant-panel',
    },
  };
}
