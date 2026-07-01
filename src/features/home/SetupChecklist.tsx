import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'
import { SetupPlayIcon, SetupTerminalIcon, SetupCodeIcon } from '@/lib/icons'
import { setupItems, type SetupIconKind } from '@/data/setup'
import chatgptLogo from '@/assets/brand/chatgpt.svg'
import claudeLogo from '@/assets/brand/claude.svg'
import aiThirdLogo from '@/assets/brand/ai-anthropic.svg'
import excelLogo from '@/assets/brand/excel.svg'

function IconBox({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'flex size-6 shrink-0 items-center justify-center rounded-[6px] border-[1.5px] border-canvas bg-neutral-200',
        className,
      )}
    >
      {children}
    </div>
  )
}

function SetupIcon({ kind }: { kind: SetupIconKind }) {
  if (kind === 'mcp') {
    return (
      <div className="flex shrink-0 items-center">
        <IconBox className="-mr-2">
          <img src={chatgptLogo} alt="" className="size-4" />
        </IconBox>
        <IconBox className="-mr-2">
          <img src={claudeLogo} alt="" className="size-4" />
        </IconBox>
        <IconBox>
          <img src={aiThirdLogo} alt="" className="size-4" />
        </IconBox>
      </div>
    )
  }
  if (kind === 'excel') {
    return (
      <IconBox>
        <img src={excelLogo} alt="" className="size-4" />
      </IconBox>
    )
  }
  if (kind === 'terminal') {
    return (
      <IconBox>
        <SetupTerminalIcon className="size-4 text-brand" aria-hidden />
      </IconBox>
    )
  }
  return (
    <IconBox>
      <SetupCodeIcon className="size-4 text-brand" aria-hidden />
    </IconBox>
  )
}

export function SetupChecklist() {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-base font-bold leading-6 text-ink">Setup inicial</h2>

      <div className="rounded-[16px] border border-line bg-white p-4">
        {setupItems.map((item, i) => (
          <div key={item.to}>
            {i > 0 && <div className="my-4 border-t border-line" />}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <SetupIcon kind={item.icon} />
                <div className="min-w-0">
                  <h3 className="text-sm font-medium leading-6 text-ink">{item.title}</h3>
                  <p className="text-xs leading-4 text-muted">{item.description}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="min-w-0 flex-1 sm:flex-none"
                  leadingIcon={<SetupPlayIcon className="size-4 shrink-0" aria-hidden />}
                >
                  Veja como funciona
                </Button>
                <Button to={item.to} size="sm" className="flex-1 sm:flex-none">
                  {item.cta}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
