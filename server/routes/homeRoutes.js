import { Router } from "express";
import { getHomeContent } from "../controllers/homeController.js";

const router = Router();

router.get("/", getHomeContent);

export default router;
