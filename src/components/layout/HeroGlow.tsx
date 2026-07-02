import { cn } from '@/lib/cn'

/**
 * Fundo do hero da Home — reconstrução em CSS do mesh gradient do Figma
 * (fill SHADER, opacidade 30%): teal dominante, lime no canto superior
 * direito e verde-água à esquerda, desvanecendo para baixo. Os blobs
 * derivam lentamente (animação desligada em prefers-reduced-motion).
 * Vive na raiz do AppShell cobrindo a viewport inteira — sidebar e
 * header usam vidro translúcido para deixá-lo transparecer. Fora da
 * Home ele some com um fade, mantendo a transição de rota suave.
 */
export function HeroGlow({ show }: { show: boolean }) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-x-0 top-0 h-[363px] overflow-hidden transition-opacity duration-500 [mask-image:linear-gradient(to_bottom,black_30%,transparent_100%)]',
        show ? 'opacity-30 dark:opacity-20' : 'opacity-0',
      )}
    >
      <div className="absolute -top-40 left-[-12%] h-[430px] w-[70%] animate-blob-1 rounded-full bg-[#33bcb7] blur-[100px]" />
      {/* bg-accent: lime no light/dark, verde esmeralda no tema areia */}
      <div className="absolute -top-44 right-[-8%] h-[400px] w-[42%] animate-blob-2 rounded-full bg-accent blur-[110px]" />
      <div className="absolute top-2 left-[22%] h-[280px] w-[42%] animate-blob-3 rounded-full bg-[#77ccc9] blur-[90px]" />
    </div>
  )
}
