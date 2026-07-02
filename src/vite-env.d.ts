/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly VITE_WORKSPACE_BFF_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
