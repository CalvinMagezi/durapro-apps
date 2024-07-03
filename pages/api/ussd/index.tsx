import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { phoneNumber, text } = req.body;

    let response = "";

    try {
      if (text == "") {
        // Opening Screen
        const { data: user, error: userFetchError } = await supabase
          .from("cashback_users")
          .select("*")
          .eq("phone_number", phoneNumber);

        if (userFetchError) {
          console.log(userFetchError);
        }

        if (user?.length === 0) {
          // If it's a new user, we still add them to the database
          await supabase.from("cashback_users").insert({
            phone_number: phoneNumber,
            role: "user",
            first_login: false,
          });
        }

        response = `END Thank you for your interest in Quickset Cashback! 

We've improved our service to provide you with a better experience. Please visit https://quickset-apps.vercel.app to access our new web application.

There, you can easily redeem your codes and enjoy additional features. We appreciate your participation and look forward to serving you on our new platform!`;
      } else {
        // If the user has entered any text (trying to input a code)
        response = `END We've recently upgraded our service. To redeem your code and access more features, please visit https://quickset-apps.vercel.app

Thank you for your understanding and continued support!`;
      }
    } catch (error) {
      console.log(error);
      response = `END We apologize, but an error occurred while processing your request. Please visit https://quickset-apps.vercel.app to access our services. Thank you for your patience.`;
    }

    console.log(response);
    return res.send(response);
  }

  return res
    .status(500)
    .json({ success: false, message: "Invalid request method" });
}
