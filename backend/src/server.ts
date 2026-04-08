import app from "./app.js";
import { env } from "./config/env.js";

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`✓ Server running at http://localhost:${PORT}`);
  console.log(`✓ Environment: ${env.NODE_ENV}`);
  console.log(`✓ CORS Origin: ${env.CORS_ORIGIN}`);
});
