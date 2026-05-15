import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Note from "@/models/Note"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const q = searchParams.get("q") || ""
    const tag = searchParams.get("tag") || ""
    const category = searchParams.get("category") || ""
    const archived = searchParams.get("archived") === "true"
    const sort = searchParams.get("sort") || "updatedAt"

    const filter: Record<string, unknown> = {
      userId: session.user.id,
      isArchived: archived,
    }

    if (q) filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { content: { $regex: q, $options: "i" } },
    ]
    if (tag) filter.tags = tag
    if (category) filter.category = category

    const notes = await Note.find(filter)
      .sort({ [sort]: -1 })
      .select("-content")
      .lean()

    return NextResponse.json(notes)
  } catch (err) {
    console.error("[NOTES GET]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await connectDB()
    const body = await req.json()

    const note = await Note.create({
      userId: session.user.id,
      title: body.title || "Untitled Note",
      content: body.content || "",
      tags: body.tags || [],
      category: body.category || "General",
    })

    return NextResponse.json(note, { status: 201 })
  } catch (err) {
    console.error("[NOTES POST]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
