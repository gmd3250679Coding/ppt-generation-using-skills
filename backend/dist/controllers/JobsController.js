import { generationPayloadSchema } from "../validators.js";
import { jobService } from "../services/jobServiceSingleton.js";
function asJobResponse(job) {
    return {
        ...job,
        jobId: job.id,
        state: job.status,
        downloads: job.downloadUrls
    };
}
function getUploadedFile(req, fieldName) {
    const files = req.files;
    if (!Array.isArray(files)) {
        return undefined;
    }
    return files.find((file) => file.fieldname === fieldName);
}
function getPayloadText(req) {
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
    create(req, res) {
        const payloadText = getPayloadText(req);
        const payload = generationPayloadSchema.parse(JSON.parse(payloadText));
        const skillFile = getUploadedFile(req, "skill");
        const uploadedSkill = skillFile
            ? {
                originalname: skillFile.originalname,
                mimetype: skillFile.mimetype,
                buffer: skillFile.buffer
            }
            : undefined;
        const job = jobService.createJob(payload, uploadedSkill);
        res.status(202).json(asJobResponse(job));
    }
    show(req, res) {
        const job = jobService.getJob(String(req.params.jobId));
        if (!job) {
            res.status(404).json({ error: { message: "作业不存在" } });
            return;
        }
        res.json(asJobResponse(job));
    }
}
