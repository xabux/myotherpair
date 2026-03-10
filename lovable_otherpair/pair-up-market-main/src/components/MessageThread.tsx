import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { Message } from "@/data/sampleData";

interface MessageThreadProps {
  messages: Message[];
  currentUserId: string;
  onSend: (text: string) => void;
}

const MessageThread = ({ messages, currentUserId, onSend }: MessageThreadProps) => {
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText("");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-16">
            <span className="text-3xl block mb-3">👋</span>
            <p className="text-sm font-medium text-foreground mb-1">Start the conversation</p>
            <p className="text-xs text-muted-foreground">Say hello and discuss the match!</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const isMine = msg.senderId === currentUserId;
          const showTimestamp = i === 0 || 
            new Date(msg.timestamp).getTime() - new Date(messages[i-1].timestamp).getTime() > 300000;
          return (
            <div key={msg.id}>
              {showTimestamp && (
                <p className="text-[10px] text-muted-foreground text-center mb-2">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
              <div className={`flex ${isMine ? "justify-end" : "justify-start"} animate-fade-in`}>
                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm ${
                    isMine
                      ? "gradient-warm text-accent-foreground rounded-br-md shadow-sm"
                      : "bg-muted/60 border border-border/30 text-foreground rounded-bl-md"
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="border-t border-border/30 p-3 flex gap-2 bg-card/80 backdrop-blur-sm">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-full h-11 px-4 bg-muted/50 border-border/30"
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <Button size="icon" onClick={handleSend} disabled={!text.trim()} className="rounded-full h-11 w-11 gradient-warm border-0 shadow-sm">
          <Send className="h-4 w-4 text-accent-foreground" />
        </Button>
      </div>
    </div>
  );
};

export default MessageThread;
