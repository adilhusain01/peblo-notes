"use client"
import { useEffect, useState } from "react"
import { FileText, Archive, Sparkles, TrendingUp, Clock, Hash } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface Insights {
  totalNotes: number
  archivedNotes: number
  aiUsageCount: number
  recentNotes: { _id: string; title: string; updatedAt: string; tags: string[] }[]
  topTags: { tag: string; count: number }[]
  weeklyActivity: { date: string; count: number }[]
}

function StatCard({ label, value, icon: Icon, sub }: { label: string; value: number; icon: any; sub?: string }) {
  return (
    <div className="border border-[#1a1a1a] bg-[#0d0d0d] p-5 animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <span className="text-[10px] font-mono text-[#444] uppercase tracking-widest">{label}</span>
        <Icon className="h-4 w-4 text-[#333]" />
      </div>
      <div className="text-3xl font-semibold text-white font-mono">{value}</div>
      {sub && <p className="text-xs text-[#444] mt-1">{sub}</p>}
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<Insights | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/insights").then(r => r.json()).then(setData).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[1,2,3].map(i => <div key={i} className="h-28 shimmer" />)}
      </div>
    </div>
  )

  if (!data) return null

  const maxActivity = Math.max(...data.weeklyActivity.map(a => a.count), 1)

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="h-14 border-b border-[#1a1a1a] flex items-center px-8 gap-4">
        <h1 className="text-sm font-mono text-[#666] uppercase tracking-widest">Overview</h1>
      </div>

      <div className="p-8 space-y-8 max-w-5xl">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Total Notes" value={data.totalNotes} icon={FileText} sub="active notes" />
          <StatCard label="Archived" value={data.archivedNotes} icon={Archive} sub="archived notes" />
          <StatCard label="AI Summaries" value={data.aiUsageCount} icon={Sparkles} sub="generated" />
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Weekly activity */}
          <div className="border border-[#1a1a1a] bg-[#0d0d0d] p-5">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="h-4 w-4 text-[#444]" />
              <span className="text-[10px] font-mono text-[#444] uppercase tracking-widest">Weekly Activity</span>
            </div>
            <div className="flex items-end gap-2 h-24">
              {data.weeklyActivity.map(({ date, count }) => (
                <div key={date} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-white/10 relative group transition-all hover:bg-white/20"
                    style={{ height: `${(count / maxActivity) * 80 + (count > 0 ? 4 : 0)}px`, minHeight: count > 0 ? "4px" : "2px" }}
                  >
                    {count > 0 && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[#1a1a1a] border border-[#333] px-1.5 py-0.5 text-[10px] font-mono text-white whitespace-nowrap z-10">
                        {count}
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] font-mono text-[#333]">
                    {format(new Date(date + "T12:00:00"), "EEE")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top tags */}
          <div className="border border-[#1a1a1a] bg-[#0d0d0d] p-5">
            <div className="flex items-center gap-2 mb-5">
              <Hash className="h-4 w-4 text-[#444]" />
              <span className="text-[10px] font-mono text-[#444] uppercase tracking-widest">Top Tags</span>
            </div>
            {data.topTags.length === 0 ? (
              <p className="text-[#333] text-sm">No tags yet</p>
            ) : (
              <div className="space-y-2">
                {data.topTags.map(({ tag, count }) => (
                  <div key={tag} className="flex items-center gap-3">
                    <span className="text-xs font-mono text-[#666] w-24 truncate">#{tag}</span>
                    <div className="flex-1 h-1 bg-[#1a1a1a]">
                      <div
                        className="h-full bg-[#333] transition-all"
                        style={{ width: `${(count / data.topTags[0].count) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-[#444] w-4 text-right">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent notes */}
        <div className="border border-[#1a1a1a] bg-[#0d0d0d] p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#444]" />
              <span className="text-[10px] font-mono text-[#444] uppercase tracking-widest">Recently Edited</span>
            </div>
            <Link href="/dashboard/notes" className="text-[10px] font-mono text-[#444] hover:text-white transition-colors uppercase tracking-widest">
              View all →
            </Link>
          </div>
          {data.recentNotes.length === 0 ? (
            <p className="text-[#333] text-sm">No notes yet. <Link href="/dashboard/notes" className="text-[#666] hover:text-white">Create one →</Link></p>
          ) : (
            <div className="divide-y divide-[#111]">
              {data.recentNotes.map((note) => (
                <Link
                  key={note._id}
                  href={`/dashboard/notes/${note._id}`}
                  className="flex items-center justify-between py-3 group"
                >
                  <div>
                    <p className="text-sm text-[#aaa] group-hover:text-white transition-colors">{note.title}</p>
                    <div className="flex gap-1.5 mt-1">
                      {note.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[10px] font-mono text-[#444]">#{tag}</span>
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#333]">
                    {format(new Date(note.updatedAt), "MMM d, HH:mm")}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
