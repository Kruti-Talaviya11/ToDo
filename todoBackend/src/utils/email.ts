import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  message: string;
}

export const sendEmail = async ({
  to,
  subject,
  message,
}: EmailOptions): Promise<void> => {
  if (
    !process.env.EMAIL_HOST ||
    !process.env.EMAIL_PORT ||
    !process.env.EMAIL_USERNAME ||
    !process.env.EMAIL_PASSWORD
  ) {
    throw new Error("Email environment variables are missing");
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false, // MUST be false for 587
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false, // fixes Windows TLS issues
    },
  });

  await transporter.sendMail({
    from: `"Todo App" <${process.env.EMAIL_USERNAME}>`,
    to,
    subject,
    text: message,
  });
};
