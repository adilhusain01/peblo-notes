import { notFound } from "next/navigation"
import { format } from "date-fns"
import { CheckSquare, Globe } from "lucide-react"
import connectDB from "@/lib/mongodb"
import Note from "@/models/Note"
import User from "@/models/User"

interface SharedPageProps {
  params: { shareId: string }
}

export default async function SharedNotePage({ params }: SharedPageProps) {
  await connectDB()
  const { shareId } = await params
  const note = await Note.findOne({ shareId, isPublic: true }).lean() as any
  if (!note) notFound()

  const user = await User.findById(note.userId).select("name").lean() as any

  return (
    <div className="min-h-screen bg-[#080808] grid-bg flex flex-col">
      {/* Top bar */}
      <div className="border-b border-[#1a1a1a] bg-[#080808]/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <img src="https://internshala-uploads.internshala.com/logo%2Fgnta0paqhbw-70978.png.webp" alt="Logo" className="h-8 w-auto" />
          <div className="flex items-center gap-2 text-[10px] font-mono text-[#999]">
            <Globe className="h-3 w-3" />
            Public note
          </div>
        </div>
      </div>

      {/* Note content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Metadata */}
        <div className="flex items-center gap-3 mb-6 text-xs font-mono text-[#999]">
          <span>{note.authorName || "Anonymous"}</span>
          <span className="text-[#777]">·</span>
          <span>{format(new Date(note.updatedAt), "MMMM d, yyyy")}</span>
          {note.category && (
            <>
              <span className="text-[#777]">·</span>
              <span>{note.category}</span>
            </>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl font-semibold text-white mb-4 leading-tight">{note.title}</h1>

        {/* Tags */}
        {note.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-8">
            {note.tags.map((tag: string) => (
              <span key={tag} className="tag-pill">#{tag}</span>
            ))}
          </div>
        )}

        {/* AI Summary block */}
        {note.aiSummary && (
          <div className="border border-purple-500/40 bg-purple-500/15 p-4 mb-8">
            <p className="text-[10px] font-mono text-purple-200 uppercase tracking-widest mb-2">✦ AI Summary</p>
            <p className="text-sm text-[#ccc] leading-relaxed">{note.aiSummary}</p>

            {note.aiActionItems?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-purple-500/30">
                <p className="text-[10px] font-mono text-purple-200/90 uppercase tracking-widest mb-2">Action Items</p>
                <ul className="space-y-1">
                  {note.aiActionItems.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[#aaa]">
                      <CheckSquare className="h-3 w-3 mt-0.5 text-purple-300 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="border-b border-[#111] mb-8" />

        {/* Content */}
        <div className="prose prose-invert max-w-none">
          <pre className="text-sm text-[#888] leading-relaxed whitespace-pre-wrap font-sans">{note.content}</pre>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#333] mt-auto bg-[#080808]/80 backdrop-blur">
        <div className="max-w-2xl mx-auto px-6 py-6 flex items-center justify-between">
          <span className="text-[10px] font-mono text-[#777]">Shared via Peblo Notes</span>
          <a href="/signup" className="text-[10px] font-mono text-[#999] hover:text-white transition-colors">
            Create your own workspace →
          </a>
        </div>
      </div>
    </div>
  )
}
