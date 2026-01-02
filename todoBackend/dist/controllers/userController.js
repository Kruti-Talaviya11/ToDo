"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getMe = exports.getUser = exports.getAllUsers = void 0;
const appError_1 = __importDefault(require("../utils/appError"));
const catchAsync_1 = require("../utils/catchAsync");
const userService = __importStar(require("../services/userService"));
// ADMIN: get all users
exports.getAllUsers = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const users = await userService.getAllUsers();
    res.status(200).json({
        status: "success",
        results: users.length,
        data: { users }
    });
});
// ADMIN: get user by id
exports.getUser = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const user = await userService.findUserById(req.params.id);
    if (!user) {
        return next(new appError_1.default("User not found", 404));
    }
    delete user.password;
    res.status(200).json({
        status: "success",
        data: { user }
    });
});
// USER: get own profile
exports.getMe = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = await userService.getMe(req.user._id);
    res.status(200).json({
        status: "success",
        data: { user }
    });
});
// ADMIN: update user
exports.updateUser = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const updatedUser = await userService.updateUserById(req.params.id, req.body);
    if (!updatedUser) {
        return next(new appError_1.default("User not found", 404));
    }
    res.status(200).json({
        status: "success",
        data: { user: updatedUser }
    });
});
// ADMIN: delete user
exports.deleteUser = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const user = await userService.deleteUserById(req.params.id);
    if (!user) {
        return next(new appError_1.default("User not found", 404));
    }
    res.status(204).json({
        status: "success",
        data: null
    });
});
