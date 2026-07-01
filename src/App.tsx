import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { HomePage } from '@/pages/HomePage'
import { KentoChatPage } from '@/pages/KentoChatPage'
import { KentoMcpPage } from '@/pages/KentoMcpPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'
import { navGroups } from '@/data/navigation'

// Rotas com página própria — excluídas do gerador de stubs.
const explicitPaths = new Set(['/', '/kento-chat', '/kento-mcp'])
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
