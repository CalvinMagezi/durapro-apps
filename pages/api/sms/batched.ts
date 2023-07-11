// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Client } from "africastalking-ts";
import parsePhoneNumber from "libphonenumber-js";

const apiKey = process.env.PHIL_API_KEY;
const apiSecret = process.env.PHIL_API_SECRET;

const africasTalking = new Client({
  apiKey: process.env.NEXT_AT_API_KEY!,
  username: process.env.NEXT_AT_USERNAME!,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res
      .status(500)
      .json({ success: false, message: "Bad method call." });
  }

  const messages = req.body;

  const { api_token, api_secret } = messages[0];

  if (!api_token || !api_secret)
    return res.status(400).json({
      success: false,
      message: "Please supply a valid API Token and API Secret",
    });

  if (api_token !== apiKey || api_secret !== apiSecret) {
    return res.status(400).json({
      success: false,
      message: "Invalid API Token or API Secret",
    });
  }

  if (messages.length <= 1)
    return res.status(400).json({
      success: false,
      message: "Please supply a valid messages array",
    });

  const successful_dispatches: string[] = [];
  const failed_dispatches: string[] = [];

  if (messages.length > 1) {
    for (let i = 1; i < messages.length; i++) {
      const { target, message } = messages[i];
      const p = parsePhoneNumber(target, "UG");
      if (!p || !p.isValid()) {
        console.log("Error parsing phone number");
      } else {
        const parsed_number = p.number;

        try {
          await africasTalking
            .sendSms({
              to: [`${parsed_number}`], // Your phone number
              message: message, // Your message
              from: "Quickset", // Your shortcode or alphanumeric
            })
            .then(() => {
              successful_dispatches.push(parsed_number);
              console.log("Successfully dispatched to " + parsed_number);
            })
            .catch((error) => {
              const message = error.response.data;
              console.log(message);
              failed_dispatches.push(parsed_number);
            });
        } catch (error) {
          console.log(error);
          return res.status(400).json({
            success: false,
            message: "Error dispatching message to Africa's Talking",
          });
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Successfully dispatched messages",
      successful_dispatches,
      failed_dispatches,
    });
  } else {
    return res.status(400).json({
      success: false,
      message: "No messages supplied",
    });
  }
}
