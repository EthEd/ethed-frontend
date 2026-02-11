import { env } from "@/env";
import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: Number(env.EMAIL_PORT) || 587,
  secure: Number(env.EMAIL_PORT) === 465, // true for SSL (465), false for STARTTLS (587)
  auth: {
    user: env.EMAIL_USERNAME,
    pass: env.EMAIL_PASSWORD,
  },
});

export async function sendMail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}) {
  try {
    const info = await transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      text,
      html,
    });

    return info;
  } catch (err) {
    throw err;
  }
}
