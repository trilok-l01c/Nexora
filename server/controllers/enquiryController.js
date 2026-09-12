import { Enquiry } from "../models/Enquiry.js";
import { isDatabaseReady } from "../config/database.js";

export async function createEnquiry(req, res, next) {
    if (!isDatabaseReady()) {
        return res.status(503).json({
            success: false,
            message: "Contact requests are temporarily unavailable.",
        });
    }
    try {
        await Enquiry.create(req.enquiryInput);
        return res.status(201).json({
            success: true,
            message: "Your message has been sent to Nexora.",
        });
    } catch (error) {
        next(error);
    }
}