// One-off, NON-DESTRUCTIVE migration: copies older submissions into the
// restored `leads` collection so they appear in the lead inbox.
//
//   node scripts/migrateLegacyLeads.js
//
// Two legacy collections are handled, because the public contact form has been
// backed by two different collections over time:
//
// - `contacts`  — written by the previous Lead/CRM implementation.
// - `enquiries` — written by the lightweight general-enquiry form that briefly
//                 replaced the lead inbox.
//
// Behaviour:
// - Skips documents whose email + message + createdAt already match an existing
//   Lead, so the script is safe to run more than once.
// - Preserves each document's original createdAt so the inbox keeps its
//   chronological order.
// - `enquiries` were never tracked past "new", so they migrate as "new" leads.
// - `contacts` were tracked through the previous lifecycle and keep their own
//   status, EXCEPT `completed`: there it only meant "dealt with", whereas
//   `completed` now means "converted to client". Those rows migrate as
//   `in_progress` with the original status recorded on the timeline, so the
//   team can still take the conversion decision explicitly.
// - NEVER deletes anything. Both legacy collections are left untouched so the
//   migration can be audited or re-run; drop them manually only after verifying
//   the migrated leads.
// - Never creates client accounts, companies, or projects.
import mongoose from "mongoose";
import "../models/Lead.js";
import { connectDatabase } from "../config/database.js";
import { env } from "../config/env.js";

// The legacy model files were removed with the rollback, but the collections and
// their documents remain in MongoDB and must not be touched. `strict: false`
// keeps unknown legacy fields (such as the old attachment metadata) readable
// without needing a schema for them.
const legacySchema = new mongoose.Schema(
    {
        name: String,
        email: String,
        phone: String,
        company: String,
        service: String,
        message: String,
        status: String,
    },
    { timestamps: true, strict: false },
);

const { Lead } = mongoose.models;
const validStatuses = new Set([
    "new",
    "contacted",
    "in_progress",
    "completed",
    "rejected",
]);

const legacySources = [
    {
        collection: "contacts",
        keepStatus: true,
        note: "Migrated from the previous lead inbox.",
    },
    {
        collection: "enquiries",
        keepStatus: false,
        note: "Migrated from the previous general enquiry form.",
    },
];

function legacyModel(collection) {
    const name = `Legacy${collection.charAt(0).toUpperCase()}${collection.slice(1)}`;
    return (
        mongoose.models[name] || mongoose.model(name, legacySchema, collection)
    );
}

async function migrate({ collection, keepStatus, note }) {
    const model = legacyModel(collection);
    const documents = await model.find().lean();
    let created = 0;
    let skipped = 0;

    for (const document of documents) {
        const duplicateQuery = {
            email: document.email,
            message: document.message,
        };
        if (document.createdAt) {
            duplicateQuery.createdAt = document.createdAt;
        }
        if (await Lead.exists(duplicateQuery)) {
            skipped += 1;
            continue;
        }

        let status = "new";
        let entry = note;
        if (keepStatus && validStatuses.has(document.status)) {
            // A legacy `completed` lead was not a converted client, so it stays
            // open for an explicit conversion decision. See the header comment.
            status =
                document.status === "completed"
                    ? "in_progress"
                    : document.status;
            entry = `${note} Previous status: ${document.status}.`;
        }

        await Lead.create({
            name: document.name,
            email: document.email,
            phone: document.phone,
            company: document.company,
            service: document.service || "General enquiry",
            message: document.message,
            source: "website",
            status,
            notes: [{ text: entry, type: "status", authorName: "migration" }],
            createdAt: document.createdAt,
        });
        created += 1;
    }

    return { collection, created, skipped, total: documents.length };
}

async function main() {
    if (!env.mongoUri) {
        console.error("MONGODB_URI is not configured.");
        process.exit(1);
    }
    const connected = await connectDatabase();
    if (!connected) {
        console.error("Could not connect to MongoDB.");
        process.exit(1);
    }

    for (const source of legacySources) {
        const result = await migrate(source);
        console.log(
            `${result.collection}: ${result.created} lead(s) created, ${result.skipped} already migrated, ${result.total} legacy document(s) preserved.`,
        );
    }

    await mongoose.disconnect();
}

main().catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
});
