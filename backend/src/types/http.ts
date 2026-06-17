import type { GenerationJob } from "./generation.js";

export interface ApiErrorBody {
  error: {
    message: string;
    details?: unknown;
  };
}

export type JobResponse = GenerationJob & {
  jobId: string;
  state: GenerationJob["status"];
  downloads?: GenerationJob["downloadUrls"];
};
