'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '../../../../lib/supabase';
import { ArrowLeft, Send } from 'lucide-react';

interface Message {
  id: string;
  from: 'me' | 'them';
  text: string;
  time: string;
  timestamp: string;
}

interface MatchInfo {
  otherUserName: string;
  otherUserAvatar: string | null;
  listingBrand: string;
  listingModel: string;
  listingSize: string;
}

interface PageProps {
  params: { id: string };
}

export default function MessageThreadPage({ params }: PageProps) {
  const matchId  = params.id;
  const [userId,    setUserId]    = useState<string | null>(null);
  const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null);
  const [messages,  setMessages]  = useState<Message[]>([]);
  const [newMsg,    setNewMsg]    = useState('');
  const [sending,   setSending]   = useState(false);
  const [loading,   setLoading]   = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUserId(session.user.id);
    });
  }, []);

  // Load match info
  useEffect(() => {
    if (!userId || !matchId) return;
    (async () => {
      const { data } = await supabase
        .from('matches')
        .select(`
          id, user_id_1, user_id_2,
          profile1:user_id_1(name, avatar_url),
          profile2:user_id_2(name, avatar_url),
          listing1:listing_id_1(shoe_brand, shoe_model, size),
          listing2:listing_id_2(shoe_brand, shoe_model, size)
        `)
        .eq('id', matchId)
        .single();

      if (data) {
        const r        = data as Record<string, unknown>;
        const isUser1  = r.user_id_1 === userId;
        const otherProf = (isUser1 ? r.profile2 : r.profile1) as Record<string, string> | null;
        const listing   = (isUser1 ? r.listing2 : r.listing1) as Record<string, string> | null;
        setMatchInfo({
          otherUserName:   otherProf?.name ?? 'User',
          otherUserAvatar: otherProf?.avatar_url ?? null,
          listingBrand:    listing?.shoe_brand ?? '',
          listingModel:    listing?.shoe_model ?? '',
          listingSize:     listing?.size ?? '',
        });
      }
    })();
  }, [userId, matchId]);

  // Load messages
  useEffect(() => {
    if (!userId || !matchId) return;
    (async () => {
      const { data } = await supabase
        .from('messages')
        .select('id, sender_id, content, created_at')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });

      if (data) {
        const mapped: Message[] = (data as { id: string; sender_id: string; content: string; created_at: string }[]).map(m => ({
          id:        m.id,
          from:      m.sender_id === userId ? 'me' : 'them',
          text:      m.content,
          time:      new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: m.created_at,
        }));
        setMessages(mapped);
      }
      setLoading(false);
    })();
  }, [userId, matchId]);

  // Real-time subscription
  useEffect(() => {
    if (!userId || !matchId) return;
    const channel = supabase
      .channel(`messages:${matchId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `match_id=eq.${matchId}`,
      }, payload => {
        const m = payload.new as { id: string; sender_id: string; content: string; created_at: string };
        const newMessage: Message = {
          id:        m.id,
          from:      m.sender_id === userId ? 'me' : 'them',
          text:      m.content,
          time:      new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: m.created_at,
        };
        setMessages(prev => [...prev, newMessage]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, matchId]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMsg.trim() || !userId || !matchId || sending) return;
    const text = newMsg.trim();
    setNewMsg('');
    setSending(true);

    // Optimistic update
    const optimistic: Message = {
      id:        `opt-${Date.now()}`,
      from:      'me',
      text,
      time:      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);

    await supabase.from('messages').insert({
      match_id:  matchId,
      sender_id: userId,
      content:   text,
    });
    setSending(false);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="glass-nav border-b border-border/50 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <Link href="/app/messages" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {matchInfo?.otherUserAvatar ? (
            <img src={matchInfo.otherUserAvatar} alt="" className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center text-sm font-bold text-accent flex-shrink-0">
              {matchInfo?.otherUserName?.[0] ?? '?'}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">{matchInfo?.otherUserName ?? 'User'}</p>
            {matchInfo && (matchInfo.listingBrand || matchInfo.listingModel) && (
              <p className="text-[11px] text-muted-foreground truncate">
                {matchInfo.listingBrand} {matchInfo.listingModel}
                {matchInfo.listingSize ? ` · UK ${matchInfo.listingSize}` : ''}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-3xl block mb-3">👋</span>
            <p className="text-sm font-medium text-foreground mb-1">Start the conversation</p>
            <p className="text-xs text-muted-foreground">Say hello and discuss the match!</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMine = msg.from === 'me';
            const showTimestamp = i === 0 ||
              new Date(msg.timestamp).getTime() - new Date(messages[i - 1].timestamp).getTime() > 300000;
            return (
              <div key={msg.id}>
                {showTimestamp && (
                  <p className="text-[10px] text-muted-foreground text-center mb-2">{msg.time}</p>
                )}
                <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm ${
                      isMine
                        ? 'gradient-warm text-accent-foreground rounded-br-md shadow-sm'
                        : 'bg-muted/60 border border-border/30 text-foreground rounded-bl-md'
                    }`}
                  >
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border/30 p-3 flex gap-2 bg-card/80 backdrop-blur-sm flex-shrink-0">
        <input
          value={newMsg}
          onChange={e => setNewMsg(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-full h-11 px-4 bg-muted/50 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-accent/50 transition-colors"
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
        />
        <button
          onClick={sendMessage}
          disabled={!newMsg.trim() || sending}
          className="rounded-full h-11 w-11 gradient-warm flex items-center justify-center shadow-sm disabled:opacity-40 transition-opacity"
          aria-label="Send"
        >
          <Send className="h-4 w-4 text-accent-foreground" />
        </button>
      </div>
    </div>
  );
}
