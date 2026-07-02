import avatarGustavo from '@/assets/avatar.png'
import avatarRafael from '@/assets/avatars/rafael.png'
import avatarCamila from '@/assets/avatars/camila.png'
import avatarBruno from '@/assets/avatars/bruno.png'
import avatarLeonardo from '@/assets/avatars/leonardo.png'

export type TeamRole = 'Admin' | 'Membro'

export interface TeamRow {
  id: string
  name: string
  email: string
  role: TeamRole
  avatar?: string
  /** Data de entrada — apenas membros ativos */
  since?: string
  isYou?: boolean
  pending?: boolean
}

export const PLAN_LABEL = 'Plano Enterprise Plus'
export const PLAN_SEATS = 6

export const teamMembers: TeamRow[] = [
  {
    id: 'gustavo',
    name: 'Gustavo Figueira',
    email: 'gustavo.figueira@economatica.com.br',
    role: 'Admin',
    avatar: avatarGustavo,
    since: '14/10/2022',
    isYou: true,
  },
  {
    id: 'rafael',
    name: 'Rafael Andrade Moreira',
    email: 'rafael.moreira@economatica.com.br',
    role: 'Membro',
    avatar: avatarRafael,
    since: '14/10/2022',
  },
  {
    id: 'camila',
    name: 'Camila Figueiredo Nogueira',
    email: 'camila.nogueira@economatica.com.br',
    role: 'Membro',
    avatar: avatarCamila,
    since: '14/10/2022',
  },
  {
    id: 'bruno',
    name: 'Bruno Carvalho Tavares',
    email: 'bruno.carvalho@economatica.com.br',
    role: 'Membro',
    avatar: avatarBruno,
    since: '14/10/2022',
  },
]

export const pendingInvites: TeamRow[] = [
  {
    id: 'leonardo',
    name: 'Leonardo Pacheco Vasconcelos',
    email: 'leonardo.pacheco@economatica.com.br',
    role: 'Membro',
    avatar: avatarLeonardo,
    pending: true,
  },
]
