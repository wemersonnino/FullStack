import React from "react"
import { FileQuestion } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

interface EmptyStateProps {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  icon?: React.ReactNode
  className?: string
}

export function EmptyState({
  title = "Nenhum resultado encontrado",
  description = "Ainda não há dados para exibir aqui.",
  actionLabel,
  onAction,
  icon,
  className = "",
}: EmptyStateProps) {
  return (
    <Empty className={className}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          {icon || <FileQuestion />}
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {actionLabel && onAction && (
        <EmptyContent>
          <Button onClick={onAction}>
            {actionLabel}
          </Button>
        </EmptyContent>
      )}
    </Empty>
  )
}
