"use client"
import { useEffect, useState } from "react"
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"

export type Toast = {
  id: string
  message: string
  type: "success" | "error" | "info"
}

let toastListeners: ((toasts: Toast[]) => void)[] = []
let toastQueue: Toast[] = []

export function toast(message: string, type: Toast["type"] = "info") {
  const id = Math.random().toString(36).slice(2)
  const newToast: Toast = { id, message, type }
  toastQueue = [...toastQueue, newToast]
  toastListeners.forEach((l) => l([...toastQueue]))
  setTimeout(() => {
    toastQueue = toastQueue.filter((t) => t.id !== id)
    toastListeners.forEach((l) => l([...toastQueue]))
  }, 3500)
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    toastListeners.push(setToasts)
    return () => { toastListeners = toastListeners.filter((l) => l !== setToasts) }
  }, [])

  const icons = { success: CheckCircle, error: AlertCircle, info: Info }
  const colors = {
    success: "border-green-800 text-green-400",
    error: "border-red-800 text-red-400",
    info: "border-[#333] text-[#aaa]",
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => {
        const Icon = icons[t.type]
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 border bg-[#0d0d0d] px-4 py-3 shadow-2xl animate-fade-in min-w-[280px] max-w-[380px] ${colors[t.type]}`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="text-sm text-white flex-1">{t.message}</span>
          </div>
        )
      })}
    </div>
  )
}
