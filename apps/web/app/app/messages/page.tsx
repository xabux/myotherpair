'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';
import { MessageCircle } from 'lucide-react';

interface Conversation {
  id: string;
  otherUserName: string;
  otherUserAvatar: string | null;
  lastMessage: string;
  lastMessageTime: string;
  isOnline: boolean;
}

export default function MessagesPage() {
  const [userId,        setUserId]        = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUserId(session.user.id);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const { data } = await supabase
        .from('matches')
        .select(`
          id, created_at, user_id_1, user_id_2,
          profile1:user_id_1(name, avatar_url),
          profile2:user_id_2(name, avatar_url),
          messages(content, created_at, sender_id)
        `)
        .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
        .order('created_at', { ascending: false });

      const mapped: Conversation[] = (data ?? []).map((r: Record<string, unknown>) => {
        const isUser1   = r.user_id_1 === userId;
        const otherProf = (isUser1 ? r.profile2 : r.profile1) as Record<string, string> | null;
        const msgs      = (r.messages as { content: string; created_at: string; sender_id: string }[] | null) ?? [];
        const latest    = msgs.sort((a, b) => a.created_at > b.created_at ? -1 : 1)[0];
        return {
          id:               r.id as string,
          otherUserName:    otherProf?.name ?? 'User',
          otherUserAvatar:  otherProf?.avatar_url ?? null,
          lastMessage:      latest?.content ?? '',
          lastMessageTime:  latest?.created_at
            ? new Date(latest.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
            : new Date(r.created_at as string).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
          isOnline: true,
        };
      });
      setConversations(mapped);
      setLoading(false);
    })();
  }, [userId]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 glass-nav border-b border-border/50 px-4 py-3.5">
        <h1 className="font-display text-lg font-bold text-foreground">Messages</h1>
      </header>

      <div className="max-w-lg mx-auto">
        {loading ? (
          <>
            {[0,1,2,3,4].map(i => (
              <div key={i} className="flex items-center gap-3 px-4 py-4 border-b border-border/30">
                <div className="w-12 h-12 rounded-xl bg-muted animate-pulse flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-3 w-24 rounded bg-muted animate-pulse mb-2" />
                  <div className="h-2.5 w-36 rounded bg-muted animate-pulse" />
                </div>
              </div>
            ))}
          </>
        ) : conversations.length > 0 ? (
          conversations.map((conv, i) => (
            <Link
              key={conv.id}
              href={`/app/messages/${conv.id}`}
              className={`flex items-center gap-3 px-4 py-4 border-b border-border/30 hover:bg-muted/30 transition-colors opacity-0 animate-fade-in stagger-${Math.min(i + 1, 6)}`}
            >
              <div className="relative flex-shrink-0">
                {conv.otherUserAvatar ? (
                  <img src={conv.otherUserAvatar} alt="" className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-base font-bold text-accent">
                    {conv.otherUserName[0]}
                  </div>
                )}
                {conv.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-match-green border-2 border-background" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm text-foreground">{conv.otherUserName}</p>
                  <span className="text-[10px] text-muted-foreground">{conv.lastMessageTime}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {conv.lastMessage || 'Start the conversation'}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-20 px-4 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground mb-1">No messages yet</p>
            <p className="text-sm text-muted-foreground">Browse listings and message a seller to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
