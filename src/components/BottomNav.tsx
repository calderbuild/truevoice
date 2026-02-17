"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    label: "Home",
    href: "/",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"}>
        {active ? (
          <path d="M3 12.5l1.5-1.5 7.5-7.5 7.5 7.5 1.5 1.5v8a1 1 0 01-1 1h-4a1 1 0 01-1-1v-5a1 1 0 00-1-1h-2a1 1 0 00-1 1v5a1 1 0 01-1 1H4a1 1 0 01-1-1v-8z" />
        ) : (
          <path
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    ),
  },
  {
    label: "Review",
    href: "/write",
    isAction: true,
    icon: (_active: boolean) => (
      <div className="w-10 h-10 -mt-4 rounded-full bg-accent flex items-center justify-center shadow-[0_2px_8px_rgba(200,113,62,0.4)]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 5v14m7-7H5"
            stroke="#fff"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
  },
  {
    label: "Profile",
    href: "/profile",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"}>
        {active ? (
          <path d="M12 2a5 5 0 110 10 5 5 0 010-10zM4 21a8 8 0 1116 0H4z" />
        ) : (
          <path
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  if (pathname.startsWith("/entity/")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 bottom-nav border-t border-[var(--tv-border)] px-6 pb-[env(safe-area-inset-bottom)] pt-2">
      <div className="flex justify-around items-end">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          if (item.isAction) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-0.5 py-1 px-3"
              >
                {item.icon(false)}
                <span className="text-[10px] font-semibold text-accent">{item.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 transition-colors ${
                isActive ? "text-foreground" : "text-muted"
              }`}
            >
              {item.icon(isActive)}
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
