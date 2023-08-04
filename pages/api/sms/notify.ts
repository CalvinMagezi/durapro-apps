// pages/api/sms.ts

import { NextApiRequest, NextApiResponse } from "next";
import { send } from "micro";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    // Pre-flight request. Reply successfully:
    send(res, 200);
    return;
  }

  if (req.method !== "POST") {
    send(res, 405, "Method Not Allowed");
    return;
  }

  const { phone_number } = req.body;

  console.log(phone_number);

  try {
    const response = await fetch("https://durapro-apps.vercel.app/api/sms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_token: process.env.PHIL_API_KEY,
        api_secret: process.env.PHIL_API_SECRET,
        transaction:
          "Hello from Quickset! Your cashback payment for using Quickset Tile Adhesive is being processed and you shall receive it soon. Thank you for your support. Quickset - Your Partner in Tiling Excellence.",
        phone_numbers: [`${phone_number}`],
      }),
    });

    const responseJson = await response.json();

    console.log(responseJson);

    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
}
