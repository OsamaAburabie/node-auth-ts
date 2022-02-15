import { Request, Response } from "express";
import { nanoid } from "nanoid";
import {
  CreateUserInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyUserInput,
} from "../schema/user.schema";
import { createUser, findByEmail, findUserById } from "../service/user.service";
import log from "../utils/logger";
import sendEmail from "../utils/mailer";

export async function createUserHandler(
  req: Request<{}, {}, CreateUserInput>,
  res: Response
) {
  const body = req.body;

  try {
    const user = await createUser(body);

    await sendEmail({
      from: "test@example.com",
      to: user.email,
      subject: "Please verify your email address",
      text: `verification code is ${user.verificationCode} id is ${user._id}`,
    });

    return res.send("user created");
  } catch (e: any) {
    if (e.code === 11000) {
      return res.status(409).send("user already exists");
    }

    return res.status(500).send(e);
  }
}

export async function verifyUserHandler(
  req: Request<VerifyUserInput>,
  res: Response
) {
  const { id, verificationCode } = req.params;

  //find user by id
  const user = await findUserById(id);

  if (!user) {
    return res.status(400).send("could not verify user");
  }

  //check to see if user is verified
  if (user.verified) {
    return res.status(400).send("user already verified");
  }

  //check to see if verification code is correct
  if (user.verificationCode === verificationCode) {
    user.verified = true;
    user.save();

    return res.send("user verified successfully");
  }

  return res.status(400).send("could not verify user");
}

export async function forgotPasswordHandler(
  req: Request<{}, {}, ForgotPasswordInput>,
  res: Response
) {
  const { email } = req.body;

  const message =
    "If a user with this email exists, an email will be sent to them with instructions on how to reset their password.";

  const user = await findByEmail(email);

  if (!user) {
    log.debug(`could not find user with email ${email}`);
    console.log("hi");
    return res.status(400).send(message);
  }

  if (!user.verified) {
    log.debug(`user with email ${email} is not verified`);
    return res.status(400).send("user is not verified");
  }

  const passwordResetCode = nanoid();
  user.passwordResetCode = passwordResetCode;
  await user.save();

  await sendEmail({
    from: "test@example.com",
    to: user.email,
    subject: "Password Reset",
    text: `password reset code is ${passwordResetCode} id is ${user._id}`,
  });

  log.debug(`password reset code sent to ${user.email}`);
  return res.send(message);
}

export async function resetPasswordHandler(
  req: Request<ResetPasswordInput["params"], {}, ResetPasswordInput["body"]>,
  res: Response
) {
  const { id, passwordResetCode } = req.params;

  const { password } = req.body;

  const user = await findUserById(id);

  if (
    !user ||
    !user.passwordResetCode ||
    user.passwordResetCode !== passwordResetCode
  ) {
    return res.status(400).send("could not reset password");
  }

  user.password = password;
  user.passwordResetCode = null;
  await user.save();

  return res.send("password reset successfully");
}

export async function getCurrentUserHandler(req: Request, res: Response) {
  return res.send(res.locals.user);
}
