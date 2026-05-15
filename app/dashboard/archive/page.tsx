"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Archive, RotateCcw, FileText } from "lucide-react"
import { format } from "date-fns"
import { toast } from "@/components/Toaster"

interface Note {
  _id: string
  title: string
  tags: string[]
  updatedAt: string
}

export default function ArchivePage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/notes?archived=true").then(r => r.json()).then(data => {
      setNotes(Array.isArray(data) ? data : [])
      setLoading(false)
    })
  }, [])

  async function restore(id: string) {
    await fetch(`/api/notes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isArchived: false }),
    })
    setNotes(prev => prev.filter(n => n._id !== id))
    toast("Note restored", "success")
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="h-14 border-b border-[#1a1a1a] flex items-center px-6">
        <h1 className="text-sm font-mono text-[#666] uppercase tracking-widest">Archive</h1>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-16 shimmer" />)}
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Archive className="h-10 w-10 text-[#222]" />
            <p className="text-[#444] text-sm">No archived notes</p>
          </div>
        ) : (
          <div className="space-y-2 max-w-2xl">
            {notes.map(note => (
              <div key={note._id} className="flex items-center gap-4 border border-[#1a1a1a] bg-[#0d0d0d] p-4 group">
                <FileText className="h-4 w-4 text-[#333] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#666] truncate">{note.title}</p>
                  <div className="flex gap-1.5 mt-0.5">
                    {note.tags.slice(0, 3).map(t => (
                      <span key={t} className="text-[10px] font-mono text-[#333]">#{t}</span>
                    ))}
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#2a2a2a]">{format(new Date(note.updatedAt), "MMM d")}</span>
                <button
                  onClick={() => restore(note._id)}
                  className="flex items-center gap-1.5 text-xs text-[#444] hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Restore
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
