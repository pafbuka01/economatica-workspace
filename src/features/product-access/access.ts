/**
 * Atalhos de acesso aos produtos — mesmas URLs e lógica responsiva do
 * LoginModal do site oficial (www.economatica.com).
 *
 * Desktop abre o login em nova aba. Mobile abre o AccessSheet com os
 * estados por produto/sistema (Plataforma é desktop-only; Terminal tem
 * app iOS/Android). A lógica "cliente tem Terminal → vai direto, sem a
 * página intermediária" fica para uma fase futura, com entitlement real.
 */

export type ProductAccess = 'plataforma' | 'terminal'

export const PLATAFORMA_LOGIN_URL = 'https://login.economatica.com/?lang=pt'
export const TERMINAL_WEB_URL = 'https://economatica.tc.com.br'
export const TERMINAL_IOS_STORE_URL = 'https://apps.apple.com/br/app/economatica/id1596790283'
export const TERMINAL_ANDROID_STORE_URL = 'https://play.google.com/store/apps/details?id=br.com.tc.economatica&hl=pt'
export const TERMINAL_IOS_DEEP_LINK = 'br.com.tc.economatica://'
// Android: intent:// abre o app quando instalado (scheme + package) e o
// Chrome cai na Google Play via browser_fallback_url quando não está.
export const TERMINAL_ANDROID_INTENT_URL = `intent://open#Intent;scheme=br.com.tc.economatica;package=br.com.tc.economatica;S.browser_fallback_url=${encodeURIComponent(TERMINAL_ANDROID_STORE_URL)};end`

export function detectDevice() {
  const ua = navigator.userAgent || ''
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const isAndroid = /android/i.test(ua)
  const isMobile =
    isIOS || isAndroid || /Mobi/i.test(ua) ||
    (typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 640px)').matches)
  return { isIOS, isAndroid, isMobile }
}

/**
 * Tenta o acesso direto (desktop). Retorna `false` quando o dispositivo é
 * mobile e o chamador deve abrir o AccessSheet com as opções de app/loja.
 */
export function requestDirectAccess(product: ProductAccess): boolean {
  if (detectDevice().isMobile) return false
  window.open(product === 'plataforma' ? PLATAFORMA_LOGIN_URL : TERMINAL_WEB_URL, '_blank', 'noopener,noreferrer')
  return true
}

/**
 * Mobile não expõe se o app está instalado: tenta abrir (deep link no iOS,
 * intent:// com fallback de loja no Android) e chama `onMissing` se a página
 * continuar visível após uma janela conservadora, sem redirecionar, já que
 * o CTA da loja fica sempre visível no sheet.
 */
export function tryOpenTerminalApp(onMissing: () => void) {
  const { isAndroid, isIOS } = detectDevice()
  let opened = false
  const mark = () => {
    opened = true
  }
  document.addEventListener('visibilitychange', mark, { once: true })
  window.addEventListener('pagehide', mark, { once: true })
  window.addEventListener('blur', mark, { once: true })
  try {
    window.location.href = isAndroid && !isIOS ? TERMINAL_ANDROID_INTENT_URL : TERMINAL_IOS_DEEP_LINK
  } catch {
    /* o CTA da loja segue disponível */
  }
  window.setTimeout(() => {
    document.removeEventListener('visibilitychange', mark)
    window.removeEventListener('pagehide', mark)
    window.removeEventListener('blur', mark)
    if (!opened) onMissing()
  }, 2500)
}
