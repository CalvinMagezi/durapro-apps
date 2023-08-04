import nodemailer from "nodemailer";
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "calvin.m.magezi@gmail.com",
    pass: process.env.EMAIL_PAS,
  },
});

export const mailOptions = {
  from: "calvin.m.magezi@gmail.com",
  to: "gregmagezi@gmail.com",
};
