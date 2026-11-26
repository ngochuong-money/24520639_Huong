import { mkdirSync, writeFileSync } from 'node:fs'
import { cards, photos } from '../server/src/seed/data.js'

const HUE_BY_CATEGORY = { evidence: 210, scenes: 140, documents: 30 }

function escapeXml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function buildSvg({ width, height, hue, label }) {
  const fontSize = Math.round(height / 10)
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${hue} 55% 28%)"/>
      <stop offset="1" stop-color="hsl(${(hue + 40) % 360} 60% 16%)"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <text x="50%" y="50%" fill="#ffffff" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="700" text-anchor="middle" dominant-baseline="middle">${escapeXml(label)}</text>
</svg>
`
}

function writeImage(urlPath, svg) {
  const fileUrl = new URL(`../public${urlPath}`, import.meta.url)
  mkdirSync(new URL('.', fileUrl), { recursive: true })
  writeFileSync(fileUrl, svg, 'utf8')
}

photos.forEach((photo) => {
  writeImage(
    photo.src,
    buildSvg({ width: photo.width, height: photo.height, hue: HUE_BY_CATEGORY[photo.category], label: photo.title }),
  )
})

cards.forEach((card, index) => {
  writeImage(card.imageUrl, buildSvg({ width: 600, height: 800, hue: (index * 36) % 360, label: card.name }))
})

console.log(`Generated ${photos.length + cards.length} placeholder images in public/images.`)
