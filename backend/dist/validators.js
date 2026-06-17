import { z } from "zod";
const optionalUrlSchema = z.string().trim().optional().default("");
function isHttpUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
    }
    catch {
        return false;
    }
}
export const generationPayloadSchema = z.object({
    skillPackageName: z.string().trim().min(1, "Skill 名称不能为空"),
    apiSettings: z.object({
        provider: z.enum(["openai", "azure-openai", "compatible"]),
        apiKey: z.string().trim().min(1, "API Key 不能为空"),
        endpoint: optionalUrlSchema,
        model: z.string().trim().min(1, "模型不能为空"),
        deployment: z.string().optional().default(""),
        apiVersion: z.string().optional().default("")
    }).superRefine((settings, ctx) => {
        if (settings.endpoint && !isHttpUrl(settings.endpoint)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["endpoint"],
                message: "接口地址必须是完整的 http(s) URL"
            });
        }
        if ((settings.provider === "azure-openai" || settings.provider === "compatible") && !settings.endpoint) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["endpoint"],
                message: settings.provider === "azure-openai"
                    ? "Azure OpenAI 必须填写接口地址，例如 https://your-resource.openai.azure.com"
                    : "OpenAI 兼容接口必须填写 base URL，例如 https://your-compatible-api.example.com/v1"
            });
        }
    }),
    brief: z.object({
        companyName: z.string().optional().default(""),
        topic: z.string().trim().min(1, "演示主题不能为空"),
        audience: z.string().optional().default(""),
        pageCount: z.coerce.number().int().min(4).max(40),
        language: z.string().optional().default("中文"),
        style: z.string().optional().default("企业咨询汇报"),
        tone: z.string().optional().default("专业、清晰、有说服力"),
        materials: z.string().optional().default(""),
        outputFormat: z.enum(["pptx", "html", "pdf"]).default("pptx")
    })
});
