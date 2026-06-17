import type { Request, Response } from "express";
import type { JobResponse } from "../types/http.js";
import { generationPayloadSchema } from "../validators.js";
import { jobService } from "../services/jobServiceSingleton.js";
import type { UploadedSkillFile } from "../skill-loader/SkillLoader.js";

function asJobResponse(job: NonNullable<ReturnType<typeof jobService.getJob>>): JobResponse {
  return {
    ...job,
    jobId: job.id,
    state: job.status,
    downloads: job.downloadUrls
  };
}

function getUploadedFile(req: Request, fieldName: string) {
  const files = req.files;

  if (!Array.isArray(files)) {
    return undefined;
  }

  return files.find((file) => file.fieldname === fieldName);
}

function getPayloadText(req: Request) {
  const bodyPayload = typeof req.body?.payload === "string" ? req.body.payload : undefined;

  if (bodyPayload) {
    return bodyPayload;
  }

  const payloadFile = getUploadedFile(req, "payload");

  if (payloadFile) {
    return payloadFile.buffer.toString("utf8");
  }

  throw new Error("缺少 payload 字段");
}

export class JobsController {
  create(req: Request, res: Response) {
    const payloadText = getPayloadText(req);
    const payload = generationPayloadSchema.parse(JSON.parse(payloadText));
    const skillFile = getUploadedFile(req, "skill");
    const uploadedSkill: UploadedSkillFile | undefined = skillFile
      ? {
          originalname: skillFile.originalname,
          mimetype: skillFile.mimetype,
          buffer: skillFile.buffer
        }
      : undefined;
    const job = jobService.createJob(payload, uploadedSkill);

    res.status(202).json(asJobResponse(job));
  }

  show(req: Request, res: Response) {
    const job = jobService.getJob(String(req.params.jobId));

    if (!job) {
      res.status(404).json({ error: { message: "作业不存在" } });
      return;
    }

    res.json(asJobResponse(job));
  }
}
