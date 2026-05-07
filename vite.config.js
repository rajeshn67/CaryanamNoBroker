import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'

const uploadDirs = [
  path.resolve(__dirname, '../caryanam-broker/uploads'),
  path.resolve(__dirname, '../caryanam-broker/caryanam-broker/uploads'),
]

const imageContentTypes = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

const serveUploadsPlugin = () => ({
  name: 'serve-project-uploads',
  configureServer(server) {
    server.middlewares.use('/uploads', (req, res, next) => {
      const filename = decodeURIComponent((req.url || '').split('?')[0]).replace(/^\/+/, '')
      if (!filename) return next()

      for (const uploadDir of uploadDirs) {
        const filePath = path.resolve(uploadDir, filename)
        if (!filePath.startsWith(uploadDir) || !fs.existsSync(filePath)) continue

        res.setHeader('Content-Type', imageContentTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream')
        fs.createReadStream(filePath).pipe(res)
        return
      }

      next()
    })
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [serveUploadsPlugin(), react(),tailwindcss()],
})
