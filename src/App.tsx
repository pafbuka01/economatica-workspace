import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { HomePage } from '@/pages/HomePage'
import { KentoChatPage } from '@/pages/KentoChatPage'
import { KentoMcpPage } from '@/pages/KentoMcpPage'
import { TerminalPage } from '@/pages/TerminalPage'
import { ApisPage } from '@/pages/ApisPage'
import { SkillsPage } from '@/pages/SkillsPage'
import { UsersPage } from '@/pages/UsersPage'

// O comparador carrega o snapshot do universo B3 (~480 KB). Fica em chunk
// próprio para não pesar na primeira pintura das demais telas.
const ComparadorPage = lazy(() =>
  import('@/pages/ComparadorPage').then((m) => ({ default: m.ComparadorPage })),
)
import { PlaceholderPage } from '@/pages/PlaceholderPage'
import { navGroups } from '@/data/navigation'

// Rotas com página própria — excluídas do gerador de stubs.
const explicitPaths = new Set(['/', '/kento-chat', '/kento-mcp', '/terminal', '/apis', '/skills', '/usuarios', '/comparador'])
const stubRoutes = navGroups
  .flatMap((group) => group.items)
  .filter((item) => !explicitPaths.has(item.to))

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="kento-chat" element={<KentoChatPage />} />
        <Route path="kento-mcp" element={<KentoMcpPage />} />
        <Route path="terminal" element={<TerminalPage />} />
        <Route path="apis" element={<ApisPage />} />
        <Route path="skills" element={<SkillsPage />} />
        <Route path="usuarios" element={<UsersPage />} />
        <Route
          path="comparador"
          element={
            <Suspense fallback={<div className="px-10 py-6 text-sm text-muted">Carregando base…</div>}>
              <ComparadorPage />
            </Suspense>
          }
        />
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
