import mongoose, { Document, Model } from "mongoose";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import validator from "validator";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
  accessToken: string;
  refreshToken: string;
  active: boolean;
  passwordResetToken: string | null;
  passwordResetExpires: Date | null;
  comparePassword(candidate: string): Promise<boolean>;
  createPasswordResetToken(): string;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      trim: true,
      minlength: 2,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Invalid email"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },

    refreshToken: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true },
);

userSchema.pre(/^find/, function (this: mongoose.Query<any, any>) {
  this.find({ active: { $ne: false } });
});

userSchema.pre("save", async function (): Promise<void> {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.createPasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 min

  return resetToken;
};

userSchema.methods.comparePassword = async function (
  this: IUser,
  candidate: string,
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
