import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 160 },
        slug: { type: String, required: true, unique: true, trim: true },
    },
    { timestamps: true },
);

export const Company = mongoose.model("Company", companySchema);
