import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageContainer } from '@/components/layout/PageContainer'
import { SetupChecklist } from '@/features/home/SetupChecklist'
import { VideoCarousel } from '@/features/home/VideoCarousel'
import { Composer, ChipsBar } from '@/features/kento-chat/KentoChat'
import { SparkleIcon } from '@/lib/icons'

function KentoHero() {
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [openChip, setOpenChip] = useState<string | null>(null)

  function send() {
    const text = input.trim()
    if (!text) return
    // O chat recebe a mensagem e responde lá
    navigate('/kento-chat', { state: { initialMessage: text } })
  }

  return (
    <section className="flex flex-col items-center gap-6 pt-12">
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm leading-5 text-muted">Bem vindo, Gustavo!</p>
        <h1 className="flex flex-wrap items-center justify-center gap-x-1.5 text-[28px] leading-9 font-bold sm:text-[34px] sm:leading-10">
          <span className="text-ink">Converse com</span>
          <SparkleIcon className="size-7 shrink-0" aria-hidden />
          <span className="bg-gradient-to-r from-cyan-500 via-[#92d7cf] to-cyan-500 bg-clip-text text-transparent">
            Kento
          </span>
        </h1>
      </div>

      <div className="flex w-full max-w-[681px] flex-col items-center gap-6">
        <Composer value={input} onChange={setInput} onSend={send} />
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
    </section>
  )
}

export function HomePage() {
  return (
    <div className="relative">
      <PageContainer className="relative flex flex-col gap-10 pb-12 pt-6 sm:pb-16">
        <KentoHero />
        <SetupChecklist />
        <VideoCarousel />
      </PageContainer>
    </div>
  )
}
