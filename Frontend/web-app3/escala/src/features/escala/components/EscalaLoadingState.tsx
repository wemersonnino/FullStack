export function EscalaLoadingState() {
  return (
    <div className="grid min-h-64 place-items-center rounded-lg border bg-card">
      <div className="space-y-3 text-center">
        <div className="mx-auto size-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Carregando escalas</p>
      </div>
    </div>
  );
}
