import nodemailer from "nodemailer";
import { env } from "../config/env.config";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: parseInt(env.SMTP_PORT),
  secure: env.SMTP_PORT === "465",
  auth: {
    user: env.SMTP_USERNAME,
    pass: env.SMTP_PASSWORD,
  },
});

export const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
  await transporter.sendMail({
    from: env.SMTP_FROM_EMAIL,
    to,
    subject,
    html,
  });
};
