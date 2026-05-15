"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, ArrowRight } from "lucide-react"
import { toast } from "@/components/Toaster"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await signIn("credentials", { email, password, redirect: false })
    setLoading(false)
    if (res?.ok) {
      toast("Welcome back.", "success")
      router.push("/dashboard")
    } else {
      toast("Invalid credentials.", "error")
    }
  }

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="mb-10 text-center">
          <img src="https://internshala-uploads.internshala.com/logo%2Fgnta0paqhbw-70978.png.webp" alt="Logo" className="h-12 w-auto mx-auto mb-6" />
          <h1 className="text-2xl font-semibold text-white mb-1">Sign in</h1>
          <p className="text-[#555] text-sm">Access your workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-[#555] uppercase tracking-wider mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full h-10 bg-[#0f0f0f] border border-[#2a2a2a] text-white px-3 text-sm focus:outline-none focus:border-[#555] transition-colors placeholder:text-[#333]"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-[#555] uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full h-10 bg-[#0f0f0f] border border-[#2a2a2a] text-white px-3 text-sm focus:outline-none focus:border-[#555] transition-colors placeholder:text-[#333]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-white text-black text-sm font-semibold hover:bg-[#e0e0e0] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign in <ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>

        <p className="text-center text-[#444] text-sm mt-6">
          No account?{" "}
          <Link href="/signup" className="text-[#888] hover:text-white transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
