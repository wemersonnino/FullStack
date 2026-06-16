import React from "react"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SuccessStateProps {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function SuccessState({
  title = "Operação concluída com sucesso!",
  description = "A sua solicitação foi processada e salva corretamente.",
  actionLabel,
  onAction,
  className = "",
}: SuccessStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center space-y-4 ${className}`}>
      <div className="rounded-full bg-green-500/10 p-3">
        <CheckCircle2 className="h-8 w-8 text-green-500" />
      </div>
      <div className="space-y-2 max-w-md">
        <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
