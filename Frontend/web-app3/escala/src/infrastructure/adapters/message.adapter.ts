import { ENV } from "@/constants/env";

export interface MessageModel {
  id: string;
  senderId?: string;
  senderName?: string;
  senderEmail?: string;
  receiverId?: string;
  receiverName?: string;
  receiverEmail?: string;
  type: 'PERMISSION_REQUEST' | 'SHIFT_SWAP' | 'MESSAGE' | 'CHAT';
  title: string;
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'READ';
  metadata?: string;
  createdAt: string;
  decidedAt?: string;
}

export class MessageBackendAdapter {
  private static baseUrl = ENV.API_BASE_URL;

  static async listMessages(token: string, status?: string): Promise<MessageModel[]> {
    const url = status 
      ? `${this.baseUrl}/api/v1/messages?status=${status}`
      : `${this.baseUrl}/api/v1/messages`;
      
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
    if (!response.ok) throw new Error("Failed to fetch messages");
    return await response.json();
  }

  static async createMessage(message: Partial<MessageModel>, token: string): Promise<MessageModel> {
    const response = await fetch(`${this.baseUrl}/api/v1/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        receiverId: message.receiverId ? parseInt(message.receiverId) : null,
        type: message.type,
        title: message.title,
        content: message.content,
        metadata: message.metadata,
      }),
    });
    if (!response.ok) throw new Error("Failed to create message");
    return await response.json();
  }

  static async decideMessage(id: string, decision: 'APPROVED' | 'REJECTED', token: string): Promise<MessageModel> {
    const response = await fetch(`${this.baseUrl}/api/v1/messages/${id}/decision`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ decision }),
    });
    if (!response.ok) throw new Error("Failed to decide message");
    return await response.json();
  }
}
