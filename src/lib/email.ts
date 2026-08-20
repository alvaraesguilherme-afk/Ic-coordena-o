import "server-only";
import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error("GMAIL_USER/GMAIL_APP_PASSWORD não configurados.");
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
  return transporter;
}

export async function enviarEmail(destinatario: string, assunto: string, html: string) {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: `Impulse <${process.env.GMAIL_USER}>`,
    to: destinatario,
    subject: assunto,
    html,
  });
}
