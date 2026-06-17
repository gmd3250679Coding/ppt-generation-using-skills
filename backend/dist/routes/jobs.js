import { Router } from "express";
import multer from "multer";
import { JobsController } from "../controllers/JobsController.js";
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 80 * 1024 * 1024,
        files: 4
    }
});
const controller = new JobsController();
export const jobsRouter = Router();
jobsRouter.post("/", upload.any(), (req, res, next) => {
    try {
        controller.create(req, res);
    }
    catch (error) {
        next(error);
    }
});
jobsRouter.get("/:jobId", (req, res) => controller.show(req, res));
