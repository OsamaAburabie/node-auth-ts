import express from "express";
import {
  createSessionHandler,
  getCurrentSessionIdHandler,
  refreshAccessTokenHandler,
} from "../controller/auth.controller";
import validateResource from "../middleware/validateResource";
import { createSessionSchema } from "../schema/auth.schema";

const router = express.Router();

router.post(
  "/api/sessions",
  validateResource(createSessionSchema),
  createSessionHandler
);

router.post("/api/sessions/refresh", refreshAccessTokenHandler);
router.post("/api/sessions/current", getCurrentSessionIdHandler);

export default router;
