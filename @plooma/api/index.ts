import { FileSystemRouter, serve } from "bun";

const FileSystemRouterApi = new FileSystemRouter({
  dir: "./src/",
  style: "nextjs",
  origin: "http://localhost:3000",
  fileExtensions: [".ts", ".tsx", ".js", ".jsx"],
});

const server = serve({
  port: 3001,
  fetch: async (req) => {
    // Handle CORS
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    const match = FileSystemRouterApi.match(req);
    if (!match) {
      return new Response("Not found", { status: 404 });
    }

    try {
      // Dynamically import the module
      const module = await import(match.filePath);
      const method = req.method.toUpperCase();

      // Check if the module has a function matching the HTTP method
      if (typeof module[method] === "function") {
        const handler = module[method] as (
          req: Request
        ) => Promise<Response> | Response;
        const response = await handler(req);

        // Add CORS headers to response
        const headers = new Headers(response.headers);
        headers.set("Access-Control-Allow-Origin", "*");
        headers.set(
          "Access-Control-Allow-Methods",
          "GET, POST, PUT, DELETE, OPTIONS"
        );
        headers.set(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization"
        );

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      } else {
        return new Response(
          JSON.stringify({ error: `Method ${method} not allowed` }),
          {
            status: 405,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }
    } catch (error) {
      console.error("Error handling request:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  },
});

console.log(`🚀 API Server running at ${server.url}`);
