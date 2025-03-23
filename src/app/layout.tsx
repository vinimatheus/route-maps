import './globals.css'
import { ReactNode } from 'react'
import { Toaster } from "@/components/ui/sonner"

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-br">
      <head>
        
      </head>
      <body>{children}
      <Toaster />

      </body>
    </html>
  )
}
