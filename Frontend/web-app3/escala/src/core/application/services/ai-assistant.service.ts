import { AiAssistantPrompt } from '@/core/domain/models/ai-assistant.model';
import { AiAssistantBackendAdapter } from '@/infrastructure/adapters/ai-assistant.adapter';

export class AiAssistantService {
  static async execute(input: AiAssistantPrompt): Promise<string> {
    return AiAssistantBackendAdapter.execute(input);
  }
}
