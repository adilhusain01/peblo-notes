import type { Metadata } from "next"
import "./globals.css"
import { SessionProvider } from "./providers"
import { Toaster } from "@/components/Toaster"

export const metadata: Metadata = {
  title: "Peblo Notes — AI-Powered Workspace",
  description: "A collaborative AI notes workspace",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  )
}
