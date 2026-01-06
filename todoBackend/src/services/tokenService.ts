import { Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import { User, type IUser } from "../models/userModel";

export const signToken = (user: IUser): string => {
  if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRES_IN) {
    throw new Error("JWT environment variables are not defined");
  }
  const options: SignOptions = {
    expiresIn: process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  };

  return jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_SECRET as string,
    options,
  );
};

export const signRefreshToken = (user: IUser): string => {
  if (
    !process.env.REFRESH_TOKEN_SECRET ||
    !process.env.REFRESH_TOKEN_EXPIRES_IN
  ) {
    throw new Error("JWT environment variables are not defined");
  }
  const options: SignOptions = {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN as SignOptions["expiresIn"],
  };

  return jwt.sign(
    {
      id: user._id,
    },
    process.env.REFRESH_TOKEN_SECRET as string,
    options,
  );
};

export const sendToken = async (
  user: IUser,
  statusCode: number,
  res: Response,
): Promise<Response> => {
  const accessToken = signToken(user);
  const refreshToken = signRefreshToken(user);
  await saveRefreshToken(user._id.toString(), refreshToken);

  user.password = " ";
  user.refreshToken = " ";

  return res.status(statusCode).json({
    status: "success",
    accessToken,
    refreshToken,
    data: { user },
  });
};

export const saveRefreshToken = async (
  userId: string,
  token: string,
): Promise<IUser | null> => {
  return await User.findByIdAndUpdate(
    userId,
    {
      refreshToken: token,
    },
    { validateBeforeSave: false, new: true },
  );
};

export const verifyRefreshToken = (token: string): { id: string } => {
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error("REFRESH_TOKEN_SECRET not defined");
  }

  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET) as {
    id: string;
    type: string;
  };
};

export const clearRefreshToken = async (
  userId: string,
): Promise<IUser | null> => {
  return await User.findByIdAndUpdate(
    userId,
    { refreshToken: "null", refreshTokenExpires: undefined },
    { validateBeforeSave: false, new: true },
  );
};
const tokenService = {
  sendToken,
  signToken,
  signRefreshToken,
  verifyRefreshToken,
  saveRefreshToken,
  clearRefreshToken,
};

export default tokenService;
