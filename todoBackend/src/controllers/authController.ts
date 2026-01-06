import { Request, Response, NextFunction } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import userService from "../services/userService";
import { catchAsync } from "../utils/catchAsync";
import AppError from "../utils/appError";
import { sendEmail } from "../utils/email";
import type { USER_TYPE } from "../utils/constant";

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

const signRefreshToken = (user: any): string => {
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

const sendToken = async (
  user: any,
  statusCode: number,
  res: Response,
): Promise<Response> => {
  const accessToken = signToken(user);
  const refreshToken = signRefreshToken(user);
  await userService.saveRefreshToken(user._id.toString(), refreshToken);

  user.password = undefined;
  user.accessToken = undefined;

  return res.status(statusCode).json({
    status: "success",
    accessToken,
    refreshToken,
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
    await userService.clearRefreshToken(req.user!._id.toString());

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

    req.user = user;
    next();
  },
);

export const restrictTo =
  (...roles: Array<(typeof USER_TYPE)[keyof typeof USER_TYPE]>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403),
      );
    }

    next();
  };

export const forgotPassword = catchAsync(
  async (req: Request, res: Response): Promise<void | Response> => {
    const user = await userService.findUserByEmail(req.body.email);

    if (user) {
      const resetToken = user.createPasswordResetToken();
      await user.save({ validateBeforeSave: false });

      const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      await sendEmail({
        to: user.email,
        subject: "Password Reset",
        message: `Reset your password using this link:\n${resetURL}  (valid for 10 min only)`,
      });
    }
    return res.status(200).json({
      status: "success",
      message:
        "If Email Exists then you got reset password mail Please Check Mail",
    });
  },
);

export const resetPassword = catchAsync(
  async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void | Response> => {
    const { password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      return next(new AppError("Bad request", 400));
    }
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await userService.findUserByResetToken(hashedToken);

    if (!user) {
      return next(new AppError("Token invalid or expired", 400));
    }

    await userService.updateUserPassword(user._id.toString(), password);

    return res.status(200).json({
      status: "success",
      message: "Password reset successful",
    });
  },
);

export const refreshToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
      return next(new AppError("Refresh token required", 401));
    }

    const decoded = userService.verifyRefreshToken(refreshToken);

    if (!decoded) {
      return next(new AppError("Invalid refresh token", 401));
    }

    const user = await userService.findUserById(decoded.id);

    if (!user) {
      return next(new AppError("User no longer exists", 401));
    }

    const accessToken = signToken(user);

    res.status(200).json({
      status: "success",
      accessToken,
    });
  },
);
