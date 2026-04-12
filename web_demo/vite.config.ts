import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const isGithubActionsBuild = process.env.GITHUB_ACTIONS === 'true'
const configuredBasePath = process.env.VITE_BASE_PATH

// https://vite.dev/config/
export default defineConfig({
  base: configuredBasePath ?? (isGithubActionsBuild && repoName ? `/${repoName}/` : './'),
  plugins: [react()],
})
