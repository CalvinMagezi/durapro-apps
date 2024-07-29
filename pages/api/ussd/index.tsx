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

        response = `END Quickset Cashback: Visit our new web app at https://quickset-apps.vercel.app`;
      } else {
        // If the user has entered any text (trying to input a code)
        response = `END Quickset Cashback: Visit our new web app at https://quickset-apps.vercel.app`;
      }
    } catch (error) {
      console.log(error);
      response = `END Quickset Cashback: Visit our new web app at https://quickset-apps.vercel.app`;
    }

    console.log(response);
    return res.send(response);
  }

  return res
    .status(500)
    .json({ success: false, message: "Invalid request method" });
}
