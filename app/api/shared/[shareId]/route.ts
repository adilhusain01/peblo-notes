import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Note from "@/models/Note"
import User from "@/models/User"

export async function GET(req: Request, { params }: { params: Promise<{ shareId: string }> }) {
  try {
    const { shareId } = await params
    await connectDB()
    const note = await Note.findOne({ shareId, isPublic: true }).lean() as any
    if (!note) return NextResponse.json({ error: "Note not found or not public" }, { status: 404 })

    const user = await User.findById(note.userId).select("name").lean() as any

    return NextResponse.json({
      title: note.title,
      content: note.content,
      tags: note.tags,
      category: note.category,
      aiSummary: note.aiSummary,
      aiActionItems: note.aiActionItems,
      updatedAt: note.updatedAt,
      authorName: user?.name || "Anonymous",
    })
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
