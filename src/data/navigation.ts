import type { IconComponent } from '@/lib/types'
import {
  HomeIcon,
  PlanoIcon,
  SparkleNavIcon,
  KentoMcpIcon,
  PlataformaIcon,
  ExcelIcon,
  TerminalIcon,
  ApisIcon,
  SkillsIcon,
  TutoriaisIcon,
  UsuariosIcon,
  AtendimentoIcon,
  NovidadesIcon,
} from '@/lib/icons'

export interface NavEntry {
  to: string
  label: string
  icon: IconComponent
  showDot?: boolean
  action?: string
  disabled?: boolean
  /** Sub-item indentado sob o item anterior. */
  indent?: boolean
}

export interface NavGroup {
  /** Rótulo da seção (ausente no grupo principal do topo). */
  label?: string
  items: NavEntry[]
}

/** Grupos da sidebar — ordem e estados conforme o design "CENTRAL". */
export const navGroups: NavGroup[] = [
  {
    items: [
      { to: '/', label: 'Home', icon: HomeIcon },
      { to: '/planos', label: 'Plano e Limites', icon: PlanoIcon },
    ],
  },
  {
    label: 'Produtos',
    items: [
      { to: '/kento-chat', label: 'Kento', icon: SparkleNavIcon },
      { to: '/kento-mcp', label: 'Conexões', icon: KentoMcpIcon, indent: true },
      { to: '/terminal', label: 'Terminal Economatica', icon: TerminalIcon, showDot: true },
      { to: '/apis', label: 'APIs Economatica', icon: ApisIcon, showDot: true },
      { to: '/plataforma', label: 'Plataforma', icon: PlataformaIcon, disabled: true },
      { to: '/excel', label: 'Excel Add-in', icon: ExcelIcon, disabled: true, indent: true },
    ],
  },
  {
    label: 'Biblioteca',
    items: [
      { to: '/skills', label: 'Skills e prompts', icon: SkillsIcon },
      { to: '/tutoriais', label: 'Tutoriais MCP', icon: TutoriaisIcon },
    ],
  },
  {
    label: 'Canais',
    items: [
      { to: '/usuarios', label: 'Usuários', icon: UsuariosIcon },
      { to: '/atendimento', label: 'Atendimento', icon: AtendimentoIcon },
      { to: '/novidades', label: 'Novidades', icon: NovidadesIcon, showDot: true },
    ],
  },
]
