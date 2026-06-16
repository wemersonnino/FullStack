import React from "react"
import { Loader2 } from "lucide-react"

interface LoadingStateProps {
  text?: string
  className?: string
}

export function LoadingState({ text = "Carregando...", className = "" }: LoadingStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 space-y-4 ${className}`}>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  )
}
