import { app } from "./app";
import { env } from "./config/env";

app.listen(env.port, () => {
  console.log(`KYB Customs API running on port ${env.port}`);
});