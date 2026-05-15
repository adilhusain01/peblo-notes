"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  FileText, LayoutDashboard, Archive, LogOut, Sparkles, Hash, Settings
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  user: { name: string; email: string; id?: string }
}

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/notes", label: "Notes", icon: FileText },
  { href: "/dashboard/archive", label: "Archive", icon: Archive },
]

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-[220px] border-r border-[#1a1a1a] bg-[#080808] flex flex-col shrink-0">
      {/* Logo */}
      <div className="h-14 border-b border-[#1a1a1a] flex items-center px-5">
        <img src="https://internshala-uploads.internshala.com/logo%2Fgnta0paqhbw-70978.png.webp" alt="Logo" className="h-8 w-auto" />
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3">
        <div className="mb-6">
          <p className="px-2 mb-2 text-[10px] font-mono text-[#333] uppercase tracking-widest">Workspace</p>
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-2 py-2 text-sm transition-colors mb-0.5",
                  active
                    ? "text-white bg-[#161616]"
                    : "text-[#555] hover:text-[#aaa] hover:bg-[#0f0f0f]"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </div>

        <div>
          <p className="px-2 mb-2 text-[10px] font-mono text-[#333] uppercase tracking-widest">AI</p>
          <div className="px-2 py-2 flex items-center gap-3 text-[#333] text-sm">
            <Sparkles className="h-4 w-4 text-[#5a3fa0]" />
            <span>Groq Powered</span>
          </div>
        </div>
      </nav>

      {/* User */}
      <div className="border-t border-[#1a1a1a] p-3">
        <div className="flex items-center gap-3 px-2 py-2 mb-1">
          <div className="w-6 h-6 bg-[#1a1a1a] border border-[#333] flex items-center justify-center text-[10px] text-[#888] font-mono shrink-0">
            {user.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#aaa] truncate">{user.name}</p>
            <p className="text-[10px] text-[#444] truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-2 py-1.5 text-sm text-[#444] hover:text-red-400 transition-colors w-full"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
