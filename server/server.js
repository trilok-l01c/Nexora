import app from "./app.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import { ensureAdminUser } from "./services/adminBootstrap.js";

const databaseReady = await connectDatabase();
if (databaseReady) {
    try {
        await ensureAdminUser();
    } catch (error) {
        console.error("Admin account initialization failed:", error.message);
    }
}

const server = app.listen(env.port, () => {
    console.log(`Nexora API listening on port ${env.port}`);
});

function shutDown(signal) {
    console.log(`${signal} received; shutting down.`);
    server.close(() => process.exit(0));
}

process.on("SIGINT", () => shutDown("SIGINT"));
process.on("SIGTERM", () => shutDown("SIGTERM"));
