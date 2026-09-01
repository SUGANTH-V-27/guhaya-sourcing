import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/db.js";

const PORT = env.PORT;

async function startServer() {
  try {
    // Verify PostgreSQL / Supabase connection
    const res: any = await prisma.$queryRaw`SELECT current_database(), current_schema()`;
    const dbInfo = Array.isArray(res) && res[0] ? res[0] : {};
    const dbName = dbInfo.current_database || "postgres";
    const schemaName = dbInfo.current_schema || "public";

    console.log(`✓ Database connected`);
    console.log(`✓ PostgreSQL/Supabase connection successful (${dbName}.${schemaName})`);
  } catch (err: any) {
    console.error(`✗ Database connection error:`, err.message || err);
  }

  app.listen(PORT, () => {
    console.log(`✓ Server running at http://localhost:${PORT}`);
    console.log(`✓ Environment: ${env.NODE_ENV}`);
    console.log(`✓ CORS Origin: ${env.CORS_ORIGIN}`);
  });
}

startServer();
