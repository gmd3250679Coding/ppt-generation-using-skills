import type {
  DownloadUrls,
  GenerationJob,
  GenerationRequest,
  JobStatus
} from "../types/generation";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

interface ApiErrorBody {
  error?: {
    message?: string;
    details?: {
      fieldErrors?: Record<string, string[]>;
      formErrors?: string[];
    };
  };
}

type RemoteJobShape = Partial<GenerationJob> & {
  jobId?: string;
  state?: JobStatus;
  downloads?: DownloadUrls;
};

function buildApiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

async function readJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}

async function readApiError(response: Response, fallback: string) {
  try {
    const payload = await readJson<ApiErrorBody>(response);
    const fieldMessages = payload.error?.details?.fieldErrors
      ? Object.values(payload.error.details.fieldErrors).flat()
      : [];
    const detailMessage = [...fieldMessages, ...(payload.error?.details?.formErrors ?? [])].filter(Boolean).join("；");

    return detailMessage || payload.error?.message || fallback;
  } catch {
    return fallback;
  }
}

function normalizeRemoteJob(payload: RemoteJobShape): GenerationJob {
  const now = new Date().toISOString();

  return {
    id: payload.id ?? payload.jobId ?? crypto.randomUUID(),
    status: payload.status ?? payload.state ?? "Created",
    progress: payload.progress ?? 0,
    message: payload.message ?? "作业已创建",
    createdAt: payload.createdAt ?? now,
    updatedAt: payload.updatedAt ?? now,
    previewUrl: payload.previewUrl,
    previewHtml: payload.previewHtml,
    downloadUrls: payload.downloadUrls ?? payload.downloads,
    error: payload.error
  };
}

function buildJobFormData(request: GenerationRequest) {
  const formData = new FormData();
  const { skill, ...payload } = request;

  if (skill.file) {
    formData.append("skill", skill.file);
  }

  formData.append(
    "payload",
    new Blob([JSON.stringify({ ...payload, skillPackageName: skill.packageName })], {
      type: "application/json"
    })
  );

  return formData;
}

export async function createGenerationJob(
  request: GenerationRequest
): Promise<GenerationJob> {
  const response = await fetch(buildApiUrl("/api/jobs"), {
    method: "POST",
    body: buildJobFormData(request)
  });

  if (!response.ok) {
    throw new Error(await readApiError(response, `创建作业失败：${response.status}`));
  }

  return normalizeRemoteJob(await readJson<RemoteJobShape>(response));
}

export async function fetchGenerationJob(jobId: string): Promise<GenerationJob> {
  const response = await fetch(buildApiUrl(`/api/jobs/${jobId}`));

  if (!response.ok) {
    throw new Error(await readApiError(response, `读取作业失败：${response.status}`));
  }

  return normalizeRemoteJob(await readJson<RemoteJobShape>(response));
}
