import { Router } from "express";
import {
    getPortfolioProject,
    listPortfolioProjects,
} from "../controllers/portfolioController.js";

const router = Router();

router.get("/", listPortfolioProjects);
router.get("/:projectId", getPortfolioProject);

export default router;
