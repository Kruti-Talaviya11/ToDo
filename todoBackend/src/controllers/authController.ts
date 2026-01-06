import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import userService from "../services/userService";
import tokenService from "../services/tokenService";
import { catchAsync } from "../utils/catchAsync";
import AppError from "../utils/appError";
import { sendEmail } from "../utils/email";
import type { USER_TYPE } from "../utils/constant";

export const signup = catchAsync(
  async (req: Request, res: Response): Promise<Response> => {
    const { name, email, password, role } = req.body;

    const user = await userService.createUser({
      name,
      email,
      password,
      role,
    });

    return await tokenService.sendToken(user, 201, res);
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

    return await tokenService.sendToken(user, 200, res);
  },
);

export const logout = catchAsync(
  async (req: Request, res: Response): Promise<Response> => {
    await tokenService.clearRefreshToken(req.user!._id.toString());

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

    const decoded = tokenService.verifyRefreshToken(refreshToken);

    if (!decoded) {
      return next(new AppError("Invalid refresh token", 401));
    }

    const user = await userService.findUserById(decoded.id);

    if (!user) {
      return next(new AppError("User no longer exists", 401));
    }

    const accessToken = tokenService.signToken(user);
    const newRefreshToken = tokenService.signRefreshToken(user);
    await tokenService.saveRefreshToken(user._id.toString(), newRefreshToken);

    return res.status(200).json({
      status: "success",
      accessToken,
      newRefreshToken,
    });
  },
);
