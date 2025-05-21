import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // Vite config
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Add public directory configuration
    publicDir: "public",
    // Configure static asset handling
    build: {
      assetsDir: "assets",
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, "index.html"),
        },
      },
    },
    // Define env variables to be used in the app
    define: {
      __IPFS_ENABLED__: JSON.stringify(env.VITE_ENABLE_IPFS),
      __LOCAL_STORAGE_ENABLED__: JSON.stringify(env.VITE_ENABLE_LOCAL_STORAGE),
    },
  };
});
