"use strict";
// const express = require("express");
// const cors = require("cors");
// const userRouter = require('./routes/userRouter');
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const app = express();
// app.use(cors());
// app.use(express.json());
// app.get("/", (req, res) => {
//   res.send("Todo RBAC API Running");
// });
// app.use("/api/user",userRouter)
// module.exports = app;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const userRouter_1 = __importDefault(require("./routes/userRouter"));
const taskRouter_1 = __importDefault(require("./routes/taskRouter"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/user/task", taskRouter_1.default);
app.use("/api/user", userRouter_1.default);
exports.default = app;
