import asyncHandler from "./asycnHandler.js";
import ejs from "ejs";
import path from "path";
import nodemailer from "nodemailer";
import { fileURLToPath } from "url";
import { dirname } from "path";
// dirnMae and  fileName to ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const sendEmail = asyncHandler(async (Option) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  const { email, template, date } = Option;
  const emailTemplate = path.join(__dirname, `../email/${template}.ejs`);
  const html = await ejs.renderFile(emailTemplate, date);
  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: Option.email,
    subject: Option.subject,
    html,
  };
  await transporter.sendMail(mailOptions);
});
export default sendEmail;
