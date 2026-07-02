import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { HomePage } from '@/pages/HomePage'
import { KentoChatPage } from '@/pages/KentoChatPage'
import { KentoMcpPage } from '@/pages/KentoMcpPage'
import { TerminalPage } from '@/pages/TerminalPage'
import { ApisPage } from '@/pages/ApisPage'
import { SkillsPage } from '@/pages/SkillsPage'
import { UsersPage } from '@/pages/UsersPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { isOnboardingComplete } from '@/features/onboarding/profile-store'
import { navGroups } from '@/data/navigation'

// Rotas com página própria — excluídas do gerador de stubs.
const explicitPaths = new Set(['/', '/kento-chat', '/kento-mcp', '/terminal', '/apis', '/skills', '/usuarios'])
const stubRoutes = navGroups
  .flatMap((group) => group.items)
  .filter((item) => !explicitPaths.has(item.to))

/**
 * Todo acesso ao link entra pelo onboarding (mock, sem persistência entre
 * visitas): enquanto a qualificação não for concluída na sessão, qualquer
 * rota do shell redireciona para /onboarding. "Avançar" leva à Home.
 */
function OnboardingGate({ children }: { children: ReactNode }) {
  const location = useLocation()
  if (!isOnboardingComplete()) {
    return <Navigate to="/onboarding" replace state={{ from: location.pathname }} />
  }
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="onboarding" element={<OnboardingPage />} />
      <Route
        element={
          <OnboardingGate>
            <AppShell />
          </OnboardingGate>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="kento-chat" element={<KentoChatPage />} />
        <Route path="kento-mcp" element={<KentoMcpPage />} />
        <Route path="terminal" element={<TerminalPage />} />
        <Route path="apis" element={<ApisPage />} />
        <Route path="skills" element={<SkillsPage />} />
        <Route path="usuarios" element={<UsersPage />} />
        {stubRoutes.map((item) => (
          <Route
            key={item.to}
            path={item.to.slice(1)}
            element={<PlaceholderPage title={item.label} />}
          />
        ))}
        <Route path="*" element={<PlaceholderPage title="Página não encontrada" />} />
      </Route>
    </Routes>
  )
}
