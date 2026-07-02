import { useEffect, useMemo, useState } from 'react'

import {
  buildLocalRecommendationResponse,
  libraryService,
  type LibraryEventInput,
  type LibraryRecommendationParams,
  type LibraryRecommendationResponse,
} from '@/lib/workspace-bff'

interface LibraryRecommendationsState {
  data: LibraryRecommendationResponse
  loading: boolean
  error: string | null
  recordEvent: (input: LibraryEventInput) => Promise<void>
}

/**
 * Recomendações da Biblioteca filtradas pelo perfil do usuário. Consulta o
 * BFF (userbffapi v4) e cai no motor local com o mesmo catálogo quando o
 * BFF não responde: a UI nunca quebra por indisponibilidade.
 */
export function useLibraryRecommendations(params: LibraryRecommendationParams): LibraryRecommendationsState {
  const [data, setData] = useState<LibraryRecommendationResponse>(() => buildLocalRecommendationResponse(params))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const paramsKey = useMemo(() => JSON.stringify(params), [params])

  useEffect(() => {
    const currentParams = JSON.parse(paramsKey) as LibraryRecommendationParams
    let active = true
    setLoading(true)
    setError(null)

    libraryService
      .getRecommendations(currentParams)
      .then((response) => {
        if (active) setData(response)
      })
      .catch((err: unknown) => {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Erro ao carregar recomendações')
        setData(buildLocalRecommendationResponse(currentParams))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [paramsKey])

  async function recordEvent(input: LibraryEventInput) {
    await libraryService.recordEvent(input)
  }

  return { data, loading, error, recordEvent }
}
