import { Request, Response, NextFunction } from "express";
import jwt, { SignOptions } from "jsonwebtoken";

import userService from "../services/userService";
import { catchAsync } from "../utils/catchAsync";
import AppError from "../utils/appError";

const signToken = (user: any): string => {
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

const sendToken = async (
  user: any,
  statusCode: number,
  res: Response,
): Promise<Response> => {
  const token = signToken(user);

  // store token in DB
  await userService.saveAccessToken(user._id.toString(), token);

  user.password = undefined;
  user.accessToken = undefined;

  return res.status(statusCode).json({
    status: "success",
    token,
    data: { user },
  });
};

export const signup = catchAsync(
  async (req: Request, res: Response): Promise<Response> => {
    const { name, email, password, role } = req.body;

    const user = await userService.createUser({
      name,
      email,
      password,
      role,
    });

    return sendToken(user, 201, res);
  },
);

export const login = catchAsync(
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void | Response> => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("Email and password required", 400));
    }

    const user = await userService.findUserByEmail(email);

    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError("Invalid credentials", 401));
    }

    return sendToken(user, 200, res);
  },
);

export const logout = catchAsync(
  async (req: Request, res: Response): Promise<Response> => {
    await userService.clearAccessToken(req.user!._id.toString());

    return res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
  },
);

export const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AppError("You are not logged in", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };

    const user = await userService.findUserById(decoded.id);

    if (!user) {
      return next(new AppError("User no longer exists", 401));
    }

    // 🔒 TOKEN MISMATCH CHECK
    if (user.accessToken !== token) {
      return next(new AppError("Session expired. Please login again.", 401));
    }

    req.user = user;
    next();
  },
);

export const restrictTo =
  (...roles: Array<"user" | "admin">) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403),
      );
    }

    next();
  };
