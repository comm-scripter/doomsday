#!/usr/bin/env node
// Generates apple-touch-icon.png (180x180) and favicon-32.png (32x32)
// Pure Node.js — no extra dependencies required.

import { deflateSync } from 'zlib'
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')

const BANDS = [
  { min: 0,  max: 25,  r: 22,  g: 163, b: 74  },
  { min: 26, max: 40,  r: 74,  g: 222, b: 128 },
  { min: 41, max: 55,  r: 250, g: 204, b: 21  },
  { min: 56, max: 70,  r: 249, g: 115, b: 22  },
  { min: 71, max: 85,  r: 239, g: 68,  b: 68  },
  { min: 86, max: 100, r: 220, g: 38,  b: 38  },
]

function bandColor(score) {
  return BANDS.find(b => score >= b.min && score <= b.max) ?? BANDS[0]
}

function renderGauge(size) {
  // RGB pixel buffer, pre-filled with background #0f172a
  const px = new Uint8Array(size * size * 3)
  for (let i = 0; i < px.length; i += 3) { px[i] = 15; px[i+1] = 23; px[i+2] = 42 }

  const CX = size * 0.5
  const CY = size * 0.75
  const R  = size * 0.46
  const TRACK_HALF = size * 0.075   // half of track stroke
  const ARC_HALF   = size * 0.055   // half of band stroke
  const NEEDLE_SCORE = 73
  const NEEDLE_ANGLE = Math.PI * (-1 + NEEDLE_SCORE / 100)
  const HUB_R = size * 0.05

  function setRGB(x, y, r, g, b) {
    x = Math.round(x); y = Math.round(y)
    if (x < 0 || x >= size || y < 0 || y >= size) return
    const i = (y * size + x) * 3
    px[i] = r; px[i+1] = g; px[i+2] = b
  }

  function blendRGB(x, y, r, g, b, a) {
    x = Math.round(x); y = Math.round(y)
    if (x < 0 || x >= size || y < 0 || y >= size) return
    const i = (y * size + x) * 3
    px[i]   = Math.round(px[i]   * (1 - a) + r * a)
    px[i+1] = Math.round(px[i+1] * (1 - a) + g * a)
    px[i+2] = Math.round(px[i+2] * (1 - a) + b * a)
  }

  // Render arc via dense angular + radial sampling to avoid gaps
  const ANGULAR_STEPS = size * 30
  const RADIAL_STEPS  = size * 0.3

  for (let s = 0; s <= ANGULAR_STEPS; s++) {
    const score = (s / ANGULAR_STEPS) * 100
    const angle = Math.PI * (-1 + score / 100)
    const c = bandColor(score)
    const cosA = Math.cos(angle), sinA = Math.sin(angle)

    for (let dr = -TRACK_HALF; dr <= TRACK_HALF; dr += 1 / RADIAL_STEPS) {
      const r = R + dr
      const x = CX + r * cosA
      const y = CY + r * sinA
      if (y > CY + 1) continue  // upper semicircle only
      const inArc = Math.abs(dr) <= ARC_HALF
      if (inArc) setRGB(x, y, c.r, c.g, c.b)
      else       setRGB(x, y, 30, 41, 59)
    }
  }

  // Needle
  const nCos = Math.cos(NEEDLE_ANGLE), nSin = Math.sin(NEEDLE_ANGLE)
  const needleLen = R - ARC_HALF - size * 0.03
  const halfW = Math.max(1.5, size * 0.013)

  for (let t = 0; t <= 1; t += 1 / (size * 8)) {
    const nx = CX + t * needleLen * nCos
    const ny = CY + t * needleLen * nSin
    const hw = halfW * (1 - t * 0.4)
    for (let p = -hw; p <= hw; p += 0.5) {
      blendRGB(nx - p * nSin, ny + p * nCos, 239, 68, 68, 1)
    }
  }

  // Hub circle (covers needle base)
  for (let dy = -HUB_R; dy <= HUB_R; dy += 0.5) {
    for (let dx = -HUB_R; dx <= HUB_R; dx += 0.5) {
      const d = Math.sqrt(dx*dx + dy*dy)
      if (d <= HUB_R) {
        const inRing = d >= HUB_R - Math.max(1.5, size * 0.01)
        if (inRing) blendRGB(CX+dx, CY+dy, 239, 68, 68, 0.8)
        else        setRGB(CX+dx, CY+dy, 30, 41, 59)
      }
    }
  }

  return px
}

// CRC32 for PNG chunks
const crcTable = (() => {
  const t = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
    t[i] = c
  }
  return t
})()

function crc32(buf) {
  let c = 0xFFFFFFFF
  for (const b of buf) c = crcTable[(c ^ b) & 0xFF] ^ (c >>> 8)
  return (c ^ 0xFFFFFFFF) >>> 0
}

function pngChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii')
  const lenBuf  = Buffer.alloc(4)
  lenBuf.writeUInt32BE(data.length)
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])))
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf])
}

function encodePNG(size, pixels) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8; ihdr[9] = 2  // 8-bit RGB

  // Scanlines: 1 filter byte (0=None) + RGB pixels per row
  const rows = Buffer.alloc(size * (1 + size * 3))
  for (let y = 0; y < size; y++) {
    rows[y * (1 + size * 3)] = 0
    for (let x = 0; x < size; x++) {
      const src = (y * size + x) * 3
      const dst = y * (1 + size * 3) + 1 + x * 3
      rows[dst] = pixels[src]; rows[dst+1] = pixels[src+1]; rows[dst+2] = pixels[src+2]
    }
  }

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(rows)),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

for (const size of [180, 32]) {
  const label = size === 180 ? 'apple-touch-icon.png' : 'favicon-32.png'
  writeFileSync(join(publicDir, label), encodePNG(size, renderGauge(size)))
  console.log(`✓ ${label} (${size}×${size})`)
}
