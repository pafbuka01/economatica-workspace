/** Stub para rotas ainda não implementadas — mantém a navegação funcional. */
export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-2 px-8 py-24 text-center">
      <h1 className="text-2xl font-bold text-ink">{title}</h1>
      <p className="text-sm text-muted">Esta seção será construída em breve.</p>
    </div>
  )
}
