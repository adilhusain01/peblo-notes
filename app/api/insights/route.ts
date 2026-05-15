import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import Note from "@/models/Note"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    await connectDB()
    const userId = session.user.id

    // Total notes
    const totalNotes = await Note.countDocuments({ userId, isArchived: false })
    const archivedNotes = await Note.countDocuments({ userId, isArchived: true })
    const aiUsageCount = await Note.countDocuments({ userId, aiGeneratedAt: { $ne: null } })

    // Recently edited
    const recentNotes = await Note.find({ userId, isArchived: false })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select("title updatedAt tags")
      .lean()

    // Most used tags
    const tagAgg = await Note.aggregate([
      { $match: { userId: require("mongoose").Types.ObjectId.createFromHexString(userId), isArchived: false } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ])

    // Weekly activity - notes created/updated in last 7 days
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const weeklyActivity = await Note.aggregate([
      {
        $match: {
          userId: require("mongoose").Types.ObjectId.createFromHexString(userId),
          updatedAt: { $gte: weekAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    // Fill in missing days
    const activityMap: Record<string, number> = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const key = d.toISOString().split("T")[0]
      activityMap[key] = 0
    }
    weeklyActivity.forEach((a) => { activityMap[a._id] = a.count })

    return NextResponse.json({
      totalNotes,
      archivedNotes,
      aiUsageCount,
      recentNotes,
      topTags: tagAgg.map((t) => ({ tag: t._id, count: t.count })),
      weeklyActivity: Object.entries(activityMap).map(([date, count]) => ({ date, count })),
    })
  } catch (err) {
    console.error("[INSIGHTS]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
