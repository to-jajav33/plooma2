import { serve } from "bun";
import { existsSync } from "fs";
import { join } from "path";
import index from "./index.html";

const publicDir = join(import.meta.dir, "../public");

// Helper to serve static files
async function serveStaticFile(path: string): Promise<Response | null> {
  try {
    const filePath = join(publicDir, path);
    if (existsSync(filePath)) {
      const file = Bun.file(filePath);
      return new Response(file);
    }
  } catch (error) {
    console.error(`Error serving static file ${path}:`, error);
  }
  return null;
}

const server = serve({
  routes: {
    // Serve manifest.json
    "/manifest.json": async () => {
      const manifest = await serveStaticFile("manifest.json");
      if (manifest) {
        return new Response(manifest.body, {
          headers: { "Content-Type": "application/manifest+json" },
        });
      }
      return new Response("Not found", { status: 404 });
    },

    // Serve service worker
    "/sw.js": async () => {
      const sw = await serveStaticFile("sw.js");
      if (sw) {
        return new Response(sw.body, {
          headers: { "Content-Type": "application/javascript" },
        });
      }
      return new Response("Not found", { status: 404 });
    },

    // Serve icons
    "/icon-192.png": async () => {
      const icon = await serveStaticFile("icon-192.png");
      if (icon) return icon;
      return new Response("Not found", { status: 404 });
    },

    "/icon-512.png": async () => {
      const icon = await serveStaticFile("icon-512.png");
      if (icon) return icon;
      return new Response("Not found", { status: 404 });
    },

    "/api/hello": {
      async GET(req) {
        return Response.json({
          message: "Hello, world!",
          method: "GET",
        });
      },
      async PUT(req) {
        return Response.json({
          message: "Hello, world!",
          method: "PUT",
        });
      },
    },

    "/api/hello/:name": async req => {
      const name = req.params.name;
      return Response.json({
        message: `Hello, ${name}!`,
      });
    },

    // Serve index.html for all unmatched routes (SPA fallback)
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
