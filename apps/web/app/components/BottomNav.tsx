'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusCircle, MessageCircle, User } from 'lucide-react';

const items = [
  { to: '/app',          icon: Home,          label: 'Home'     },
  { to: '/app/browse',   icon: Search,        label: 'Listings' },
  { to: '/app/create',   icon: PlusCircle,    label: 'List', isAction: true },
  { to: '/app/messages', icon: MessageCircle, label: 'Chat'     },
  { to: '/app/profile',  icon: User,          label: 'Profile'  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border/50 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {items.map(({ to, icon: Icon, label, isAction }) => {
          const active = pathname === to || (to !== '/app' && pathname.startsWith(to));
          return (
            <Link
              key={to}
              href={to}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] font-medium transition-all duration-200 ${
                active ? 'text-accent' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isAction ? (
                <div className="w-10 h-10 rounded-2xl gradient-warm flex items-center justify-center shadow-sm -mt-3">
                  <Icon className="h-5 w-5 text-accent-foreground" />
                </div>
              ) : (
                <div className={`relative p-1.5 rounded-xl transition-all duration-200 ${active ? 'bg-accent/10' : ''}`}>
                  <Icon className={`h-5 w-5 transition-transform duration-200 ${active ? 'scale-110' : ''}`} />
                </div>
              )}
              <span className={`transition-all duration-200 ${isAction ? '-mt-0.5' : ''} ${active ? 'font-semibold' : ''}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
