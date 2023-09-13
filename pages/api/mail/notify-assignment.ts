import nodemailer from "nodemailer";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(404).json({ success: false });
  }

  const { email, phone_number } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "magezitechsolutions@gmail.com",
        pass: process.env.EMAIL_PAS,
      },
    });

    const mailOptions = {
      from: "magezitechsolutions@gmail.com",
      to: email,
      subject: `New tiler assignment: ${phone_number}`,
      text: `You have been assigned a new tiler, please check your dashboard to find out more. Thank you.`,
    };

    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        console.error(error);
        res.status(500).send("Internal server error");
      } else {
        console.log("Email sent: " + info.response);
        // Mark all the codes in the spreadsheet as funds_disbursed = true
        return res.status(200).json({ success: true });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({ success: false });
  }
}
