import mongoose, { Schema, Document } from "mongoose"
import { nanoid } from "nanoid"

export interface INote extends Document {
  userId: mongoose.Types.ObjectId
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
  aiGeneratedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

const NoteSchema = new Schema<INote>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, default: "Untitled Note", trim: true },
    content: { type: String, default: "" },
    tags: [{ type: String, trim: true, lowercase: true }],
    category: { type: String, default: "General", trim: true },
    isArchived: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: false },
    shareId: { type: String, unique: true, sparse: true },
    aiSummary: { type: String, default: "" },
    aiActionItems: [{ type: String }],
    aiSuggestedTitle: { type: String, default: "" },
    aiGeneratedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

NoteSchema.index({ userId: 1, updatedAt: -1 })
NoteSchema.index({ userId: 1, tags: 1 })

export default mongoose.models.Note || mongoose.model<INote>("Note", NoteSchema)
