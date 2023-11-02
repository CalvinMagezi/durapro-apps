// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { supabase } from "@/lib/supabaseClient";
import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { data: equipment, error } = await supabase
        .from("equipment")
        .select("*")
        .eq("needs_servicing", true);

      if (error) {
        return res.status(500).json({ success: false, data: error });
      }

      const { data: parts, error: error2 } = await supabase
        .from("equipment_part")
        .select("*")
        .eq("needs_servicing", true);

      if (error2) {
        return res.status(500).json({ success: false, data: error2 });
      }

      const emailBody = `Good morning, \n\nThe following equipment needs servicing: \n\n${
        equipment && equipment.map((item) => item.name).join(", ")
      }\n\nThe following parts need servicing: \n\n${
        parts && parts.map((item) => item.name).join(", ")
      }\n\nRegards,\n\nThe Durapro Suite.`;

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "magezitechsolutions@gmail.com",
          pass: process.env.EMAIL_PAS,
        },
      });

      const mailOptions = {
        from: "magezitechsolutions@gmail.com",
        to: "molly.ngute@durapro.co.ug",
        subject: `Items needing servicing`,
        text: emailBody,
      };

      transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
          console.error(error);
          return res.status(500).send("Internal server error");
        } else {
          console.log("Email sent: " + info.response);
          // Mark all the codes in the spreadsheet as funds_disbursed = true
          return res.status(200).json({ success: true });
        }
      });

      return res.status(200).json({
        success: true,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Invalid request method" });
    }
  }

  return res
    .status(500)
    .json({ success: false, message: "Invalid request method" });
}
