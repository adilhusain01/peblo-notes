import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Note from "@/models/Note"
import { generateNoteInsights } from "@/lib/groq"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await connectDB()
    const note = await Note.findOne({ _id: id, userId: session.user.id })
    if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 })

    if (!note.content || note.content.trim().length < 10) {
      return NextResponse.json({ error: "Note content too short to summarize" }, { status: 400 })
    }

    const insights = await generateNoteInsights(note.content, note.title)

    const updated = await Note.findByIdAndUpdate(
      id,
      {
        $set: {
          aiSummary: insights.summary,
          aiActionItems: insights.action_items,
          aiSuggestedTitle: insights.suggested_title,
          aiGeneratedAt: new Date(),
        },
      },
      { new: true }
    )

    return NextResponse.json({
      summary: insights.summary,
      action_items: insights.action_items,
      suggested_title: insights.suggested_title,
      note: updated,
    })
  } catch (err) {
    console.error("[GENERATE SUMMARY]", err)
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 })
  }
}
