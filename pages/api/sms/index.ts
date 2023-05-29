// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { Client } from "africastalking-ts";
import parsePhoneNumber from "libphonenumber-js";
// apiKey: "ca99a12bf7d533ab065234451913da8f24e57e7c322ed86b6238b6b07607b22e",

const apiKey = process.env.PHIL_API_KEY;
const apiSecret = process.env.PHIL_API_SECRET;

const africasTalking = new Client({
  apiKey: process.env.NEXT_AT_API_KEY!,
  username: process.env.NEXT_AT_USERNAME!,
});

type Data = {
  success: boolean;
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res
      .status(500)
      .json({ success: false, message: "Bad method call." });
  }

  const { phone_numbers, api_token, api_secret, transaction } = req.body;

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

  if (phone_numbers.length <= 0 || !transaction)
    return res.status(400).json({
      success: false,
      message: "Please supply a valid phone_number and transaction",
    });

  const successful_dispatches: string[] = [];
  const failed_dispatches: string[] = [];

  phone_numbers?.map(async (phone_number: string) => {
    const p = parsePhoneNumber(phone_number, "UG");
    if (!p || !p.isValid()) {
      console.log("Error parsing phone number");
    } else {
      const parsed_number = p.number;

      console.log(parsed_number);

      try {
        await africasTalking
          .sendSms({
            to: [`${parsed_number}`], // Your phone number
            message: transaction, // Your message
            from: "Quickset", // Your shortcode or alphanumeric
          })
          .then(() => {
            successful_dispatches.push(parsed_number);
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
  });

  return res.status(200).json({
    success: true,
    message: `Successfully dispatched messages.`,
  });
}
