"use client"
import { useEffect, useState, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Sparkles, Share2, Archive, Trash2, ArrowLeft, Tag, X, Loader2,
  CheckSquare, Copy, RotateCcw, Globe, Lock, ChevronRight
} from "lucide-react"
import { format } from "date-fns"
import { toast } from "@/components/Toaster"

interface Note {
  _id: string
  title: string
  content: string
  tags: string[]
  category: string
  isArchived: boolean
  isPublic: boolean
  shareId: string
  aiSummary: string
  aiActionItems: string[]
  aiSuggestedTitle: string
  aiGeneratedAt: string | null
  updatedAt: string
}

function useAutoSave(note: Note | null, dirty: boolean, onSave: () => void) {
  useEffect(() => {
    if (!dirty || !note) return
    const t = setTimeout(onSave, 1200)
    return () => clearTimeout(t)
  }, [dirty, note?.title, note?.content, note?.tags, note?.category])
}

export default function NoteEditorPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [note, setNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [showShare, setShowShare] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    fetch(`/api/notes/${id}`)
      .then(r => r.json())
      .then(data => { setNote(data); setLoading(false) })
      .catch(() => { toast("Failed to load note", "error"); setLoading(false) })
  }, [id])

  const save = useCallback(async () => {
    if (!note || !dirty) return
    setSaving(true)
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: note.title,
          content: note.content,
          tags: note.tags,
          category: note.category,
        }),
      })
      const updated = await res.json()
      setNote(updated)
      setDirty(false)
    } catch {
      toast("Failed to save", "error")
    }
    setSaving(false)
  }, [note, dirty, id])

  useAutoSave(note, dirty, save)

  function update(patch: Partial<Note>) {
    setNote(prev => prev ? { ...prev, ...patch } : null)
    setDirty(true)
  }

  function addTag(e: React.KeyboardEvent) {
    if (e.key === "Enter" && tagInput.trim()) {
      const t = tagInput.trim().toLowerCase().replace(/\s+/g, "-")
      if (!note!.tags.includes(t)) update({ tags: [...note!.tags, t] })
      setTagInput("")
    }
  }

  function removeTag(tag: string) {
    update({ tags: note!.tags.filter(t => t !== tag) })
  }

  async function generateAI() {
    setAiLoading(true)
    setShowAI(true)
    try {
      const res = await fetch(`/api/notes/${id}/generate-summary`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) { toast(data.error || "AI failed", "error"); return }
      setNote(prev => prev ? {
        ...prev,
        aiSummary: data.summary,
        aiActionItems: data.action_items,
        aiSuggestedTitle: data.suggested_title,
        aiGeneratedAt: new Date().toISOString(),
      } : null)
      toast("AI insights generated", "success")
    } catch {
      toast("AI generation failed", "error")
    }
    setAiLoading(false)
  }

  async function toggleArchive() {
    const res = await fetch(`/api/notes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isArchived: !note!.isArchived }),
    })
    const updated = await res.json()
    setNote(updated)
    toast(updated.isArchived ? "Note archived" : "Note restored", "success")
  }

  async function togglePublic() {
    const res = await fetch(`/api/notes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublic: !note!.isPublic }),
    })
    const updated = await res.json()
    setNote(updated)
    toast(updated.isPublic ? "Note is now public" : "Note is now private", "success")
  }

  async function deleteNote() {
    if (!confirm("Delete this note permanently?")) return
    await fetch(`/api/notes/${id}`, { method: "DELETE" })
    toast("Note deleted", "success")
    router.push("/dashboard/notes")
  }

  function copyShareLink() {
    const url = `${window.location.origin}/shared/${note!.shareId}`
    navigator.clipboard.writeText(url)
    toast("Share link copied!", "success")
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="h-5 w-5 animate-spin text-[#333]" />
    </div>
  )

  if (!note) return (
    <div className="flex-1 flex items-center justify-center">
      <p className="text-[#444]">Note not found</p>
    </div>
  )

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="h-14 border-b border-[#1a1a1a] flex items-center px-6 gap-3 shrink-0">
          <button onClick={() => router.push("/dashboard/notes")} className="text-[#444] hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="h-4 w-px bg-[#1a1a1a]" />

          <span className="text-[10px] font-mono text-[#333]">
            {saving ? "Saving..." : dirty ? "Unsaved" : note.updatedAt ? `Saved ${format(new Date(note.updatedAt), "HH:mm")}` : ""}
          </span>

          <div className="flex-1" />

          <button
            onClick={generateAI}
            disabled={aiLoading}
            className="flex items-center gap-2 h-8 px-3 border border-purple-800/50 bg-purple-900/20 text-purple-400 text-xs hover:bg-purple-900/30 transition-colors"
          >
            {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
            {aiLoading ? "Thinking..." : "AI Insights"}
          </button>

          <button
            onClick={() => setShowShare(s => !s)}
            className="flex items-center gap-2 h-8 px-3 border border-[#1a1a1a] text-[#555] text-xs hover:text-white hover:border-[#333] transition-colors"
          >
            <Share2 className="h-3 w-3" />
            Share
          </button>

          <button onClick={toggleArchive} className="h-8 w-8 flex items-center justify-center text-[#444] hover:text-white border border-[#1a1a1a] hover:border-[#333] transition-colors">
            <Archive className="h-3.5 w-3.5" />
          </button>

          <button onClick={deleteNote} className="h-8 w-8 flex items-center justify-center text-[#444] hover:text-red-400 border border-[#1a1a1a] hover:border-red-800/50 transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8 max-w-3xl mx-auto w-full">
          {/* Title */}
          <input
            ref={titleRef}
            type="text"
            value={note.title}
            onChange={e => update({ title: e.target.value })}
            className="w-full text-2xl font-semibold text-white bg-transparent border-none outline-none placeholder:text-[#333] mb-1"
            placeholder="Untitled Note"
          />

          {/* Category */}
          <div className="flex items-center gap-2 mb-4">
            <input
              type="text"
              value={note.category}
              onChange={e => update({ category: e.target.value })}
              className="text-xs font-mono text-[#444] bg-transparent border-none outline-none placeholder:text-[#2a2a2a] w-auto"
              placeholder="Category"
            />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-6 items-center">
            {note.tags.map(tag => (
              <span key={tag} className="tag-pill group">
                #{tag}
                <button onClick={() => removeTag(tag)} className="text-[#444] hover:text-white ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ))}
            <div className="flex items-center gap-1 tag-pill !cursor-text">
              <Tag className="h-2.5 w-2.5" />
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={addTag}
                placeholder="add tag"
                className="bg-transparent border-none outline-none text-[11px] font-mono text-[#555] placeholder:text-[#333] w-16"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-b border-[#111] mb-6" />

          {/* Note content */}
          <textarea
            ref={contentRef}
            value={note.content}
            onChange={e => update({ content: e.target.value })}
            className="note-editor min-h-[400px]"
            placeholder="Start writing your note...&#10;&#10;Use AI Insights to generate summaries and action items from your content."
          />
        </div>
      </div>

      {/* AI Panel */}
      {showAI && (
        <div className="w-72 border-l border-[#1a1a1a] bg-[#0a0a0a] flex flex-col shrink-0 animate-fade-in">
          <div className="h-14 border-b border-[#1a1a1a] flex items-center px-4 gap-2">
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            <span className="text-xs font-mono text-purple-400 uppercase tracking-wider">AI Insights</span>
            <button onClick={() => setShowAI(false)} className="ml-auto text-[#444] hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-4">
            {aiLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-12 shimmer" />)}
                <p className="text-xs text-[#333] text-center font-mono">Groq is thinking...</p>
              </div>
            ) : note.aiSummary ? (
              <>
                {note.aiSuggestedTitle && (
                  <div className="border border-[#1a1a1a] bg-[#0f0f0f] p-3">
                    <p className="text-[10px] font-mono text-[#444] uppercase tracking-widest mb-2">Suggested Title</p>
                    <p className="text-xs text-[#aaa]">{note.aiSuggestedTitle}</p>
                    <button
                      onClick={() => { update({ title: note.aiSuggestedTitle }); toast("Title applied", "success") }}
                      className="text-[10px] font-mono text-purple-400 hover:text-purple-300 mt-2 flex items-center gap-1"
                    >
                      Apply <ChevronRight className="h-2.5 w-2.5" />
                    </button>
                  </div>
                )}

                <div className="border border-[#1a1a1a] bg-[#0f0f0f] p-3">
                  <p className="text-[10px] font-mono text-[#444] uppercase tracking-widest mb-2">Summary</p>
                  <p className="text-xs text-[#888] leading-relaxed">{note.aiSummary}</p>
                </div>

                {note.aiActionItems?.length > 0 && (
                  <div className="border border-[#1a1a1a] bg-[#0f0f0f] p-3">
                    <p className="text-[10px] font-mono text-[#444] uppercase tracking-widest mb-2">Action Items</p>
                    <ul className="space-y-1.5">
                      {note.aiActionItems.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-[#777]">
                          <CheckSquare className="h-3 w-3 mt-0.5 text-[#333] shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {note.aiGeneratedAt && (
                  <p className="text-[10px] font-mono text-[#2a2a2a] text-center">
                    Generated {format(new Date(note.aiGeneratedAt), "MMM d, HH:mm")}
                  </p>
                )}

                <button onClick={generateAI} className="w-full flex items-center justify-center gap-2 h-8 border border-[#1a1a1a] text-[#444] text-xs hover:text-white hover:border-[#333] transition-colors">
                  <RotateCcw className="h-3 w-3" /> Regenerate
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 gap-3 text-center">
                <Sparkles className="h-8 w-8 text-[#222]" />
                <p className="text-xs text-[#333]">Click "AI Insights" to analyze your note with Groq</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Share Panel */}
      {showShare && (
        <div className="w-72 border-l border-[#1a1a1a] bg-[#0a0a0a] flex flex-col shrink-0 animate-fade-in">
          <div className="h-14 border-b border-[#1a1a1a] flex items-center px-4 gap-2">
            <Share2 className="h-3.5 w-3.5 text-[#888]" />
            <span className="text-xs font-mono text-[#888] uppercase tracking-wider">Share</span>
            <button onClick={() => setShowShare(false)} className="ml-auto text-[#444] hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#aaa]">{note.isPublic ? "Public" : "Private"}</p>
                <p className="text-xs text-[#444] mt-0.5">
                  {note.isPublic ? "Anyone with the link can view" : "Only you can see this"}
                </p>
              </div>
              <button
                onClick={togglePublic}
                className={`w-10 h-6 relative transition-colors ${note.isPublic ? "bg-white" : "bg-[#1a1a1a] border border-[#333]"}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-black transition-all ${note.isPublic ? "left-5" : "left-1 bg-[#555]"}`} />
              </button>
            </div>

            {note.isPublic && note.shareId && (
              <div className="border border-[#1a1a1a] bg-[#0f0f0f] p-3 space-y-2">
                <p className="text-[10px] font-mono text-[#444] uppercase tracking-widest">Share link</p>
                <p className="text-xs font-mono text-[#666] break-all">
                  {typeof window !== "undefined" ? window.location.origin : ""}/shared/{note.shareId}
                </p>
                <button
                  onClick={copyShareLink}
                  className="flex items-center gap-1.5 text-xs text-[#888] hover:text-white transition-colors"
                >
                  <Copy className="h-3 w-3" /> Copy link
                </button>
              </div>
            )}

            <div className="border border-[#1a1a1a] p-3 flex items-start gap-2">
              {note.isPublic ? <Globe className="h-4 w-4 text-[#555] shrink-0 mt-0.5" /> : <Lock className="h-4 w-4 text-[#333] shrink-0 mt-0.5" />}
              <p className="text-xs text-[#444]">
                {note.isPublic
                  ? "Shared notes show your name, content, tags, and AI summary."
                  : "Toggle public to generate a shareable link."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
