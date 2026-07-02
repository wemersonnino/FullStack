import { MessageService } from '@/core/application/services/message.service';
import { MessageModel } from '@/infrastructure/adapters/message.adapter';
import { getRequiredServerAuth } from '@/lib/auth/server-auth';
import { MessagesInboxView } from '@/features/messages/components/MessagesInboxView';

async function safe(promise: Promise<MessageModel[]>) {
  try {
    return await promise;
  } catch {
    return [];
  }
}

export default async function DashboardMensagensPage() {
  const { accessToken } = await getRequiredServerAuth();

  const [pending, approved, rejected, read] = await Promise.all([
    safe(MessageService.listMessages(accessToken, 'PENDING')),
    safe(MessageService.listMessages(accessToken, 'APPROVED')),
    safe(MessageService.listMessages(accessToken, 'REJECTED')),
    safe(MessageService.listMessages(accessToken, 'READ')),
  ]);

  return (
    <MessagesInboxView
      pending={pending}
      approved={approved}
      rejected={rejected}
      read={read}
    />
  );
}
