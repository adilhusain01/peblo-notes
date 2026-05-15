"use client"
import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Search, X, FileText, Loader2, SortAsc, Hash } from "lucide-react"
import { format } from "date-fns"
import { toast } from "@/components/Toaster"

interface Note {
  _id: string
  title: string
  tags: string[]
  category: string
  isArchived: boolean
  aiSummary: string
  updatedAt: string
  createdAt: string
}

function useDebounce(value: string, delay: number) {
  const [deb, setDeb] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDeb(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return deb
}

export default function NotesPage() {
  const router = useRouter()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [search, setSearch] = useState("")
  const [activeTag, setActiveTag] = useState("")
  const [sort, setSort] = useState("updatedAt")
  const debouncedSearch = useDebounce(search, 300)

  const allTags = Array.from(new Set(notes.flatMap(n => n.tags))).slice(0, 12)

  const fetchNotes = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ sort })
    if (debouncedSearch) params.set("q", debouncedSearch)
    if (activeTag) params.set("tag", activeTag)
    const res = await fetch(`/api/notes?${params}`)
    const data = await res.json()
    setNotes(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [debouncedSearch, activeTag, sort])

  useEffect(() => { fetchNotes() }, [fetchNotes])

  async function createNote() {
    setCreating(true)
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Untitled Note" }),
    })
    const note = await res.json()
    setCreating(false)
    router.push(`/dashboard/notes/${note._id}`)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-14 border-b border-[#1a1a1a] flex items-center px-6 gap-4 shrink-0">
        <h1 className="text-sm font-mono text-[#666] uppercase tracking-widest">Notes</h1>
        <div className="flex-1" />
        <button
          onClick={createNote}
          disabled={creating}
          className="flex items-center gap-2 h-8 px-4 bg-white text-black text-xs font-semibold hover:bg-[#e0e0e0] transition-colors disabled:opacity-50"
        >
          {creating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
          New Note
        </button>
      </div>

      {/* Toolbar */}
      <div className="border-b border-[#1a1a1a] px-6 py-3 flex items-center gap-3 shrink-0">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#444]" />
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-8 bg-[#0f0f0f] border border-[#1a1a1a] text-sm text-white pl-9 pr-4 focus:outline-none focus:border-[#333] transition-colors placeholder:text-[#333]"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-3 w-3 text-[#444]" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(t => t === tag ? "" : tag)}
              className={`tag-pill ${activeTag === tag ? "active" : ""}`}
            >
              #{tag}
            </button>
          ))}
        </div>

        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="ml-auto h-8 bg-[#0f0f0f] border border-[#1a1a1a] text-[#555] text-xs px-3 focus:outline-none focus:border-[#333]"
        >
          <option value="updatedAt">Last edited</option>
          <option value="createdAt">Created</option>
          <option value="title">Title</option>
        </select>
      </div>

      {/* Notes grid */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="grid grid-cols-3 gap-3">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-32 shimmer" />)}
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <FileText className="h-10 w-10 text-[#222]" />
            <div>
              <p className="text-[#444] text-sm">No notes found</p>
              <p className="text-[#333] text-xs mt-1">
                {search || activeTag ? "Try clearing your filters" : "Create your first note"}
              </p>
            </div>
            {!search && !activeTag && (
              <button onClick={createNote} className="flex items-center gap-2 h-8 px-4 bg-white text-black text-xs font-semibold hover:bg-[#e0e0e0]">
                <Plus className="h-3 w-3" /> New Note
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {notes.map((note, i) => (
              <Link
                key={note._id}
                href={`/dashboard/notes/${note._id}`}
                className="border border-[#1a1a1a] bg-[#0d0d0d] p-4 hover:border-[#2a2a2a] hover:bg-[#111] transition-all group animate-fade-in"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-medium text-[#aaa] group-hover:text-white transition-colors line-clamp-2 flex-1">
                    {note.title}
                  </h3>
                  {note.aiSummary && (
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0 mt-1.5 ml-2" title="AI summary available" />
                  )}
                </div>

                {note.aiSummary && (
                  <p className="text-xs text-[#444] line-clamp-2 mb-3">{note.aiSummary}</p>
                )}

                <div className="flex items-center justify-between mt-auto pt-2">
                  <div className="flex gap-1 flex-wrap">
                    {note.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[10px] font-mono text-[#333]">#{tag}</span>
                    ))}
                    {note.tags.length > 2 && (
                      <span className="text-[10px] font-mono text-[#2a2a2a]">+{note.tags.length - 2}</span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-[#2a2a2a]">
                    {format(new Date(note.updatedAt), "MMM d")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
