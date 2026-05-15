import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Note from "@/models/Note"
import { nanoid } from "nanoid"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await connectDB()
    const note = await Note.findOne({ _id: id, userId: session.user.id })
    if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json(note)
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await connectDB()
    const body = await req.json()

    if (body.isPublic !== undefined) {
      const note = await Note.findOne({ _id: id, userId: session.user.id })
      if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 })
      if (body.isPublic && !note.shareId) {
        body.shareId = nanoid(10)
      }
    }

    const updated = await Note.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: { ...body, updatedAt: new Date() } },
      { new: true }
    )

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(updated)
  } catch (err) {
    console.error("[NOTES PATCH]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await connectDB()
    const deleted = await Note.findOneAndDelete({ _id: id, userId: session.user.id })
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
