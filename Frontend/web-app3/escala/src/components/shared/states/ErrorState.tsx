import React from "react"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  retryText?: string
  className?: string
}

export function ErrorState({
  title = "Ocorreu um erro",
  message = "Não foi possível carregar os dados. Tente novamente mais tarde.",
  onRetry,
  retryText = "Tentar novamente",
  className = "",
}: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 space-y-4 text-center ${className}`}>
      <div className="rounded-full bg-destructive/10 p-3">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <div className="space-y-2 max-w-md">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="mt-4">
          {retryText}
        </Button>
      )}
    </div>
  )
}
