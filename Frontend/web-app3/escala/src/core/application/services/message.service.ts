import { MessageBackendAdapter, MessageModel } from "@/infrastructure/adapters/message.adapter";

export class MessageService {
  static async listMessages(token: string, status?: string): Promise<MessageModel[]> {
    return await MessageBackendAdapter.listMessages(token, status);
  }

  static async createMessage(message: Partial<MessageModel>, token: string): Promise<MessageModel> {
    return await MessageBackendAdapter.createMessage(message, token);
  }

  static async decideMessage(id: string, decision: 'APPROVED' | 'REJECTED', token: string): Promise<MessageModel> {
    return await MessageBackendAdapter.decideMessage(id, decision, token);
  }
}
