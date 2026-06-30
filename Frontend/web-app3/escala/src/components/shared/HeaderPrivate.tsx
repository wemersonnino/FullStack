'use client';

import { useEffect, useState } from 'react';
import { Bell, ChevronDown, LogOut, User, Settings, Shield, MailOpen } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { resolveAvatarUrl } from '@/lib/utils';
import { MessageModel } from '@/infrastructure/adapters/message.adapter';
import { MessageService } from '@/core/application/services/message.service';
import { MessageDetailsModal } from '@/components/dashboard/MessageDetailsModal';

type HeaderUser = {
  username?: string | null;
  email?: string | null;
  roles?: string[];
  avatarUrl?: string | null;
  image?: string | null;
  picture?: string | null;
  avatar?: string | { url?: string | null } | null;
};

export const HeaderPrivate = ({
  user: initialUser,
  initialMessages = [],
}: {
  user?: HeaderUser;
  initialMessages?: MessageModel[];
}) => {
  const { data: session } = useSession();
  const sessionUser = session?.user as HeaderUser | undefined;
  const user = {
    ...initialUser,
    ...sessionUser,
    avatarUrl: sessionUser?.avatarUrl || initialUser?.avatarUrl || null,
    image: sessionUser?.image || initialUser?.image || null,
  };

  const [messages, setMessages] = useState<MessageModel[]>(initialMessages);
  const [selectedMessage, setSelectedMessage] = useState<MessageModel | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  async function refreshNotifications() {
    try {
      const data = await MessageService.listMessages(undefined, 'PENDING');
      setMessages(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function loadNotifications() {
      try {
        const data = await MessageService.listMessages(undefined, 'PENDING');
        if (!cancelled) setMessages(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    }

    const initialLoad = window.setTimeout(() => {
      void loadNotifications();
    }, 0);
    
    const interval = setInterval(() => {
      void loadNotifications();
    }, 30000);
    return () => {
      cancelled = true;
      window.clearTimeout(initialLoad);
      clearInterval(interval);
    };
  }, []);

  const avatarSrc = resolveAvatarUrl(user);

  const handleMessageClick = (msg: MessageModel) => {
    setSelectedMessage(msg);
    setModalOpen(true);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <header className="sticky top-0 z-20 mb-6 flex h-16 items-center justify-end gap-3 border-b bg-background/90 px-4 backdrop-blur md:px-8">
      
      {/* Notifications Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" size="icon" aria-label="Notificacoes" className="rounded-full relative hover:bg-muted/80">
            <Bell className="size-5" />
            {messages.length > 0 && (
              <Badge className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 p-0 text-[10px] font-bold text-white border-2 border-background">
                {messages.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80 border border-border/80 bg-background/95 backdrop-blur-md rounded-2xl shadow-xl p-2" align="end">
          <DropdownMenuLabel className="flex items-center justify-between px-3 py-2">
            <span className="font-extrabold text-sm tracking-tight text-foreground">Solicitações & Notificações</span>
            <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider">
              {messages.length} Pendentes
            </Badge>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border/60" />
          
          <div className="max-h-[300px] overflow-y-auto space-y-1">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <MailOpen className="size-8 text-muted-foreground/60 mb-2 stroke-[1.5]" />
                <p className="text-xs font-semibold">Tudo limpo por aqui!</p>
                <p className="text-[10px] text-muted-foreground mt-1">Nenhuma nova notificação pendente.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <DropdownMenuItem 
                  key={msg.id} 
                  onClick={() => handleMessageClick(msg)}
                  className="flex flex-col items-start gap-1 p-3 rounded-xl cursor-pointer hover:bg-muted/60 transition-all border border-transparent hover:border-border/30"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-xs text-foreground truncate max-w-[180px]">{msg.title}</span>
                    <Badge variant="outline" className="text-[9px] uppercase tracking-wider font-semibold">
                      {msg.type.split('_')[0]}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{msg.content}</p>
                  <span className="text-[9px] text-muted-foreground/60 mt-1 block">
                    {new Date(msg.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </DropdownMenuItem>
              ))
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="h-6 bg-border/60 mx-1" />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative flex items-center gap-3 rounded-xl border bg-card px-3 py-6 transition-all hover:bg-muted/50">
            <Avatar className="size-9 border-2 border-primary/10 overflow-hidden relative">
              {avatarSrc ? (
                <Image 
                  src={avatarSrc} 
                  alt={user?.username || 'Usuario'} 
                  fill
                  sizes="36px"
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <AvatarFallback className="bg-primary text-sm font-black text-primary-foreground uppercase italic tracking-tighter">
                  {user?.username?.slice(0, 1).toUpperCase() || 'U'}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="hidden min-w-0 flex-col items-start sm:flex">
              <p className="max-w-[120px] truncate text-sm font-bold leading-none">{user?.username}</p>
              <p className="max-w-[120px] truncate text-[10px] font-medium text-muted-foreground mt-1">{user?.email}</p>
            </div>
            <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-bold leading-none">{user?.username}</p>
              <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/perfil" className="cursor-pointer w-full flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Meu Perfil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/configuracoes" className="cursor-pointer w-full flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </Link>
            </DropdownMenuItem>
            {user?.roles?.includes('ADMIN') && (
              <DropdownMenuItem asChild>
                <Link href="/dashboard/auditoria" className="cursor-pointer w-full flex items-center">
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Administração</span>
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair da conta</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Message Details Modal */}
      {selectedMessage && (
        <MessageDetailsModal
          message={selectedMessage}
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedMessage(null);
          }}
          onDecisionSuccess={refreshNotifications}
        />
      )}
    </header>
  );
};
