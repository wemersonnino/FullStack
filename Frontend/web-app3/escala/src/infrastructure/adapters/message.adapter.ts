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
  private static baseUrl = '/api/bff/messages';

  static async listMessages(_token: string, status?: string): Promise<MessageModel[]> {
    const url = status 
      ? `${this.baseUrl}?status=${status}`
      : this.baseUrl;
      
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });
    if (!response.ok) throw new Error("Failed to fetch messages");
    return await response.json();
  }

  static async createMessage(message: Partial<MessageModel>, _token: string): Promise<MessageModel> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
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

  static async decideMessage(id: string, decision: 'APPROVED' | 'REJECTED', _token: string): Promise<MessageModel> {
    const response = await fetch(`${this.baseUrl}/${id}/decision`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ decision }),
    });
    if (!response.ok) throw new Error("Failed to decide message");
    return await response.json();
  }
}
