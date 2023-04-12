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
  if (req.method !== "POST") {
    return res
      .status(500)
      .json({ success: false, message: "Bad method call." });
  }

  const { phone_number, api_token, api_secret, transaction } = req.body;

  // console.log(req.body);

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

  if (!phone_number || !transaction)
    return res.status(400).json({
      success: false,
      message: "Please supply a valid phone_number and transaction",
    });

  const p = parsePhoneNumber(phone_number, "UG");

  if (!p || !p.isValid()) {
    return res.status(400).json({
      success: false,
      message: "Error parsing phone number",
    });
  }

  const parsed_number = p.number;

  // console.log(parsed_number);

  try {
    await africasTalking
      .sendSms({
        to: [`${parsed_number}`], // Your phone number
        message: transaction, // Your message
        from: "17992", // Your shortcode or alphanumeric
      })
      .then(() => {
        return res.status(200).json({
          success: true,
          message: `Successfully dispatched message: ${transaction} to ${parsed_number}`,
        });
      })
      .catch((error) => {
        const message = error.response.data;
        console.log(message);
        return res.status(400).json({
          success: false,
          message: message,
        });
      });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Error dispatching message to Africa's Talking",
    });
  }

  // return res.status(200).json({
  //   success: true,
  //   message: `Successfully dispatched message: ${transaction} to ${parsed_number}`,
  // });
}
