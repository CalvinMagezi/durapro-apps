import nodemailer from "nodemailer";
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "magezitechsolutions@gmail.com",
    pass: process.env.EMAIL_PAS,
  },
});

export const mailOptions = {
  from: "magezitechsolutions@gmail.com",
  to: "gregmagezi@gmail.com",
};
