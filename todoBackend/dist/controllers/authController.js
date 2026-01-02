"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictTo = exports.protect = exports.logout = exports.login = exports.signup = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userService_1 = __importDefault(require("../services/userService"));
const catchAsync_1 = require("../utils/catchAsync");
const appError_1 = __importDefault(require("../utils/appError"));
const signToken = (user) => {
    if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRES_IN) {
        throw new Error("JWT environment variables are not defined");
    }
    const options = {
        expiresIn: process.env.JWT_EXPIRES_IN
    };
    return jsonwebtoken_1.default.sign({
        id: user._id,
    }, process.env.JWT_SECRET, options);
};
const sendToken = async (user, statusCode, res) => {
    const token = signToken(user);
    // store token in DB
    await userService_1.default.saveAccessToken(user._id.toString(), token);
    user.password = undefined;
    user.accessToken = undefined;
    return res.status(statusCode).json({
        status: "success",
        token,
        data: { user }
    });
};
exports.signup = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { name, email, password, role } = req.body;
    const user = await userService_1.default.createUser({
        name,
        email,
        password,
        role
    });
    return sendToken(user, 201, res);
});
exports.login = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new appError_1.default("Email and password required", 400));
    }
    const user = await userService_1.default.findUserByEmail(email);
    if (!user || !(await user.comparePassword(password))) {
        return next(new appError_1.default("Invalid credentials", 401));
    }
    return sendToken(user, 200, res);
});
exports.logout = (0, catchAsync_1.catchAsync)(async (req, res) => {
    await userService_1.default.clearAccessToken(req.user._id.toString());
    res.status(200).json({
        status: "success",
        message: "Logged out successfully"
    });
});
exports.protect = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        return next(new appError_1.default("You are not logged in", 401));
    }
    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    const user = await userService_1.default.findUserById(decoded.id);
    if (!user) {
        return next(new appError_1.default("User no longer exists", 401));
    }
    // 🔒 TOKEN MISMATCH CHECK
    if (user.accessToken !== token) {
        return next(new appError_1.default("Session expired. Please login again.", 401));
    }
    req.user = user;
    next();
});
const restrictTo = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return next(new appError_1.default("You do not have permission to perform this action", 403));
    }
    next();
};
exports.restrictTo = restrictTo;
