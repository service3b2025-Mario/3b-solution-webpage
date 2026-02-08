import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import multer from "multer";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { uploadPDFWithThumbnail } from "../pdfThumbnail.js";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // ============================================
  // SECURITY HARDENING
  // ============================================
  
  // Remove x-powered-by header (hides Express fingerprint)
  app.disable('x-powered-by');
  
  // Security headers middleware (equivalent to helmet defaults)
  app.use((_req, res, next) => {
    // Strict-Transport-Security: enforce HTTPS for 1 year, include subdomains
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    // X-Content-Type-Options: prevent MIME-type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // X-Frame-Options: prevent clickjacking via iframe embedding
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    // Referrer-Policy: only send origin on cross-origin requests
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    // Permissions-Policy: restrict browser features
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
    // X-XSS-Protection: enable XSS filter in older browsers
    res.setHeader('X-XSS-Protection', '1; mode=block');
    // Content-Security-Policy: control resource loading
    res.setHeader('Content-Security-Policy', [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.3bsolution.com https://client.crisp.chat https://www.googletagmanager.com https://www.google-analytics.com https://maps.googleapis.com",
      "style-src 'self' 'unsafe-inline' https://cdn.3bsolution.com https://client.crisp.chat https://fonts.googleapis.com",
      "img-src 'self' data: blob: https: http:",
      "font-src 'self' https://cdn.3bsolution.com https://client.crisp.chat https://fonts.gstatic.com",
      "connect-src 'self' https://cdn.3bsolution.com https://client.crisp.chat wss://client.relay.crisp.chat https://www.google-analytics.com https://api.frankfurter.dev https://maps.googleapis.com https://*.3bsolution.com https://*.r2.dev",
      "frame-src 'self' https://client.crisp.chat https://www.google.com https://maps.google.com https://www.youtube.com https://youtube.com https://player.vimeo.com https://my.matterport.com",
      "media-src 'self' https: blob:",
      "object-src 'none'",
      "base-uri 'self'",
    ].join('; '));
    next();
  });

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  
  // Configure multer for file uploads
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
  
  // PDF upload endpoint with automatic thumbnail generation
  app.post("/api/upload-pdf-with-thumbnail", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      if (req.file.mimetype !== "application/pdf") {
        return res.status(400).json({ error: "Only PDF files are allowed" });
      }
      
      const { fileUrl, thumbnailUrl } = await uploadPDFWithThumbnail(
        req.file.buffer,
        req.file.originalname
      );
      
      res.json({ fileUrl, thumbnailUrl });
    } catch (error) {
      console.error("PDF upload error:", error);
      res.status(500).json({ error: "Failed to upload PDF" });
    }
  });
  
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    
    // Start tour reminder scheduler
    import('../tourReminderScheduler').then(({ startReminderScheduler }) => {
      startReminderScheduler();
    }).catch(err => {
      console.error('[Server] Failed to start reminder scheduler:', err);
    });
  });
}

startServer().catch(console.error);
