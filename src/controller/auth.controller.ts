import { Request, Response } from "express";
import { get, omit } from "lodash";
import { privateFields } from "../model/user.model";
import { CreateSessionInput } from "../schema/auth.schema";
import {
  findSessionById,
  signAccessToken,
  signRefreshToken,
} from "../service/auth.service";
import { findByEmail, findUserById } from "../service/user.service";
import { verifyJwt } from "../utils/jwt";

export async function createSessionHandler(
  req: Request<{}, {}, CreateSessionInput>,
  res: Response
) {
  const { email, password } = req.body;
  const message = "Invalid email or password";
  const user = await findByEmail(email);

  if (!user) {
    return res.status(400).send(message);
  }

  if (!user.verified) {
    return res.status(400).send("please verify your email");
  }

  const isValid = await user.validatePassword(password);

  if (!isValid) {
    return res.status(400).send(message);
  }

  //sign a access token
  const accessToken = signAccessToken(user);

  //sign a refresh token
  const refreshToken = await signRefreshToken({ userId: user._id });

  //send the tokens

  return res.send({
    user: omit(user.toJSON(), privateFields),
    accessToken,
    refreshToken,
  });
}

export async function refreshAccessTokenHandler(req: Request, res: Response) {
  const refreshToken = get(req, "headers.x-refresh");

  const decoded = verifyJwt<{ session: string }>(
    refreshToken,
    "refreshTokenPublicKey"
  );

  if (!decoded) {
    return res.status(401).send("Could not refresh access token");
  }

  const session = await findSessionById(decoded.session);

  if (!session || !session.valid) {
    return res.status(401).send("Could not refresh access token");
  }

  const user = await findUserById(String(session.user));

  if (!user) {
    return res.status(401).send("Could not refresh access token");
  }

  const accessToken = signAccessToken(user);

  return res.send({ accessToken });
}

export async function getCurrentSessionIdHandler(req: Request, res: Response) {
  const refreshToken = get(req, "headers.x-refresh");

  const decoded = verifyJwt<{ session: string }>(
    refreshToken,
    "refreshTokenPublicKey"
  );

  if (!decoded) {
    return res.status(401).send("Could find session");
  }

  const session = await findSessionById(decoded.session);

  if (!session || !session.valid) {
    return res.status(401).send("Could find session");
  }

  return res.send({ session: session._id });
}
