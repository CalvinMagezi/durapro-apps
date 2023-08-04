// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { supabase } from "@/lib/supabaseClient";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    console.log(req.body);
    return res.status(200).json({
      success: true,
      message: "USSD Event request received",
    });
  }

  return res
    .status(500)
    .json({ success: false, message: "Invalid request method" });
}
