import { SetupChecklist } from '@/features/home/SetupChecklist'
import { VideoCarousel } from '@/features/home/VideoCarousel'
import { PageContainer } from '@/components/layout/PageContainer'

export function HomePage() {
  return (
    <PageContainer className="flex flex-col gap-10 pb-12 pt-6 sm:pb-16">
      <header>
        <h1 className="text-[22px] font-bold leading-6 text-ink">Bem vindo, Pedro</h1>
        <p className="mt-1.5 text-sm leading-6 text-muted">
          Siga os passos para usar todo o poder do ecossistema Economatica.
        </p>
      </header>

      <SetupChecklist />
      <VideoCarousel />
    </PageContainer>
  )
}
