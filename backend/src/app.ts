import express from "express";
import cors from "cors";
import path from "node:path";
import { ZodError } from "zod";
import { config } from "./config.js";
import { ensureDir } from "./utils/fs.js";
import { jobsRouter } from "./routes/jobs.js";
import type { ApiErrorBody } from "./types/http.js";

export async function createApp() {
  await Promise.all([ensureDir(config.outputsDir), ensureDir(config.tempDir), ensureDir(config.uploadsDir), ensureDir(config.skillsDir)]);

  const app = express();
  const allowAnyOrigin = config.frontendOrigins.includes("*");
  const localDevOriginPattern = /^https?:\/\/(?:localhost|127(?:\.\d{1,3}){3}|\[::1\]|10(?:\.\d{1,3}){3}|172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2}|192\.168(?:\.\d{1,3}){2})(?::\d+)?$/;

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowAnyOrigin || config.frontendOrigins.includes(origin) || localDevOriginPattern.test(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error(`不允许的前端来源：${origin}`));
      },
      credentials: false
    })
  );
  app.use(express.json({ limit: "4mb" }));
  app.use("/outputs", express.static(path.join(config.projectRoot, "outputs")));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "ppt-skill-workspace-backend" });
  });

  app.use("/api/jobs", jobsRouter);

  app.use((error: unknown, _req: express.Request, res: express.Response<ApiErrorBody>, _next: express.NextFunction) => {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: {
          message: "请求参数校验失败",
          details: error.flatten()
        }
      });
      return;
    }

    const message = error instanceof Error ? error.message : "服务端错误";
    res.status(500).json({ error: { message } });
  });

  return app;
}
