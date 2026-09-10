import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Config estándar. Al desplegar en Vercel: framework "Vite", build "npm run build", output "dist".
export default defineConfig({
  plugins: [react()],
});
