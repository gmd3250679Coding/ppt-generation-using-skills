import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

dotenv.config();

const backendDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(backendDir, "..", "..");
const defaultFrontendOrigins = ["http://localhost:5173", "http://localhost:5174", "http://localhost:4173"];
const frontendOrigins = (process.env.FRONTEND_ORIGIN ? process.env.FRONTEND_ORIGIN.split(",") : defaultFrontendOrigins)
  .map((origin) => origin.trim())
  .filter(Boolean);

export const config = {
  port: Number(process.env.PORT ?? 4000),
  publicBaseUrl: process.env.PUBLIC_BASE_URL ?? `http://localhost:${process.env.PORT ?? 4000}`,
  frontendOrigins,
  allowModelFallback: process.env.ALLOW_MODEL_FALLBACK === "true",
  projectRoot,
  skillsDir: path.join(projectRoot, "skills"),
  outputsDir: path.join(projectRoot, "outputs"),
  tempDir: path.join(projectRoot, "temp"),
  uploadsDir: path.join(projectRoot, "backend", "uploads")
};
