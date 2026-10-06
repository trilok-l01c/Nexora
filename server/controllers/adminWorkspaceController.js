import mongoose from "mongoose";
import { isDatabaseReady } from "../config/database.js";
import { Company } from "../models/Company.js";
import { Project } from "../models/Project.js";
import { Ticket } from "../models/Ticket.js";
import { User } from "../models/User.js";

// Read-mostly admin views that back the Queries/Support and Clients tabs.
//
// These handlers are strictly additive: they only read and lightly update data
// that other routes already own, and they never change the behaviour of an
// existing endpoint. Tickets are otherwise only visible through the
// company-scoped client dashboard, and company names were never returned to an
// admin, so the workspace had no way to show support work or a client roster.

const TICKET_UNAVAILABLE = "Support queries are temporarily unavailable.";
const COMPANY_UNAVAILABLE = "Client companies are temporarily unavailable.";
const TEAM_UNAVAILABLE = "Team members are temporarily unavailable.";

function unavailable(res, message) {
    return res.status(503).json({ success: false, message });
}

function notFound(res, message) {
    return res.status(404).json({ success: false, message });
}

const ticketPopulate = [
    { path: "companyId", select: "name slug" },
    { path: "projectId", select: "name status" },
    { path: "createdBy", select: "name email professionalTitle" },
];

export async function listAdminTickets(_, res, next) {
    if (!isDatabaseReady()) return unavailable(res, TICKET_UNAVAILABLE);
    try {
        const tickets = await Ticket.find()
            .populate(ticketPopulate)
            .sort({ createdAt: -1 })
            .lean();
        return res.json({ success: true, data: tickets });
    } catch (error) {
        next(error);
    }
}

// Staff triage: moving a ticket between Open / In Progress / Resolved and
// re-prioritising it. Only these two fields are writable, so a mis-shaped
// request can never overwrite the ticket description or its company link.
export async function updateAdminTicket(req, res, next) {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return notFound(res, "Support query not found.");
    }
    if (!isDatabaseReady()) return unavailable(res, TICKET_UNAVAILABLE);
    try {
        const { status, priority } = req.ticketChanges;
        const changes = Object.fromEntries(
            Object.entries({ status, priority }).filter(
                ([, value]) => value !== undefined,
            ),
        );
        const ticket = await Ticket.findByIdAndUpdate(
            id,
            { $set: changes },
            { new: true, runValidators: true },
        ).populate(ticketPopulate);
        if (!ticket) return notFound(res, "Support query not found.");
        return res.json({ success: true, data: ticket });
    } catch (error) {
        if (error?.name === "ValidationError") {
            return res
                .status(400)
                .json({ success: false, message: "Invalid support query data." });
        }
        if (error.name === "CastError") {
            return notFound(res, "Support query not found.");
        }
        next(error);
    }
}

export async function listAdminCompanies(_, res, next) {
    if (!isDatabaseReady()) return unavailable(res, COMPANY_UNAVAILABLE);
    try {
        const companies = await Company.find().sort({ name: 1 }).lean();
        if (companies.length === 0) {
            return res.json({ success: true, data: [] });
        }
        const companyIds = companies.map((company) => company._id);
        // Two grouped counts plus the client contact list, fetched in parallel so
        // the roster costs three round trips total rather than two per company.
        const [clientCounts, projectRows, clients] = await Promise.all([
            User.aggregate([
                { $match: { companyId: { $in: companyIds } } },
                { $group: { _id: "$companyId", count: { $sum: 1 } } },
            ]),
            Project.find({ companyId: { $in: companyIds } })
                .select("companyId name status progress updatedAt")
                .sort({ updatedAt: -1 })
                .lean(),
            User.find({ companyId: { $in: companyIds } })
                // `companyId` must be selected or the per-company grouping below
                // loses its key and every contact collapses into "undefined".
                .select("name email phone role companyId createdAt")
                .sort({ createdAt: -1 })
                .lean(),
        ]);

        const clientCountByCompany = new Map(
            clientCounts.map((entry) => [String(entry._id), entry.count]),
        );
        const groupByCompany = (rows) => {
            const grouped = new Map();
            for (const row of rows) {
                const key = String(row.companyId);
                grouped.set(key, [...(grouped.get(key) || []), row]);
            }
            return grouped;
        };
        const clientsByCompany = groupByCompany(clients);
        const projectsByCompany = groupByCompany(projectRows);

        const data = companies.map((company) => {
            const key = String(company._id);
            const companyProjects = projectsByCompany.get(key) || [];
            return {
                ...company,
                clientCount: clientCountByCompany.get(key) || 0,
                projectCount: companyProjects.length,
                activeProjectCount: companyProjects.filter(
                    (project) => project.status !== "Completed",
                ).length,
                latestActivityAt:
                    companyProjects[0]?.updatedAt || company.updatedAt,
                clients: clientsByCompany.get(key) || [],
                projects: companyProjects,
            };
        });
        return res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
}

// Staff accounts are the only assignable project team members: clients belong to
// a company and must never appear in another company's project team.
export async function listAdminTeam(_, res, next) {
    if (!isDatabaseReady()) return unavailable(res, TEAM_UNAVAILABLE);
    try {
        const members = await User.find({ role: { $in: ["admin", "staff"] } })
            .select("name email role professionalTitle professionalBio avatarUrl")
            .sort({ name: 1 })
            .lean();
        return res.json({ success: true, data: members });
    } catch (error) {
        next(error);
    }
}