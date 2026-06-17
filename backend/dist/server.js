import { createApp } from "./app.js";
import { config } from "./config.js";
const app = await createApp();
app.listen(config.port, () => {
    console.log(`PPT Skill backend listening on ${config.publicBaseUrl}`);
});
