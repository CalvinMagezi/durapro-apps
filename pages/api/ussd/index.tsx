// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import generateUniqueId from "@/helpers/generateUniqueId";
import { mailOptions, transporter } from "@/lib/nodemailer";
import sanityClient from "@/lib/sanity/sanityClient";
import { supabase } from "@/lib/supabaseClient";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { sessionId, serviceCode, phoneNumber, text } = req.body;

    let response = "";

    if (text == "") {
      //================================================================
      //Opening Screen
      //================================================================

      try {
        const q = `*[_type == "users" && phone_number == "${phoneNumber}"][0]`;
        const user = await sanityClient.fetch(q);
        // console.log(user);

        if (!user) {
          const doc = {
            _id: generateUniqueId(),
            _type: "users",
            phone_number: phoneNumber,
            role: "user",
            first_login: false,
          };

          await sanityClient.createIfNotExists(doc).then(async () => {
            await supabase.from("cashback_users").insert({
              _id: doc._id,
              phone_number: doc.phone_number,
              role: doc.role,
              first_login: doc.first_login,
            });
          });
        }

        response = `CON Welcome to Quickset Cashback \n
          1. Redeem A New Code
          2. My Redeemed Codes`;
      } catch (error) {
        console.log(error);
        response = `CON Welcome to Quickset Cashback \n
        1. Redeem A New Code
        2. My Redeemed Codes`;
      }
    } else if (text == "1") {
      //================================================================
      //Prompt To Enter Code To Be Redeemed
      //================================================================
      response = `CON Please Enter The Code Below`;
    } else if (text.slice(0, 2) == `1*`) {
      //================================================================
      //Logic to redeem a code
      //================================================================
      const code = text.split("*")[1];

      const { data, error } = await supabase
        .from("cashback_codes")
        .select("*")
        .limit(1)
        .eq("code", Number(code));

      if (error) {
        response = `END Please ensure you've entered a valid code.`;
      }
      if (data?.length === 0) {
        response = `END Please ensure you've entered a valid code.`;
      } else {
        if (data && data[0].redeemed === true) {
          response = `END This code has already been redeemed`;
        } else {
          const { error } = await supabase
            .from("cashback_codes")
            .update({
              redeemed_by: `${phoneNumber}`,
              redeemed: true,
              redeemed_on: new Date().toISOString(),
            })
            .eq("code", Number(code));

          const { data: codes } = await supabase
            .from("cashback_codes")
            .select("*")
            .eq("redeemed_by", `${phoneNumber}`);

          if (
            codes &&
            codes.filter((code) => code.funds_disbursed == false).length > 10
          ) {
            await transporter.sendMail({
              ...mailOptions,
              subject: `User ${phoneNumber} is ready to be paid`,
              text: `User ${phoneNumber} is ready to be paid`,
              html: `<h1>User ready to be paid</h1><p>The user with phone number: ${phoneNumber} has redeemed more than 10 codes that haven't been paid for.</p>`,
            });
          }

          if (error) {
            response = `END Oops, something went wrong. Please try again`;
          } else {
            response = `END Successfully redeemed code ${code}`;
          }
        }
      }
    } else if (text == "2") {
      //================================================================
      //Gather users data
      //================================================================
      const { data: codes, error } = await supabase
        .from("cashback_codes")
        .select("*")
        .eq("redeemed_by", `${phoneNumber}`);

      if (error) {
        response = `END Oops, something went wrong. Please try again`;
      } else {
        if (codes.filter((code) => code.funds_disbursed == false).length > 10) {
          response = `END You have redeemed a total of ${codes.length} codes. You should be expecting payment soon.`;
        } else {
          response = `END You have redeemed a total of ${
            codes.length
          } codes. You have ${
            10 - codes.filter((code) => code.funds_disbursed == false).length
          } codes left to redeem until you can expect your next payment.`;
        }
      }
    } else {
      response = `END Invalid Option`;
    }
    // console.log(response);
    return res.send(response);
  }

  return res
    .status(500)
    .json({ success: false, message: "Invalid request method" });
}
