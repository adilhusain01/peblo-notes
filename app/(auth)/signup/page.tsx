"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, ArrowRight } from "lucide-react"
import { toast } from "@/components/Toaster"

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) { toast(data.error || "Signup failed", "error"); setLoading(false); return }

      await signIn("credentials", { email, password, redirect: false })
      toast("Account created. Welcome!", "success")
      router.push("/dashboard")
    } catch {
      toast("Something went wrong", "error")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="mb-10 text-center">
          <img src="https://internshala-uploads.internshala.com/logo%2Fgnta0paqhbw-70978.png.webp" alt="Logo" className="h-12 w-auto mx-auto mb-6" />
          <h1 className="text-2xl font-semibold text-white mb-1">Create account</h1>
          <p className="text-[#555] text-sm">Start your AI workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: "Name", value: name, set: setName, type: "text", ph: "John Doe" },
            { label: "Email", value: email, set: setEmail, type: "email", ph: "you@example.com" },
            { label: "Password", value: password, set: setPassword, type: "password", ph: "Min. 8 characters" },
          ].map(({ label, value, set, type, ph }) => (
            <div key={label}>
              <label className="block text-xs font-mono text-[#555] uppercase tracking-wider mb-2">{label}</label>
              <input
                type={type}
                value={value}
                onChange={e => set(e.target.value)}
                required
                className="w-full h-10 bg-[#0f0f0f] border border-[#2a2a2a] text-white px-3 text-sm focus:outline-none focus:border-[#555] transition-colors placeholder:text-[#333]"
                placeholder={ph}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-white text-black text-sm font-semibold hover:bg-[#e0e0e0] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Create account <ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>

        <p className="text-center text-[#444] text-sm mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-[#888] hover:text-white transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
