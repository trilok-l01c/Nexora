import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
    {
        number: { type: Number, unique: true },
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true,
        },
        projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        subject: { type: String, required: true, trim: true, maxlength: 160 },
        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000,
        },
        priority: {
            type: String,
            enum: ["Low", "Normal", "High", "Urgent"],
            default: "Normal",
        },
        status: {
            type: String,
            enum: ["Open", "In Progress", "Resolved"],
            default: "Open",
        },
    },
    { timestamps: true },
);

// Ticket numbers are allocated from a dedicated counter document and claimed
// with a single atomic `$inc`. The previous "find the highest number, then add
// one" read-then-write was not atomic, so two tickets created at the same
// moment were handed the same number and the insert failed on the unique index.
// `pre("save")` is declared without a `next` parameter so Mongoose awaits the
// returned promise; mixing `async` with `next` risks an unhandled rejection.
ticketSchema.pre("save", async function assignTicketNumber() {
    if (this.number) return;
    const counter = await this.db.collection("counters").findOneAndUpdate(
        { _id: "ticketNumber" },
        { $inc: { seq: 1 } },
        { upsert: true, returnDocument: "after" },
    );
    // A fresh counter starts at 1; seed it past the 1041 the previous
    // implementation used so existing tickets keep their numbers.
    this.number = counter?.seq ?? 1042;
});

export const Ticket = mongoose.model("Ticket", ticketSchema);
