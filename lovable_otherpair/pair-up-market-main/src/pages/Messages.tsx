import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { sampleConversations, sampleUsers, sampleListings } from "@/data/sampleData";
import MessageThread from "@/components/MessageThread";
import BottomNav from "@/components/BottomNav";
import { ArrowLeft, MessageCircle } from "lucide-react";
import type { Message } from "@/data/sampleData";

const Messages = () => {
  const { listingId } = useParams();
  const currentUserId = "u1";

  const [conversations, setConversations] = useState(sampleConversations);

  if (listingId) {
    const conv = conversations.find((c) => c.listingId === listingId) || {
      id: "new",
      participants: [currentUserId],
      listingId,
      messages: [],
    };

    const listing = sampleListings.find((l) => l.id === listingId);
    const otherUserId = conv.participants.find((p) => p !== currentUserId) || listing?.userId || "";
    const otherUser = sampleUsers.find((u) => u.id === otherUserId);

    const handleSend = (text: string) => {
      const newMsg: Message = {
        id: `m${Date.now()}`,
        senderId: currentUserId,
        receiverId: otherUserId,
        listingId: listingId!,
        text,
        timestamp: new Date().toISOString(),
      };
      setConversations((prev) => {
        const existing = prev.find((c) => c.listingId === listingId);
        if (existing) {
          return prev.map((c) =>
            c.listingId === listingId ? { ...c, messages: [...c.messages, newMsg] } : c
          );
        }
        return [...prev, { id: `c${Date.now()}`, participants: [currentUserId, otherUserId], listingId: listingId!, messages: [newMsg] }];
      });
    };

    const currentConv = conversations.find((c) => c.listingId === listingId);

    return (
      <div className="h-screen flex flex-col bg-background">
        <header className="glass-nav border-b border-border/50 px-4 py-3 flex items-center gap-3">
          <Link to="/messages" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {otherUser && <img src={otherUser.avatar} alt="" className="w-9 h-9 rounded-xl object-cover" />}
            <div className="min-w-0">
              <p className="font-semibold text-sm text-foreground truncate">{otherUser?.name || "User"}</p>
              {listing && (
                <p className="text-[11px] text-muted-foreground truncate">
                  {listing.brand} {listing.model} · UK {listing.size}
                </p>
              )}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-hidden">
          <MessageThread
            messages={currentConv?.messages || []}
            currentUserId={currentUserId}
            onSend={handleSend}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 glass-nav border-b border-border/50 px-4 py-3.5">
        <h1 className="font-display text-lg font-bold text-foreground">Messages</h1>
      </header>

      <div className="max-w-lg mx-auto">
        {conversations.length > 0 ? (
          conversations.map((conv, i) => {
            const otherUserId = conv.participants.find((p) => p !== currentUserId);
            const otherUser = sampleUsers.find((u) => u.id === otherUserId);
            const listing = sampleListings.find((l) => l.id === conv.listingId);
            const lastMsg = conv.messages[conv.messages.length - 1];

            return (
              <Link
                key={conv.id}
                to={`/messages/${conv.listingId}`}
                className={`flex items-center gap-3 px-4 py-4 border-b border-border/30 hover:bg-muted/30 transition-colors opacity-0 animate-fade-in stagger-${i + 1}`}
              >
                <div className="relative">
                  {otherUser && <img src={otherUser.avatar} alt="" className="w-12 h-12 rounded-xl object-cover" />}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-match-green border-2 border-background" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm text-foreground">{otherUser?.name}</p>
                    {lastMsg && (
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(lastMsg.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </div>
                  {listing && (
                    <p className="text-[10px] text-accent font-medium mt-0.5">
                      {listing.brand} {listing.model} · UK {listing.size}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {lastMsg?.text}
                  </p>
                </div>
              </Link>
            );
          })
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

      <BottomNav />
    </div>
  );
};

export default Messages;
