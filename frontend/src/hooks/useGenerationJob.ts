import { useCallback, useEffect, useRef, useState } from "react";
import {
  createGenerationJob,
  fetchGenerationJob
} from "../services/generationApi";
import type { GenerationJob, GenerationRequest, JobStatus } from "../types/generation";

const TERMINAL_STATUSES = new Set<JobStatus>(["Ready", "Failed"]);

export function useGenerationJob() {
  const [job, setJob] = useState<GenerationJob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const runIdRef = useRef(0);

  useEffect(() => {
    if (!job || TERMINAL_STATUSES.has(job.status)) {
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        setJob(await fetchGenerationJob(job.id));
      } catch (pollError) {
        setError(pollError instanceof Error ? pollError.message : "轮询作业状态失败");
      }
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [job]);

  const submit = useCallback(async (request: GenerationRequest) => {
    runIdRef.current += 1;
    setIsSubmitting(true);
    setError(null);

    try {
      const createdJob = await createGenerationJob(request);
      setJob(createdJob);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "提交生成作业失败");
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const reset = useCallback(() => {
    runIdRef.current += 1;
    setJob(null);
    setError(null);
    setIsSubmitting(false);
  }, []);

  return {
    job,
    isSubmitting,
    error,
    submit,
    reset
  };
}
