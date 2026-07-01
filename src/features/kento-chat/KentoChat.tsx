import { useState } from 'react'
import { X, ChevronRight } from 'lucide-react'
import type { IconComponent } from '@/lib/types'
import { cn } from '@/lib/cn'
import { BarChart } from './BarChart'
import {
  chipSuggestions,
  buildMockReply,
  type ChatMessage,
  type ChartData,
} from '@/data/chat'
import {
  SparkleIcon,
  InputPlusIcon,
  InputChevronIcon,
  InputMicIcon,
  InputSendIcon,
  InputProgressIcon,
  ChipCriarIcon,
  ChipAnalisarIcon,
  ChipNoticiasIcon,
  ChipSentimentoIcon,
  ChipSugestoesIcon,
} from '@/lib/icons'

const chips: { label: string; Icon: IconComponent }[] = [
  { label: 'Criar', Icon: ChipCriarIcon },
  { label: 'Analisar', Icon: ChipAnalisarIcon },
  { label: 'Notícias', Icon: ChipNoticiasIcon },
  { label: 'Sentimento', Icon: ChipSentimentoIcon },
  { label: 'Sugestões do Kento', Icon: ChipSugestoesIcon },
]

/* ------------------------------- Composer ------------------------------- */

interface ComposerProps {
  value: string
  onChange: (v: string) => void
  onSend: () => void
}

function Composer({ value, onChange, onSend }: ComposerProps) {
  return (
    <div className="flex w-full flex-col gap-4 rounded-[12px] border border-line bg-white p-4 shadow-card-xl">
      <div className="flex items-center gap-2">
        <SparkleIcon className="size-5 shrink-0" aria-hidden />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSend()
          }}
          placeholder="Peça ao Kento uma análise, um screener ou uma consulta à base Economatica"
          className="min-w-0 flex-1 bg-transparent text-sm leading-6 text-ink outline-none placeholder:text-muted"
        />
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            aria-label="Adicionar anexo"
            className="flex size-8 shrink-0 items-center justify-center rounded-[4px] bg-elevated text-muted transition-colors hover:bg-neutral-300"
          >
            <InputPlusIcon className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            className="flex items-center gap-1 text-sm leading-5 text-muted transition-colors hover:text-ink"
          >
            <span>Sonnet 4.1</span>
            <InputChevronIcon className="size-4 shrink-0" aria-hidden />
          </button>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <InputProgressIcon className="size-6 shrink-0" aria-hidden />
          <button
            type="button"
            aria-label="Gravar áudio"
            className="text-muted transition-colors hover:text-ink"
          >
            <InputMicIcon className="size-6 shrink-0" aria-hidden />
          </button>
          <button
            type="button"
            onClick={onSend}
            aria-label="Enviar"
            className="flex size-8 shrink-0 items-center justify-center rounded-[4px] bg-accent text-ink transition-colors hover:bg-accent/85"
          >
            <InputSendIcon className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------- Chips / Popover ------------------------------- */

interface ChipsBarProps {
  openChip: string | null
  setOpenChip: (c: string | null) => void
  onPickSuggestion: (s: string) => void
  align: 'center' | 'start'
}

function ChipsBar({ openChip, setOpenChip, onPickSuggestion, align }: ChipsBarProps) {
  if (openChip) {
    const chip = chips.find((c) => c.label === openChip) ?? chips[0]
    const ChipIcon = chip.Icon
    return (
      <div className="w-full overflow-hidden rounded-[12px] border border-line bg-white shadow-card-xl">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <span className="flex items-center gap-2 text-sm font-medium text-ink">
            <ChipIcon className="size-4 shrink-0" aria-hidden />
            {chip.label}
          </span>
          <button
            type="button"
            aria-label="Fechar sugestões"
            onClick={() => setOpenChip(null)}
            className="text-muted transition-colors hover:text-ink"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
        <ul>
          {chipSuggestions.map((s, i) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => onPickSuggestion(s)}
                className={cn(
                  'w-full px-4 py-3 text-left text-sm leading-5 text-muted transition-colors hover:bg-neutral-100',
                  i < chipSuggestions.length - 1 && 'border-b border-line',
                )}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2',
        align === 'center' ? 'justify-center' : 'justify-start',
      )}
    >
      {chips.map(({ label, Icon }) => (
        <button
          key={label}
          type="button"
          onClick={() => setOpenChip(label)}
          className="flex items-center gap-1.5 rounded-[8px] bg-elevated p-[9px] text-sm leading-5 text-muted transition-colors hover:bg-neutral-300"
        >
          <Icon className="size-4 shrink-0" aria-hidden />
          <span className="whitespace-nowrap">{label}</span>
        </button>
      ))}
    </div>
  )
}

/* ------------------------------- Mensagens ------------------------------- */

function DataBlock({ chart }: { chart: ChartData }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="flex items-center gap-1.5 text-sm leading-5">
        <SparkleIcon className="size-4 shrink-0" aria-hidden />
        <span className="text-muted">Dados usados de</span>
        <button
          type="button"
          className="inline-flex items-center gap-0.5 font-medium text-teal-500 transition-colors hover:text-teal-400"
        >
          {chart.source}
          <ChevronRight className="size-3.5" aria-hidden />
        </button>
      </p>
      <h3 className="text-sm font-bold leading-6 text-ink">{chart.title}</h3>
      <BarChart data={chart} />
      <p className="text-sm leading-5 text-muted">{chart.caption}</p>
    </div>
  )
}

function Message({ message }: { message: ChatMessage }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-[12px] bg-elevated px-4 py-2.5 text-sm leading-6 text-ink">
          {message.paragraphs.join(' ')}
        </div>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-4">
      {message.paragraphs.map((p, i) => (
        <p key={i} className="text-sm leading-6 text-ink">
          {p}
        </p>
      ))}
      {message.chart && <DataBlock chart={message.chart} />}
    </div>
  )
}

/* ------------------------------- KentoChat ------------------------------- */

export function KentoChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [openChip, setOpenChip] = useState<string | null>(null)

  const isEmpty = messages.length === 0

  function send() {
    const text = input.trim()
    if (!text) return
    setMessages((prev) => [...prev, { role: 'user', paragraphs: [text] }, buildMockReply()])
    setInput('')
    setOpenChip(null)
  }

  const composer = <Composer value={input} onChange={setInput} onSend={send} />

  // Estado vazio: hero centralizado.
  if (isEmpty) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center px-4 py-12 sm:px-8">
        <div className="flex w-full max-w-[681px] flex-col items-center gap-6">
          <h1 className="flex flex-wrap items-center justify-center gap-x-1.5 text-[28px] leading-9 font-bold sm:text-[34px] sm:leading-10">
            <span className="text-teal-950">Converse com</span>
            <SparkleIcon className="size-7 shrink-0" aria-hidden />
            <span className="bg-gradient-to-r from-cyan-500 via-[#92d7cf] to-cyan-500 bg-clip-text text-transparent">
              Kento
            </span>
          </h1>
          {composer}
          <ChipsBar
            openChip={openChip}
            setOpenChip={setOpenChip}
            onPickSuggestion={(s) => {
              setInput(s)
              setOpenChip(null)
            }}
            align="center"
          />
        </div>
      </div>
    )
  }

  // Estado com conversa: mensagens roláveis + input fixo no rodapé.
  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 sm:px-8">
        <div className="mx-auto flex max-w-[680px] flex-col gap-6 py-6">
          {messages.map((m, i) => (
            <Message key={i} message={m} />
          ))}
        </div>
      </div>
      <div className="shrink-0 px-4 pb-4 sm:px-8">
        <div className="mx-auto flex max-w-[680px] flex-col gap-3">
          <ChipsBar
            openChip={openChip}
            setOpenChip={setOpenChip}
            onPickSuggestion={(s) => {
              setInput(s)
              setOpenChip(null)
            }}
            align="start"
          />
          {composer}
        </div>
      </div>
    </div>
  )
}
