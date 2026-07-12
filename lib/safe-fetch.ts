import { lookup } from 'node:dns/promises'
import { request as httpRequest, type IncomingMessage } from 'node:http'
import { request as httpsRequest } from 'node:https'
import { isIP } from 'node:net'

const MAX_BYTES = 1_000_000
type ResolvedAddress = { address: string; family: 4 | 6 }

function mappedIpv4(address: string) {
  const value = address.toLowerCase().split('%')[0]
  if (!value.startsWith('::ffff:')) return null
  const suffix = value.slice(7)
  if (isIP(suffix) === 4) return suffix
  const groups = suffix.split(':')
  if (groups.length !== 2 || groups.some(group => !/^[0-9a-f]{1,4}$/.test(group))) return null
  const high = Number.parseInt(groups[0], 16); const low = Number.parseInt(groups[1], 16)
  return `${high >> 8}.${high & 255}.${low >> 8}.${low & 255}`
}

export function isPrivateAddress(rawAddress: string) {
  const address = mappedIpv4(rawAddress) ?? rawAddress.toLowerCase().split('%')[0]
  if (address === '::' || address === '::1' || address.startsWith('fc') || address.startsWith('fd') || address.startsWith('fe80:')) return true
  if (isIP(address) !== 4) return false
  const [a, b] = address.split('.').map(Number)
  return a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) || a >= 224
}

async function resolvePublicUrl(raw: string) {
  const url = new URL(raw)
  if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error('Only HTTP(S) sources are allowed')
  if (url.username || url.password) throw new Error('Credentials in URL are forbidden')
  const addresses = await lookup(url.hostname, { all: true }) as ResolvedAddress[]
  if (!addresses.length || addresses.some(item => isPrivateAddress(item.address))) throw new Error('Private or local network targets are forbidden')
  return { url, addresses }
}

export async function validatePublicUrl(raw: string) { return (await resolvePublicUrl(raw)).url }

function requestOnce(url: URL, addresses: ResolvedAddress[], signal: AbortSignal) {
  return new Promise<IncomingMessage>((resolve, reject) => {
    const selected = addresses[0]
    const request = (url.protocol === 'https:' ? httpsRequest : httpRequest)({
      protocol: url.protocol, hostname: url.hostname, port: url.port || undefined,
      path: `${url.pathname}${url.search}`, method: 'GET', headers: { 'user-agent': 'ZVONA-Research/1.0' },
      lookup: (_hostname, _options, callback) => callback(null, selected.address, selected.family),
    }, response => {
      const peer = response.socket.remoteAddress
      const normalizedPeer = peer ? (mappedIpv4(peer) ?? peer.toLowerCase().split('%')[0]) : ''
      const allowed = addresses.some(item => (mappedIpv4(item.address) ?? item.address.toLowerCase().split('%')[0]) === normalizedPeer)
      if (!peer || isPrivateAddress(peer) || !allowed) {
        response.destroy(new Error('Connected peer did not match validated public DNS address'))
        return
      }
      resolve(response)
    })
    request.on('error', reject)
    signal.addEventListener('abort', () => request.destroy(new Error('Source request timed out')), { once: true })
    request.end()
  })
}

export async function fetchPublicText(raw: string) {
  let current = raw
  for (let redirect = 0; redirect <= 3; redirect++) {
    const { url, addresses } = await resolvePublicUrl(current)
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 10_000)
    try {
      const response = await requestOnce(url, addresses, controller.signal)
      const status = response.statusCode ?? 0
      if (status >= 300 && status < 400) {
        const location = response.headers.location; response.resume()
        if (!location) throw new Error('Invalid redirect')
        current = new URL(location, url).toString()
        continue
      }
      if (status < 200 || status >= 300) { response.resume(); throw new Error(`Source returned ${status}`) }
      const type = String(response.headers['content-type'] ?? '')
      if (!type.includes('text/html') && !type.includes('text/plain')) { response.resume(); throw new Error('Unsupported content type') }
      let size = 0; const chunks: Buffer[] = []
      for await (const value of response) {
        const chunk = Buffer.isBuffer(value) ? value : Buffer.from(value)
        size += chunk.byteLength
        if (size > MAX_BYTES) { response.destroy(); throw new Error('Source exceeds 1 MB') }
        chunks.push(chunk)
      }
      const html = Buffer.concat(chunks).toString('utf8')
      return { url: url.toString(), retrievedAt: new Date().toISOString(), text: html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() }
    } finally { clearTimeout(timer) }
  }
  throw new Error('Too many redirects')
}
