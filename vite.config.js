import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    middlewareMode: false,
    hmr: {
      overlay: false // temporarily hide overlay
    }
  },
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      console.log('Request URL:', req.url)
      try {
        decodeURI(req.url)
        next()
      } catch (e) {
        console.error('Malformed URI:', req.url)
        res.statusCode = 400
        res.end('Bad Request: Malformed URI')
      }
    })
  }
})
