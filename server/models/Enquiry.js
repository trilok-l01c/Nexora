import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 120 },
        email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
        company: { type: String, trim: true, maxlength: 160 },
        service: { type: String, trim: true, maxlength: 120 },
        message: { type: String, required: true, trim: true, maxlength: 5000 },
    },
    { timestamps: true },
);

export const Enquiry = mongoose.model("Enquiry", enquirySchema);