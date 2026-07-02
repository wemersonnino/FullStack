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

  private static url(path = '', params?: URLSearchParams) {
    const url = `${this.baseUrl}${path}`;
    if (typeof window !== 'undefined') {
      const relativeUrl = new URL(url, window.location.origin);
      params?.forEach((value, key) => relativeUrl.searchParams.set(key, value));
      return `${relativeUrl.pathname}${relativeUrl.search}`;
    }

    const resolvedUrl = new URL(url, process.env.NEXTAUTH_URL || 'http://localhost:3000');

    params?.forEach((value, key) => resolvedUrl.searchParams.set(key, value));
    return resolvedUrl.toString();
  }

  private static normalizeListResponse(payload: unknown): MessageModel[] {
    if (Array.isArray(payload)) {
      return payload as MessageModel[];
    }
    if (payload && typeof payload === 'object') {
      const content = (payload as { content?: unknown }).content;
      if (Array.isArray(content)) {
        return content as MessageModel[];
      }
    }
    return [];
  }

  static async listMessages(token?: string, status?: string): Promise<MessageModel[]> {
    const params = new URLSearchParams();
    if (status) {
      params.set('status', status);
    }

    try {
      const response = await fetch(this.url('', params), {
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: 'no-store',
      });
      if (!response.ok) return [];
      return this.normalizeListResponse(await response.json());
    } catch (error) {
      // Dev/HMR and route transitions can cause transient client fetch failures.
      if (typeof window === 'undefined') {
        console.warn('Failed to fetch messages', error);
      }
      return [];
    }
  }

  static async createMessage(message: Partial<MessageModel>, token?: string): Promise<MessageModel> {
    const response = await fetch(this.url(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        receiverId: message.receiverId || null,
        type: message.type,
        title: message.title,
        content: message.content,
        metadata: message.metadata,
      }),
    });
    if (!response.ok) throw new Error("Failed to create message");
    return await response.json();
  }

  static async decideMessage(id: string, decision: 'APPROVED' | 'REJECTED', token?: string): Promise<MessageModel> {
    const response = await fetch(this.url(`/${id}/decision`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ decision }),
    });
    if (!response.ok) throw new Error("Failed to decide message");
    return await response.json();
  }
}
