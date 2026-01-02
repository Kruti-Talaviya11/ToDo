"use strict";
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// dotenv.config({ path: './config.env' });
// const app = require('./app');
// mongoose
//   .connect(process.env.DATABASE)
//   .then(() => console.log('DB connection successful!'));
// const port = process.env.PORT || 3000;
// const server = app.listen(port, () => {
//   console.log(`App running on port ${port}...`);
// });
// process.on('unhandledRejection', err => {
//   console.log('UNHANDLED REJECTION! 💥 Shutting down...');
//   console.log(err.name, err.message);
//   server.close(() => {
//     process.exit(1);
//   });
// });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({
    path: path_1.default.join(process.cwd(), "config.env"),
});
const app_1 = __importDefault(require("./app"));
const DB = process.env.DATABASE;
mongoose_1.default
    .connect(DB)
    .then(() => {
    console.log("DB connection successful!");
});
const port = Number(process.env.PORT) || 3000;
const server = app_1.default.listen(port, () => {
    console.log(`App running on port ${port}...`);
});
process.on("unhandledRejection", (err) => {
    console.log("UNHANDLED REJECTION! Shutting down...");
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});
