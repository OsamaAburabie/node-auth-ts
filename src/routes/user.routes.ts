import express from "express";
import {
  createUserHandler,
  forgotPasswordHandler,
  getCurrentUserHandler,
  resetPasswordHandler,
  verifyUserHandler,
} from "../controller/user.controller";
import validateResource from "../middleware/validateResource";
import {
  createUserSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyUserSchema,
} from "../schema/user.schema";

const router = express.Router();

router.post(
  "/api/users",
  validateResource(createUserSchema),
  createUserHandler
);

router.post(
  "/api/users/verify/:id/:verificationCode",
  validateResource(verifyUserSchema),
  verifyUserHandler
);
router.post(
  "/api/users/forgotpassword",
  validateResource(forgotPasswordSchema),
  forgotPasswordHandler
);
router.post(
  "/api/users/resetpassword/:id/:passwordResetCode",
  validateResource(resetPasswordSchema),
  resetPasswordHandler
);
router.get("/api/users/me", getCurrentUserHandler);
export default router;
