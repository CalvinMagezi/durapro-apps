import { CashbackCodeType } from "./../../../typings.d";
import sanityClient from "@/lib/sanity/sanityClient";
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
  if (req.method !== "POST") {
    return res
      .status(500)
      .json({ success: false, message: "Bad method call." });
  }

  const { message, api_token, api_secret } = req.body;

  const query = `*[_type == "users"]{    
  phone_number,  
}`;

  // console.log("Hello");

  try {
    const data = await sanityClient.fetch(query);

    //Remove Admin Users
    const phone_numbers = data.map((user: any) => user.phone_number);
    phone_numbers.filter((user: any) => user.phone_number === "+256770773552");

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

    if (phone_numbers.length <= 0 || !message)
      return res.status(400).json({
        success: false,
        message: "Please supply a valid phone_number and transaction",
      });

    const successful_dispatches: string[] = [];
    const failed_dispatches: string[] = [];

    if (phone_numbers.length > 0) {
      for (let i = 0; i < phone_numbers.length; i++) {
        const phone_number = phone_numbers[i];
        console.log(phone_number);
        const p = parsePhoneNumber(phone_number, "UG");
        if (!p || !p.isValid()) {
          console.log("Error parsing phone number");
        } else {
          const parsed_number = p.number;

          // console.log(parsed_number);

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
            // console.log("Successfully dispatched to " + parsed_number);
            // successful_dispatches.push(parsed_number);
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
        message: "No phone numbers supplied",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(404).json({ success: false });
  }
}
