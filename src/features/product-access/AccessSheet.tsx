import { useState } from 'react'
import { Copy, Check, ExternalLink } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import {
  detectDevice,
  tryOpenTerminalApp,
  PLATAFORMA_LOGIN_URL,
  TERMINAL_ANDROID_STORE_URL,
  TERMINAL_IOS_STORE_URL,
  type ProductAccess,
} from './access'

const primaryButton =
  'inline-flex h-10 w-full items-center justify-center gap-2 rounded-[6px] bg-accent px-3 text-sm font-medium text-on-accent transition duration-150 hover:bg-accent/85 active:scale-[0.98]'
const secondaryButton =
  'inline-flex h-10 w-full items-center justify-center gap-2 rounded-[6px] bg-neutral-200 px-3 text-sm font-medium text-ink transition duration-150 hover:bg-neutral-300 active:scale-[0.98]'

/**
 * Estados mobile dos atalhos de acesso — mesma copy do LoginModal do site
 * oficial: Plataforma é desktop-only (com Copiar link); Terminal tenta o
 * app e mantém o CTA da loja sempre visível para o cenário sem app.
 */
export function AccessSheet({ product, onClose }: { product: ProductAccess; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const [appMissing, setAppMissing] = useState(false)
  const { isAndroid, isIOS } = detectDevice()
  const androidFlow = isAndroid && !isIOS

  function copyPlataformaLink() {
    navigator.clipboard?.writeText(PLATAFORMA_LOGIN_URL)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <Modal onClose={onClose} ariaLabel={product === 'plataforma' ? 'Acesso à Plataforma Economatica' : 'Acesso ao Terminal Economatica'} className="max-w-[420px]">
      <div className="flex flex-col gap-3">
        {product === 'plataforma' ? (
          <>
            <div className="flex flex-col gap-1">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-nav-label">Plataforma web</p>
              <h2 className="text-lg font-bold leading-6 text-ink">Acesso disponível apenas em desktop.</h2>
              <p className="text-sm leading-5 text-muted">Continue depois pelo seu computador.</p>
            </div>
            <button type="button" onClick={copyPlataformaLink} className={primaryButton}>
              {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
              {copied ? 'Link copiado' : 'Copiar link'}
            </button>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-nav-label">Tempo real</p>
              <h2 className="text-lg font-bold leading-6 text-ink">Economatica Terminal</h2>
              <p className="text-sm leading-5 text-muted">
                {appMissing
                  ? 'Não encontramos o app instalado. Baixe na loja para continuar.'
                  : androidFlow
                    ? 'Abra no app ou baixe na Google Play.'
                    : 'Abra no app ou baixe na App Store.'}
              </p>
            </div>
            <button type="button" onClick={() => tryOpenTerminalApp(() => setAppMissing(true))} className={primaryButton}>
              <ExternalLink className="size-4" aria-hidden />
              Abrir no app
            </button>
            <a
              href={androidFlow ? TERMINAL_ANDROID_STORE_URL : TERMINAL_IOS_STORE_URL}
              rel="noopener noreferrer"
              target="_blank"
              className={secondaryButton}
            >
              {androidFlow ? 'Baixar na Google Play' : 'Baixar na App Store'}
            </a>
          </>
        )}
        <button
          type="button"
          onClick={onClose}
          className="self-center px-2 py-1 text-[12.5px] font-medium text-muted transition-colors hover:text-ink"
        >
          Fechar
        </button>
      </div>
    </Modal>
  )
}
