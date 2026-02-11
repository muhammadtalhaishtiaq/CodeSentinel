import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  const requireEnv = (key: string) => {
    const value = env[key];
    if (!value) {
      throw new Error(`Missing ${key} in .env`);
    }
    return value;
  };

  const frontendPort = Number(requireEnv('FRONTEND_PORT'));
  if (Number.isNaN(frontendPort)) {
    throw new Error('FRONTEND_PORT must be a number');
  }

  const backendUrl = requireEnv('BACKEND_URL');
  
  return {
    server: {
      host: "::",
      port: frontendPort,
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    plugins: [
      react(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
