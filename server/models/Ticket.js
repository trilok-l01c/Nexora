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

ticketSchema.pre("save", async function assignTicketNumber(next) {
    if (this.number) return next();
    const latest = await this.constructor
        .findOne()
        .sort({ number: -1 })
        .select("number")
        .lean();
    this.number = (latest?.number || 1041) + 1;
    next();
});

export const Ticket = mongoose.model("Ticket", ticketSchema);
