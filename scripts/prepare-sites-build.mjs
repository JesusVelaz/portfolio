import { cp, mkdir, readdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const dist = new URL('../dist/', import.meta.url)
const client = new URL('../dist/client/', import.meta.url)
const server = new URL('../dist/server/', import.meta.url)
const distPath = fileURLToPath(dist)
const clientPath = fileURLToPath(client)

await mkdir(client, { recursive: true })
await mkdir(server, { recursive: true })

for (const entry of await readdir(dist, { withFileTypes: true })) {
  if (entry.name === 'client' || entry.name === 'server' || entry.name === '.openai') continue
  await cp(join(distPath, entry.name), join(clientPath, entry.name), { recursive: true })
}

await writeFile(
  new URL('index.js', server),
  `const worker = {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request)
    if (response.status !== 404) return response

    const url = new URL(request.url)
    if (url.pathname.includes('.')) return response

    return env.ASSETS.fetch(new Request(new URL('/index.html', request.url), request))
  },
}

export default worker
`,
  'utf8'
)
